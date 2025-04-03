from django.db import models
from apps.equipment.models import Equipment


class Location(models.Model):
    id_location = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    address = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Room(models.Model):
    id_room = models.AutoField(primary_key=True)
    room_name = models.CharField(max_length=255)
    capacity = models.IntegerField()
    id_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='rooms')
    id_equipment = models.ManyToManyField(Equipment, related_name='rooms')

    def __str__(self):
        return f"{self.room_name} ({self.id_location.name})"

class TimeSlot(models.Model):
    id_time_slot = models.AutoField(primary_key=True)
    id_location = models.ForeignKey(Location, on_delete=models.CASCADE, related_name='time_slots')
    time_begin = models.TimeField()
    time_end = models.TimeField()
    TYPE_CHOICES = [
        ( "regular", "Regular"),
        ("special", "Special"),
    ]
    slot_type = models.CharField(max_length=10, choices=TYPE_CHOICES)
    
    def __str__(self):
        return f"{self.id_location.name}: {self.time_begin} - {self.time_end} ({self.slot_type})"

class SpecialTimeSlot(models.Model):
    id_time_slot = models.OneToOneField(TimeSlot, on_delete=models.CASCADE, related_name='special_slot')
    date = models.DateField()

    def __str__(self):
        return f"Special slot on {self.date} ({self.id_time_slot})"

