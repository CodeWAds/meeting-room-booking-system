from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from .models import CustomUser, UserProfile, ManagerProfile


def index(request):
    
    return HttpResponse("Hello, world. You're at the hello index.")


def get_user(request, user_id):
    user = get_object_or_404(CustomUser, user_id=user_id)  
    roles = list(user.userrole_set.values_list("role", flat=True))

    karma = None
    department = None

    if "User" in roles:
        user_profile = UserProfile.objects.filter(user_role__user=user).first()
        karma = user_profile.karma if user_profile else None  # Получаем карму, если есть

    if "Manager" in roles:
        manager_profile = ManagerProfile.objects.filter(user_role__user=user).first()
        department = manager_profile.department if manager_profile else None  # Получаем отдел, если есть

    data = {
        "user_id": user.user_id,
        "username": user.username,
        "login": user.login,
        "status": "active" if user.is_active else "banned",  # Определяем статус
        "roles": roles,
        "karma": karma,
        "deparment": department
    }
    return JsonResponse(data)  # Возвращаем JSON

