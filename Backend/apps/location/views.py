from django.shortcuts import render, get_object_or_404
import json
from django.http import JsonResponse, HttpResponse
from .models import Location, Room, TimeSlot, SpecialTimeSlot, RoomAvailability, LocationAvailability, AvailabilityReason
from datetime import datetime, timedelta
from apps.equipment.models import Equipment
from django.db.models import Count, Q
import datetime



# Create your views here.
def get_locations(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    locations = list(Location.objects.values())
    return JsonResponse({"locations": locations})

def create_location(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    data = json.loads(request.body)
    location = Location.objects.create(name=data["name"], address=data["address"])
    return JsonResponse({"id_location": location.id_location, "name": location.name, "address": location.address})

def location_detail(request, location_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    location = get_object_or_404(Location, id_location=location_id)
    return JsonResponse({"id_location": location.id_location, "name": location.name, "address": location.address})

def update_location(request, location_id):
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"})
    location = get_object_or_404(Location, id_location=location_id)
    data = json.loads(request.body)
    location.name = data.get("name", location.name)
    location.address = data.get("address", location.address)
    location.save()
    return JsonResponse({"message": "Location updated", "id_location": location.id_location})

def location_delete(request, location_id):
    if request.method != "DELETE":
        return JsonResponse({"message": "Method not supported"})
    location = get_object_or_404(Location, id_location=location_id)
    location.delete()
    return JsonResponse({"message": "Location deleted"})
    

# Views for Rooms

def get_rooms(request, location_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    
    rooms = Room.objects.filter(id_location=location_id)
    room_list = []
    
    for room in rooms:
        list_equip = list(room.id_equipment.values_list('id_equipment', flat=True))
        final_equip = []
        for equip_id in list_equip:
            equipment = get_object_or_404(Equipment, id_equipment=equip_id)
            final_equip.append({"name": equipment.name, "description": equipment.description})
        
        room_data = {
            "id_room": room.id_room,
            "room_name": room.room_name,
            "capacity": room.capacity,
            "id_equipment": final_equip
        }
        room_list.append(room_data)
    
    return JsonResponse({"rooms": room_list})

def create_room(request, location_id):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    data = json.loads(request.body)
    location = get_object_or_404(Location, id_location=location_id)
    equipment_ids = data.get("id_equipment", [])
    room = Room.objects.create(room_name=data["room_name"], capacity=data["capacity"], id_location=location)
    room.id_equipment.set(equipment_ids)
    return JsonResponse({"id_room": room.id_room, "room_name": room.room_name, "capacity": room.capacity, "id_equipment": list(room.id_equipment.values_list('id_equipment', flat=True))})

def room_detail(request, location_id, room_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    room = get_object_or_404(Room, id_room=room_id, id_location=location_id)
    list_equip = list(room.id_equipment.values_list('id_equipment', flat=True))
    final_equip = []
    for i in range(len(list_equip)):
        equipment = get_object_or_404(Equipment, id_equipment = list_equip[i])
        final_equip.append({"name" : equipment.name, "description": equipment.description})
    return JsonResponse({"id_room": room.id_room, "room_name": room.room_name, "capacity": room.capacity, "id_equipment": final_equip})

def update_room(request, location_id, room_id):
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"})
    room = get_object_or_404(Room, id_room=room_id, id_location=location_id)
    data = json.loads(request.body)
    room.room_name = data.get("room_name", room.room_name)
    room.capacity = data.get("capacity", room.capacity)
    if "id_equipment" in data:
        equipment_ids = data["id_equipment"]
        room.id_equipment.set(equipment_ids)
    room.save()
    return JsonResponse({"message": "Room updated", "id_room": room.id_room})

def delete_room(request, location_id, room_id):
    if request.method != "DELETE":
        return JsonResponse({"message": "Method not supported"})
    room = get_object_or_404(Room, id_room=room_id, id_location=location_id)
    room.delete()
    return JsonResponse({"message": "Room deleted"})

#Time_slot

def get_time_slot(request, location_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    
    time_slots = TimeSlot.objects.filter(id_location=location_id)
    time_slot_list = []
    
    for time_slot in time_slots:
        slot_data = {
            "id_time_slot": time_slot.id_time_slot,
            "time_begin": str(time_slot.time_begin),
            "time_end": str(time_slot.time_end),
            "slot_type": time_slot.slot_type
        }
        
        if time_slot.slot_type == "special":
            try:
                special_slot = SpecialTimeSlot.objects.get(id_time_slot=time_slot.id_time_slot)
                slot_data["special_date"] = special_slot.date
            except SpecialTimeSlot.DoesNotExist:
                slot_data["special_date"] = None
        
        time_slot_list.append(slot_data)
    
    return JsonResponse({"time_slots": time_slot_list})

def get_time_slot_availability(request, location_id):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    data = json.loads(request.body)
    date = data.get("date")
    if not date:
        return JsonResponse({"message": "Date is required"})
    data_date = datetime.datetime.fromisoformat(date).date()

    # Получаем текущее время
    now = datetime.datetime.now().date()

    # Сравнение
    if data_date < now:
        return JsonResponse({"message": "Date must be today or in the future"})
    
    try:
        date = datetime.datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

    # Получаем все временные слоты для указанного местоположения
    time_slots = TimeSlot.objects.filter(id_location=location_id)

    # Получаем идентификаторы временных слотов
    time_slot_ids = time_slots.values_list('id_time_slot', flat=True)

    # Получаем специальные временные слоты, используя идентификаторы
    time_slots_special = SpecialTimeSlot.objects.filter(id_time_slot__in=time_slot_ids, date=date)

    time_slot_list = []

    location = Location.objects.filter(
    Q(locationavailability__begin_datetime__lt=date) & 
    Q(locationavailability__end_datetime__gt=date)).distinct()
    if location :
        return JsonResponse({"message": "Location not available"})


    if time_slots_special:
        for time_slot in time_slots_special:
            time_slot_reg = TimeSlot.objects.filter(id_time_slot=time_slot.id_time_slot.id_time_slot).first()
            slot_data = {
            "id_time_slot": time_slot_reg.id_time_slot,
            "time_begin": str(time_slot_reg.time_begin),
            "time_end": str(time_slot_reg.time_end),
            "slot_type": time_slot_reg.slot_type,
            "special_date": time_slot.date}
        time_slot_list.append(slot_data)
    
    else:
        for time_slot in time_slots:
            if time_slot.slot_type == "special":
                continue
            slot_data = {
                "id_time_slot": time_slot.id_time_slot,
                "time_begin": str(time_slot.time_begin),
                "time_end": str(time_slot.time_end),
                "slot_type": time_slot.slot_type
            }
            time_slot_list.append(slot_data)
    
    return JsonResponse({"time_slots": time_slot_list})

def create_time_slot(request, location_id):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    data = json.loads(request.body)
    location = get_object_or_404(Location, id_location=location_id)
    if data["slot_type"] == "special":
        time_slot = TimeSlot.objects.create(
            id_location=location,
            time_begin=data["time_begin"],
            time_end=data["time_end"],
            slot_type=data["slot_type"]
        )
        time_special = SpecialTimeSlot.objects.create(
            id_time_slot=time_slot,
            date = data["date"]
        )
    if data["slot_type"] == "regular":
        time_slot = TimeSlot.objects.create(
            id_location=location,
            time_begin=data["time_begin"],
            time_end=data["time_end"],
            slot_type=data["slot_type"]
        )
    return JsonResponse({"id_time_slot": time_slot.id_time_slot, "time_begin": str(time_slot.time_begin), "time_end": str(time_slot.time_end), "slot_type": time_slot.slot_type})

def time_slot_detail(request, location_id, slot_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    time_slot = get_object_or_404(TimeSlot, id_time_slot=slot_id, id_location=location_id)
    special = getattr(time_slot, 'special_slot', None)
    if time_slot.slot_type == "regular":
        return JsonResponse({"id_time_slot": time_slot.id_time_slot, "time_begin": str(time_slot.time_begin), "time_end": str(time_slot.time_end), "slot_type": time_slot.slot_type})
    if time_slot.slot_type == "special":
        return JsonResponse({"id_time_slot": time_slot.id_time_slot, "time_begin": str(time_slot.time_begin), "time_end": str(time_slot.time_end), "slot_type": time_slot.slot_type, "special_date": special.date})
    
def update_time_slot(request, location_id, slot_id):
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"})
    time_slot = get_object_or_404(TimeSlot, id_time_slot=slot_id, id_location=location_id)
    data = json.loads(request.body)
    time_slot.time_begin = data.get("time_begin", time_slot.time_begin)
    time_slot.time_end = data.get("time_end", time_slot.time_end)
    time_slot.slot_type = data.get("slot_type", time_slot.slot_type)
    # Пытаемся получить существующий специальный слот, если он есть.
    try:
        special = SpecialTimeSlot.objects.get(id_time_slot=slot_id)
    except SpecialTimeSlot.DoesNotExist:
        special = None
    if time_slot.slot_type == "special":
        # Если специального слота нет, при создании нового требуется передать дату.
        if not special:
            if "date" not in data:
                return JsonResponse({"error": "Дата обязательна для специальных временных слотов"}, status=400)
            special = SpecialTimeSlot.objects.create(id_time_slot=time_slot, date=data["date"])
        else:
            special.date = data.get("date", special.date)
            special.save()
    else:
        # Если слот не специальный, удаляем существующий специальный слот, если он есть.
        if special:
            special.delete()

    time_slot.save()
    return JsonResponse({"message": "TimeSlot обновлен", "id_time_slot": time_slot.id_time_slot})

def delete_time_slot(request, location_id, slot_id):
    if request.method != "DELETE":
        return JsonResponse({"message": "Method not supported"})
    time_slot = get_object_or_404(TimeSlot, id_time_slot=slot_id, id_location=location_id)
    time_slot.delete()
    return JsonResponse({"message": "TimeSlot deleted"})
    


def get_available_rooms(request):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid metod"})

    data = json.loads(request.body)
    id_location = data.get('location')
    date_str = data.get('date')
    user_id = data.get('user_id')
    time_slot_ids = data.get('time_slot', [])
    
    if not all([id_location, date_str, time_slot_ids, user_id]):
        return JsonResponse({"error": "Missing required parameters"}, status=400)
                
    

    try:
        date = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
    except ValueError:
        return JsonResponse({"error": "Invalid date format. Use YYYY-MM-DD"}, status=400)

    try:
        time_slots = TimeSlot.objects.filter(id_time_slot__in=time_slot_ids)
        if not time_slots.exists():
            return JsonResponse({"error": "No valid time slots found"}, status=400)
    except Exception as e:
        return JsonResponse({"error": "Error retrieving time slots"}, status=500)

    
    # Проверяем существование локации
    if not Location.objects.filter(id_location=id_location).exists():
        return JsonResponse({"error": "Location not found"}, status=404)
    
    available_rooms = Room.objects.filter(
            id_location=id_location
        ).exclude(Q(bookings__date=date) & Q(bookings__slot__in=time_slots) |
    Q(roomavailability__begin_datetime__lt=date) & Q(roomavailability__end_datetime__gt=date)).distinct().select_related('id_location')
    from apps.user.models import FavoriteRoom
    location = Location.objects.filter(id_location= id_location)
    room_list = [
            {
                "id": room.id_room,
                "name": room.room_name,
                "location": room.id_location.name,
                "capacity": room.capacity,
                "favourite": FavoriteRoom.objects.filter(room = room, user__pk = user_id).exists()
            }
            for room in available_rooms
        ]
    

    return JsonResponse({
            "date": date_str,
            "location_id": id_location,
            "available_rooms": room_list
        })



def availability_room(request, location_id, room_id):
        if request.method != "GET":
            return JsonResponse({"message": "Invalid metod"})
        """
        Получить все периоды недоступности для комнаты
        GET /locations/<location_id>/rooms/<room_id>/availability/
        """
        room = get_object_or_404(Room, id_room=room_id, id_location=location_id)
        availabilities = RoomAvailability.objects.filter(room=room)
        
        data = [
            {
                'id': av.id_status_room,
                'room_id': av.room.id_room,
                'begin_datetime': av.begin_datetime,
                'end_datetime': av.end_datetime,
                'reason': {
                    'id': av.reason.id_reason,
                    'name': av.reason.name
                } if av.reason else None
            }
            for av in availabilities
        ]
        
        return JsonResponse({"Availability":data})

def create_availability_room(request, location_id, room_id):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid metod"})
    """
    Создать новый период недоступности
    POST /locations/<location_id>/rooms/<room_id>/availability/create_availability/
    """
    room = get_object_or_404(Room, id_room=room_id, id_location=location_id)
    data = json.loads(request.body)
    required_fields = ['begin_datetime', 'end_datetime']
    for field in required_fields:
        if field not in data:
            return JsonResponse(
                {'error': f'Отсутствует обязательное поле: {field}'}
            )
    
    try:
        begin = datetime.fromisoformat(data['begin_datetime'])
        end = datetime.fromisoformat(data['end_datetime'])
        
        if begin >= end:
            return JsonResponse(
                {'error': 'Дата начала должна быть раньше даты окончания'}
            )
        
        # Создание записи
        id_reason = data.get('reason_id', None)
        if id_reason:
            reason = AvailabilityReason.objects.filter(id_reason = id_reason)
        else:
            reason = None
        
        availability = RoomAvailability.objects.create(
            room=room,
            begin_datetime=begin,
            end_datetime=end,
            reason_id=reason
        )
        
        response_data = {
            'id': availability.id_status_room,
            'room_id': availability.room.id_room,
            'begin_datetime': availability.begin_datetime,
            'end_datetime': availability.end_datetime,
            'reason_id': reason.name if reason else None,
            'message': 'Период недоступности успешно создан'
        }
        
        return JsonResponse(response_data)
    
    except ValueError as e:
        return JsonResponse({'error': 'Неверный формат даты. Используйте ISO формат (YYYY-MM-DD HH:MM:SS)'})
    
def availability_detail_room(request, location_id, room_id, availability_id):
    if request.method != "GET":
        return JsonResponse({"message": "Invalid metod"})
    """
    Получить детали периода недоступности
    GET /locations/<location_id>/rooms/<room_id>/availability/<availability_id>/
    """
    availability = get_object_or_404(
        RoomAvailability, 
        id_status_room=availability_id, 
        room=room_id
    )
    
    data = {
        'id': availability.id_status_room,
        'room_id': availability.room.id_room,
        'begin_datetime': availability.begin_datetime,
        'end_datetime': availability.end_datetime,
        'reason': {
            'id': availability.reason.id,
            'name': availability.reason.name
        } if availability.reason else None,
        'location_id': location_id
    }
    return JsonResponse(data)

def update_availability_room(request, location_id, room_id, availability_id):
    if request.method != "PATCH":
        return JsonResponse({"message": "Invalid metod"})
    """
    Обновить период недоступности
    PUT /locations/<location_id>/rooms/<room_id>/availability/<availability_id>/update
    """
    availability = get_object_or_404(
        RoomAvailability, 
        id_status_room=availability_id, 
        room=room_id
    )
    data = json.loads(request.body)
    
    # Обновление полей
    if 'begin_datetime' in data:
        availability.begin_datetime = datetime.fromisoformat(data['begin_datetime'])
    if 'end_datetime' in data:
        availability.end_datetime = datetime.fromisoformat(data['end_datetime'])
    if 'reason_id' in data:
        availability.reason = data['reason_id']
    
    # Проверка корректности дат
    if availability.begin_datetime >= availability.end_datetime:
        return JsonResponse(
            {'error': 'Дата начала должна быть раньше даты окончания'})
    
    availability.save()
    
    response_data = {
        'id': availability.id_status_room,
        'room_id': availability.room.id_room,
        'begin_datetime': availability.begin_datetime,
        'end_datetime': availability.end_datetime,
        'reason_id': availability.reason,
        'message': 'Период недоступности успешно обновлен'
    }
    
    return JsonResponse(response_data)

def delete_availability_room(request, location_id, room_id, availability_id):
        if request.method != "DELETE":
            return JsonResponse({"message": "Invalid metod"})
        """
        Удалить период недоступности
        DELETE /locations/<location_id>/rooms/<room_id>/availability/<availability_id>/delete
        """
        availability = get_object_or_404(
            RoomAvailability, 
            id_status_room=availability_id, 
            room=room_id
        )
        
        try:
            availability.delete()
            return JsonResponse({'message': 'Период недоступности успешно удален'})
        except Exception as e:
            return JsonResponse({'error': str(e)})
        

def availability_loc(request, location_id):
        if request.method != "GET":
            return JsonResponse({"message": "Invalid metod"})
        """
        Получить все периоды недоступности для комнаты
        GET /locations/<location_id>/rooms/<room_id>/availability/
        """
        location = get_object_or_404(Location, id_location=location_id)
        availabilities = LocationAvailability.objects.filter(location_id=location_id)
        
        data = [
            {
                'id': av.id_status_loc,
                'location': av.location.id_location,
                'begin_datetime': av.begin_datetime,
                'end_datetime': av.end_datetime,
                'reason': {
                    'id': av.reason.id_reason,
                    'name': av.reason.name
                } if av.reason else None
            }
            for av in availabilities
        ]
        
        return JsonResponse({"Availabilities" : data})

def create_availability_loc(request, location_id):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid metod"})
    """
    Создать новый период недоступности
    POST /locations/<location_id>/rooms/<room_id>/availability/create_availability/
    """
    location = get_object_or_404(Location, id_location=location_id)
    data = json.loads(request.body)

    required_fields = ['begin_datetime', 'end_datetime']
    for field in required_fields:
        if field not in data:
            return JsonResponse(
                {'error': f'Отсутствует обязательное поле: {field}'}
            )
    
    try:
        begin = datetime.fromisoformat(data['begin_datetime'])
        end = datetime.fromisoformat(data['end_datetime'])
        
        if begin >= end:
            return JsonResponse(
                {'error': 'Дата начала должна быть раньше даты окончания'}
            )
        
        # Создание записи
        availability = LocationAvailability.objects.create(
            location=location,
            begin_datetime=begin,
            end_datetime=end,
            reason_id=data.get('reason_id')
        )
        
        response_data = {
            'id': availability.id_status_loc,
            'location_id': availability.location.id_location,
            'begin_datetime': availability.begin_datetime,
            'end_datetime': availability.end_datetime,
            'reason_id': availability.reason,
            'message': 'Период недоступности успешно создан'
        }
        
        return JsonResponse(response_data)
    
    except ValueError as e:
        return JsonResponse({'error': 'Неверный формат даты. Используйте ISO формат (YYYY-MM-DD HH:MM:SS)'})
    
def availability_detail_loc(request, location_id, availability_id):
    if request.method != "GET":
        return JsonResponse({"message": "Invalid metod"})
    """
    Получить детали периода недоступности
    GET /locations/<location_id>/rooms/<room_id>/availability/<availability_id>/
    """
    availability = get_object_or_404(
        LocationAvailability, 
        id_status_loc=availability_id, 
        location_id=location_id
    )
    
    data = {
        'id': availability.id_status_loc,
        'room_id': availability.location.id_location,
        'begin_datetime': availability.begin_datetime,
        'end_datetime': availability.end_datetime,
        'reason': {
            'id': availability.reason.id_reason,
            'name': availability.reason.name
        } if availability.reason else None,
        'location_id': location_id
    }
    return JsonResponse(data)

def update_availability_loc(request, location_id, availability_id):
    if request.method != "PATCH":
        return JsonResponse({"message": "Invalid metod"})
    """
    Обновить период недоступности
    PUT /locations/<location_id>/rooms/<room_id>/availability/<availability_id>/update
    """
    data = data = json.loads(request.body)
    availability = get_object_or_404(
        LocationAvailability, 
        id_status_loc=availability_id, 
        location_id=location_id
    )
    
    # Обновление полей
    if 'begin_datetime' in data:
        availability.begin_datetime = datetime.fromisoformat(data['begin_datetime'])
    if 'end_datetime' in data:
        availability.end_datetime = datetime.fromisoformat(data['end_datetime'])
    if 'reason_id' in data:
        availability.reason = data['reason_id']
    
    # Проверка корректности дат
    if availability.begin_datetime >= availability.end_datetime:
        return JsonResponse(
            {'error': 'Дата начала должна быть раньше даты окончания'})
    
    availability.save()
    
    response_data = {
        'id': availability.id_status_loc,
        'location_id': availability.location.id_location,
        'begin_datetime': availability.begin_datetime,
        'end_datetime': availability.end_datetime,
        'reason_id': availability.reason,
        'message': 'Период недоступности успешно обновлен'
    }
    
    return JsonResponse(response_data)

def delete_availability_loc(request, location_id, availability_id):
        if request.method != "DELETE":
            return JsonResponse({"message": "Invalid metod"})
        """
        Удалить период недоступности
        DELETE /locations/<location_id>/rooms/<room_id>/availability/<availability_id>/delete
        """
        availability = get_object_or_404(
            LocationAvailability, 
            id_status_loc=availability_id, 
            location=location_id
        )
        
        try:
            availability.delete()
            return JsonResponse({'message': 'Период недоступности успешно удален'})
        except Exception as e:
            return JsonResponse({'error': str(e)})


def availability_reason(request):
    if request.method != "GET":
        return JsonResponse({"message": "Invalid metod"})
    """
    Получить все причины недоступности
    GET /availability/reason/
    """
    reasons = AvailabilityReason.objects.all()
    
    data = [
        {
            'id': reason.id_reason,
            'name': reason.name
        }
        for reason in reasons
    ]
    
    return JsonResponse(data)


def create_availability_reason(request):
    if request.method != "POST":
        return JsonResponse({"message": "Invalid metod"})
    """
    Создать новую причину недоступности
    POST /availability/reason/create_availability/
    """
    if 'name' not in request.data or not request.data['name'].strip():
        return JsonResponse({'error': 'Поле "name" обязательно и не может быть пустым'})
    try:
        reason = AvailabilityReason.objects.create(
            name=request.data['name'].strip()
        )
        
        response_data = {
            'id': reason.id_reason,
            'name': reason.name,
            'message': 'Причина недоступности успешно создана'
        }
        
        return JsonResponse(response_data)
    
    except Exception as e:
        return JsonResponse({'error': str(e)})

def update_availability_reason(request):
    if request.method != "PATCH":
        return JsonResponse({"message": "Invalid metod"})
    """
    Обновить причину недоступности
    PUT /availability/reason/update/
    """
    if 'id' not in request.data:
        return JsonResponse({'error': 'Необходимо указать ID причины для обновления'})
    
    if 'name' not in request.data or not request.data['name'].strip():
        return JsonResponse({'error': 'Поле "name" обязательно и не может быть пустым'})
    
    try:
        reason = get_object_or_404(AvailabilityReason, id_reason=request.data['id'])
        reason.name = request.data['name']
        reason.save()
        response_data = {
            'id': reason.id_reason,
            'name': reason.name,
            'message': 'Причина недоступности успешно обновлена'
        }
        
        return JsonResponse(response_data)
    
    except Exception as e:
        return JsonResponse({'error': str(e)})


def delete_availability_reason(request):
    if request.method != "DELETE":
        return JsonResponse({"message": "Invalid metod"})
    """
    Удалить причину недоступности
    DELETE /availability/reason/delete/
    """
    if 'id' not in request.data:
        return JsonResponse({'error': 'Необходимо указать ID причины для удаления'})
    
    try:
        reason = get_object_or_404(AvailabilityReason, id_reason=request.data['id'])
        reason.delete()
        
        return JsonResponse({'message': 'Причина недоступности успешно удалена'})
    
    except Exception as e:
        return JsonResponse({'error': str(e)})

