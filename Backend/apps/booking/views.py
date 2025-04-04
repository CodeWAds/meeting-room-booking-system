import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Booking,  TimeSlot


def get_booking(request):
    """ Получение всех бронирований """
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    bookings = Booking.objects.all()  # Получаем объекты, 
    final_list = []
    for currect_booking in bookings:
        currect_booking = {
            "id_booking": currect_booking.id_booking,
            "user": currect_booking.user.id,
            "room": currect_booking.room.id,
            "date": currect_booking.date,
            "review": currect_booking.review,
            "status": currect_booking.status,
            "time_slot": list(currect_booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type")),
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
    
    booking_obj = Booking.objects.create(
        user_id=data["user_id"],
        room_id=data["room_id"],
        date=data["date"],
        review=data.get("review"),
        status=data.get("status", "pending")
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
        "user_id": booking.user_id,
        "room_id": booking.room_id,
        "date": booking.date.isoformat(),
        "review": booking.review,
        "status": booking.status,
        "time_slot": list(booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type"))
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
    bookings = Booking.objects.filter(user_id=user_id)
    
    final_list = []
    for booking in bookings:
        booking_data = {
            "id_booking": booking.id_booking,
            "user": booking.user.user_id,  # Используем user_id вместо id
            "room": booking.room.id_room,
            "date": booking.date.isoformat(),
            "review": booking.review,
            "status": booking.status,
            "time_slot": list(booking.slot.values("id_time_slot", "time_begin", "time_end", "slot_type")),
        }
        final_list.append(booking_data)
    
    return JsonResponse({"UserBookings": final_list})