from django.db import models
from apps.user.models import CustomUser
from apps.location.models import Room, TimeSlot

class Booking(models.Model):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("no_show", "No Show"),
        ("confirmed", "Confirmed"),
        ("cancelled_by_user", "Cancelled by User"),
        ("cancelled_by_admin", "Cancelled by Admin"),
        ("completed", "Completed"),
    ]

    id_booking = models.AutoField(primary_key=True)
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="bookings")
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name="bookings")
    date = models.DateField()
    review = models.IntegerField(null=True, blank=True)  # Оценка может быть необязательной
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    slot = models.ManyToManyField(TimeSlot) 
    code = models.IntegerField()

    def __str__(self):
        return f"Booking {self.id_booking} - {self.user.username} - {self.status}"


