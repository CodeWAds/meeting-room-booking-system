import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.db.models import Count, Q
from datetime import timedelta
from django.utils import timezone
from django.http import JsonResponse
from .models import Booking, TimeSlot, Room
from apps.location.models import Location, TimeSlot, SpecialTimeSlot
from apps.user.models import FavoriteRoom
import hashlib, random


def generate_code(data):
    data = {
    "user_id": data["user_id"],
    "room_id": data["room_id"],
    "date": data["date"],
    "review": data.get("review"),
    "status": data.get("status", "pending"),
    "slot_ids": data["slot"]
    }

    data_string = json.dumps(data, sort_keys=True)

    hash_object = hashlib.sha256(data_string.encode())
    hash_hex = hash_object.hexdigest()
    seed = int(hash_hex, 16)
    random.seed(seed)
    code = random.randint(100000, 999999)  
    return code
    

def verify_code(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    data = json.loads(request.body)
    """ Получение информации о конкретном бронировании """
    booking = get_object_or_404(Booking, code=data["code"])
    return JsonResponse({
        "id_booking": booking.id_booking,
        "user_id": booking.user.id_user,
        "room_id": booking.room.id_room,
        "room_name": booking.room.room_name,
        "location_name": booking.room.id_location.name,
        "capacity": booking.room.capacity,
        "date": booking.date.isoformat(),
        "review": booking.review,
        "status": booking.status,
        "time_slot": list(booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type")),
        "verify code": booking.code
    })

def get_booking(request):
    """ Получение всех бронирований """
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    bookings = Booking.objects.all()  # Получаем объекты, 
    final_list = []
    for currect_booking in bookings:
        currect_booking = {
            "id_booking": currect_booking.id_booking,
            "room_name": currect_booking.room.room_name,
            "location_name": currect_booking.room.id_location.name,
            "capacity": currect_booking.room.capacity,
            "user": currect_booking.user.id_user,
            "room": currect_booking.room.id_room,
            "date": currect_booking.date,
            "review": currect_booking.review,
            "status": currect_booking.status,
            "time_slot": list(currect_booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type")),
            "verify code": currect_booking.code
        }
        final_list.append(currect_booking)
    return JsonResponse({"Booking": final_list})
    


def create_booking(request):
    """ Создание нового бронирования """
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    data = json.loads(request.body)
    
    # Ensure that data["slot"] is a list
    slot_ids = data["slot"]
    if not isinstance(slot_ids, list):
        slot_ids = [slot_ids]
    code = generate_code(data)

    booking_obj = Booking.objects.create(
        user_id=data["user_id"],
        room_id=data["room_id"],
        date=data["date"],
        review=data.get("review"),
        status=data.get("status", "pending"),
        code = code
    )
    
    time_slots = TimeSlot.objects.filter(id_time_slot__in=slot_ids)
    booking_obj.slot.add(*time_slots)
    
    return JsonResponse({"message": "Booking created", "id_booking": booking_obj.id_booking})


def booking_detail(request, booking_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    """ Получение информации о конкретном бронировании """
    booking = get_object_or_404(Booking, id_booking=booking_id)
    return JsonResponse({
        "id_booking": booking.id_booking,
        "user_id": booking.user.id_user,
        "room_id": booking.room.id_room,
        "room_name": booking.room.room_name,
        "location_name": booking.room.id_location.name,
        "capacity": booking.room.capacity,
        "date": booking.date.isoformat(),
        "review": booking.review,
        "status": booking.status,
        "time_slot": list(booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type")),
        "verify code": booking.code
    })


def update_booking(request, booking_id):
    """ Обновление данных бронирования """
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"})
    
    booking = get_object_or_404(Booking, id_booking=booking_id)
    data = json.loads(request.body)
    booking.date = data.get("date", booking.date)
    booking.review = data.get("review", booking.review)
    booking.status = data.get("status", booking.status)
    slot_ids = data.get("slot")
    if slot_ids is not None:  # Проверяем, передан ли slot
        time_slots = TimeSlot.objects.filter(id_time_slot__in=slot_ids) if slot_ids else []
        booking.slot.set(time_slots)
    booking.save()
    return JsonResponse({"message": "Booking updated", "id_booking": booking.id_booking})


def delete_booking(request, booking_id):
    if request.method != "DELETE":
        return JsonResponse({"message": "Method not supported"})
    booking = get_object_or_404(Booking, id_booking=booking_id)
    booking.delete()
    return JsonResponse({"message": "Booking deleted"})
    

def get_user_bookings(request, user_id):
    """ Получение всех бронирований для конкретного пользователя """
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    bookings = Booking.objects.filter(user=user_id)
    
    final_list = []
    for booking in bookings:
        favorite = FavoriteRoom.objects.filter(room = booking.room, user = booking.user).exists()
        booking_data = {
            "id_booking": booking.id_booking,
            "room_id": booking.room.id_room,
            "room_name": booking.room.room_name,
            "location_name": booking.room.id_location.name,
            "user": booking.user.id_user,  
            "room": booking.room.id_room,
            "date": booking.date.isoformat(),
            "review": booking.review,
            "status": booking.status,
            "time_slot": list(booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type")),
            "favorite": favorite,
            "verify code": booking.code
        }
        final_list.append(booking_data)
    
    return JsonResponse({"UserBookings": final_list})


def room_time_slot_stats(request, location_id, room_id):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET method allowed"}, status=405)

    # Проверяем существование комнаты
    room = get_object_or_404(Room, id_room=room_id, id_location=location_id)

    # Получаем и валидируем период
    period = request.GET.get('period', 'day').lower()
    if period not in ['day', 'week', 'month', 'all']:
        return JsonResponse({"error": "Invalid period. Use: day, week, month or all"}, status=400)

    # Определяем временной диапазон
    today = timezone.now().date()
    start_date = None
    
    if period == 'day':
        start_date = today
    elif period == 'week':
        start_date = today - timedelta(days=6)
    elif period == 'month':
        start_date = today - timedelta(days=29)

    # Получаем все временные слоты для локации
    time_slots = TimeSlot.objects.filter(id_location=location_id)

    # Собираем статистику
    stats = []
    total_bookings = 0

    for slot in time_slots:
        # Для специальных слотов
        if slot.slot_type == "special":
            try:
                special_date = slot.special_slot.date
                # Проверяем попадает ли дата в период (если период не 'all')
                if period != 'all' and (special_date < start_date or special_date > today):
                    continue
                    
                # Считаем бронирования для этого слота и даты
                count = Booking.objects.filter(
                    room=room,
                    slot=slot,
                    date=special_date
                ).count()
                
                stats.append({
                    "slot_id": slot.id_time_slot,
                    "time_range": f"{slot.time_begin.strftime('%H:%M')}-{slot.time_end.strftime('%H:%M')}",
                    "slot_type": "special",
                    "bookings_count": count,
                    "date": special_date.strftime("%Y-%m-%d")
                })
                total_bookings += count
                
            except SpecialTimeSlot.DoesNotExist:
                continue
                
        # Для регулярных слотов
        else:
            # Базовый запрос для регулярных слотов
            bookings_query = Booking.objects.filter(
                room=room,
                slot=slot
            )
            
            # Применяем фильтр по дате если период не 'all'
            if period != 'all':
                bookings_query = bookings_query.filter(
                    date__gte=start_date,
                    date__lte=today
                )
            
            count = bookings_query.count()
            
            stats.append({
                "slot_id": slot.id_time_slot,
                "time_range": f"{slot.time_begin.strftime('%H:%M')}-{slot.time_end.strftime('%H:%M')}",
                "slot_type": "regular",
                "bookings_count": count,
                "date": None
            })
            total_bookings += count

    # Сортируем слоты по времени начала
    stats.sort(key=lambda x: x["time_range"])

    return JsonResponse({
        "location_id": location_id,
        "room_id": room_id,
        "room_name": room.room_name,
        "period": period,
        "time_slot_stats": stats,
        "total_bookings": total_bookings,
        "period_range": {
            "start": start_date.strftime("%Y-%m-%d") if period != 'all' else "All time",
            "end": today.strftime("%Y-%m-%d") if period != 'all' else "All time"
        }
    })


def get_upcoming_bookings_for_notifications(request):
    """Получение предстоящих бронирований со статусом 'pending' с информацией о локации"""
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"}, status=405)

    try:
        now = timezone.now()
        time_threshold = now + timedelta(hours=24)
        
        upcoming_bookings = Booking.objects.filter(
            date__gte=now.date(),
            date__lte=time_threshold.date(),
            user__id_telegram__isnull=False,
            status="pending"
        ).select_related('user', 'room', 'room__id_location').prefetch_related('slot')
        
        result = []
        for booking in upcoming_bookings:
            # Фильтр слотов с проверкой даты
            slots_filter = booking.slot.all()
            if booking.date == now.date():
                slots_filter = slots_filter.filter(time_begin__gte=now.time())
            
            if slots_filter.exists() or booking.date > now.date():
                # Получаем информацию о локации из связанной модели
                location = booking.room.id_location
                
                result.append({
                    "id_user": booking.user.id_user,
                    "telegram_id": booking.user.id_telegram,
                    "username": booking.user.username,
                    "booking_id": booking.id_booking,
                    "room_id": booking.room.id_room,
                    "room_name": booking.room.room_name,
                    "location_id": location.id_location if location else None,
                    "location_name": location.name if location else "Не указана",
                    "location_address": location.address if location else "Адрес не указан",
                    "date": booking.date.strftime("%Y-%m-%d"),
                    "time_slots": [
                        {
                            "time_begin": slot.time_begin.strftime("%H:%M"),
                            "time_end": slot.time_end.strftime("%H:%M")
                        }
                        for slot in slots_filter
                    ],
                    "status": booking.status
                })
        
        return JsonResponse({"notifications": result}, status=200)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)