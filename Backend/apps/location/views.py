from django.shortcuts import render, get_object_or_404
import json
from django.http import JsonResponse, HttpResponse
from .models import Location, Room, TimeSlot, SpecialTimeSlot
import datetime
from apps.equipment.models import Equipment



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
    rooms = list(Room.objects.filter(id_location=location_id).values())
    return JsonResponse({"rooms": rooms})

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
    time_slots = list(TimeSlot.objects.filter(id_location=location_id).values())
    return JsonResponse({"time_slots": time_slots})

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
    special = get_object_or_404(SpecialTimeSlot, id_time_slot = slot_id)
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
    if request.method != "GET":
        return JsonResponse({"message": "Invalid metod"})
    data = json.loads(request.body)
    location_id = data['location']  
    date_str = data['date']    
    time_slot_id = request.get('timeslot')  
    time_slot = list(TimeSlot.objects.filter(id_time_slot = time_slot_id))

    date = datetime.strptime(date_str, "%Y-%m-%d")
    
    available_rooms = Room.objects.filter(location_id=location_id)

    available_rooms = available_rooms.exclude(
        booking__date=date,
        booking__time_slots__in=[time_slot],
    )
    room_list = [
        {"name": room.name, "location": room.location.name, "capacity": room.capacity}
        for room in available_rooms
    ]

    return JsonResponse({"available_rooms": room_list})