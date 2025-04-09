# Create your views here.
from django.shortcuts import get_object_or_404
from .models import Equipment
from django.http import JsonResponse, HttpResponse
import json


# Create
def equipment_create(request):
    if request.method != 'POST':
        return JsonResponse({"message": "Method not supported"}, status=405)
    data = json.loads(request.body)
    equipment = Equipment.objects.create(name=data["name"],  description=data["description"])
    return JsonResponse({"id_equipment": equipment.id_equipment, "name": equipment.name, "description": equipment.description})
  
# Read
def get_equipments(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    equipments = list(Equipment.objects.values())
    return JsonResponse({"locations": equipments})

def equipment_detail(request, equipment_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    equipment = get_object_or_404(Equipment, id_equipment=equipment_id)
    return JsonResponse({"equipment_id": equipment.id_equipment, "name": equipment.name, "address": equipment.description})


# Update
def equipment_update(request, equipment_id):
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"})
    equipment = get_object_or_404(Equipment, id_equipment=equipment_id)
    data = json.loads(request.body)
    equipment.name = data.get("name", equipment.name)
    equipment.description = data.get("description", equipment.description)
    equipment.save()
    return JsonResponse({"message": "Equipment updated", "equipment_id": equipment.id_equipment})

# Delete
def equipment_delete(request, equipment_id):
    if request.method != "DELETE":
        return JsonResponse({"message": "Method not supported"})
    equipment = get_object_or_404(Equipment, id_equipment=equipment_id)
    equipment.delete()
    return JsonResponse({"message": "Equipment deleted"})