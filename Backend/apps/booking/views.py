import json
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from .models import Booking, BookingTimeSlot


def get_booking(request):
    """ Получение всех бронирований """
    bookings = list(Booking.objects.all().values())
    final_list = []
    for  currect_booking in range(len(bookings)):
        booking_time_slot = BookingTimeSlot.objects.filter(id_booking=currect_booking["id_booking"].values("slot_id"))
        currect_booking["time_slot"] = list(booking_time_slot)
        final_list.append(currect_booking)
    return JsonResponse(final_list, safe=False)


def create_booking(request):
    """ Создание нового бронирования """
    if request.method == "POST":
        data = json.loads(request.body)
        booking = Booking.objects.create(
            user_id=data["user_id"],
            room_id=data["room_id"],
            date=data["date"],
            review=data.get("review"),
            status=data.get("status", "pending")
        )
        return JsonResponse({"message": "Booking created", "id_booking": booking.id_booking})
    return JsonResponse({"error": "Invalid request method"}, status=405)


def booking_detail(request, booking_id):
    """ Получение информации о конкретном бронировании """
    booking = get_object_or_404(Booking, id_booking=booking_id)
    return JsonResponse({
        "id_booking": booking.id_booking,
        "user_id": booking.user_id,
        "room_id": booking.room_id,
        "date": str(booking.date),
        "review": booking.review,
        "status": booking.status
    })


def update_booking(request, booking_id):
    """ Обновление данных бронирования """
    if request.method == "POST":
        booking = get_object_or_404(Booking, id_booking=booking_id)
        data = json.loads(request.body)

        booking.date = data.get("date", booking.date)
        booking.review = data.get("review", booking.review)
        booking.status = data.get("status", booking.status)

        booking.save()
        return JsonResponse({"message": "Booking updated", "id_booking": booking.id_booking})
    return JsonResponse({"error": "Invalid request method"}, status=405)


def delete_booking(request, booking_id):
    """ Удаление бронирования """
    if request.method == "DELETE":
        booking = get_object_or_404(Booking, id_booking=booking_id)
        booking.delete()
        return JsonResponse({"message": "Booking deleted"})
    return JsonResponse({"error": "Invalid request method"}, status=405)
