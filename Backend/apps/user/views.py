from django.shortcuts import render
from django.http import JsonResponse, HttpResponse
from django.shortcuts import get_object_or_404
from .models import CustomUser, UserProfile, ManagerProfile, UserRole
from django.core.exceptions import ValidationError, ObjectDoesNotExist
import  json


def get_users(request):
    try:
        # Получаем всех пользователей
        users = CustomUser.objects.all()
        
        # Создаем список, в который будем добавлять информацию о каждом пользователе
        user_data = []

        for user in users:
            # Получаем информацию о ролях
            roles = UserRole.objects.filter(user=user)
            role_names = [role.role for role in roles]
            user_info = {
                    "username": user.username,
                    "roles": role_names,    
            }
            user_data.append(user_info)
        return JsonResponse({'users': user_data}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_user(request, user_id):
    user = get_object_or_404(CustomUser, user_id=user_id)  
    roles = list(user.userrole_set.values_list("role", flat=True))

    karma = None
    department = None

    if "User" in roles:
        user_profile = UserProfile.objects.filter(user_role__user=user).first()
        karma = user_profile.karma if user_profile else None  # Получаем карму, если есть
    #переделать на весь список
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

def user_create(request):
        # Получаем данные из тела запроса
        try:
            data = json.loads(request.body)
        
            # Извлекаем данные из запроса
            login = data.get('login')
            username = data.get('username')
            password = data.get('password')
            status = data.get('status')
            department = data.get('department')
            roles = data.get('roles', [])

            # Создаем пользователя
            user = CustomUser.objects.create_stuff(username=username, login=login, password=password)

            # Привязываем роли к пользователю
            for role_data in roles:
                # Пример добавления роли
                role = role_data.name
                userrole = UserRole.objects.create(user=user, role=role)
                userrole.save()
                if role == "user":
                    user_karma = user_profile = UserProfile.objects.create(user=user)
                    user_karma.save()
                if role == "manager":
                    Manager = ManagerProfile.objects.create(user=user, department=department)
                    Manager.save()

            return JsonResponse({
                'id': user.id,
                'login': user.login,
                'username': user.username,
                'status': status
            }, status=201)

        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON data'}, status=400)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        
def user_update(request, user_id):
    try:
        # Получаем данные из тела запроса
        data = json.loads(request.body)
        
        # Извлекаем данные из запроса
        login = data.get('login')
        username = data.get('username')
        password = data.get('password')
        status = data.get('status')
        department = data.get('department')
        roles = data.get('roles', [])

        # Находим пользователя по ID
        try:
            user = CustomUser.objects.get(id=user_id)
        except ObjectDoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)

        # Обновляем поля пользователя
        if username:
            user.username = username
        if login:
            user.login = login
        if password:
            user.set_password(password)  # Хэшируем новый пароль
        if status:
            user.set_status(status)  # Обновляем статус

        # Сохраняем изменения в пользователе
        user.save()

        # Обновляем роли
        UserRole.objects.filter(user=user).delete()  # Удаляем старые роли
        for role_data in roles:
            # Пример добавления роли
            role = role_data.get('role')  # предполагается, что role_data имеет поле 'role'
            UserRole.objects.create(user=user, role=role)
            
            # Обновляем профиль, в зависимости от роли
            if role == "user":
                user_profile, created = UserProfile.objects.get_or_create(user=user)  # Обновление или создание профиля
                if created:  # Если профиль был только что создан, можно установить значения по умолчанию
                    user_profile.karma = 100  # Установим начальное значение кармы, если это новый профиль
                    user_profile.save()

            if role == "manager":
                manager_profile, created = ManagerProfile.objects.get_or_create(user=user)  # Обновляем или создаем профиль менеджера
                if created:
                    manager_profile.department = department  # Обновление департамента
                    manager_profile.save()

        # Возвращаем обновленного пользователя
        return JsonResponse({
            'id': user.id,
            'login': user.login,
            'username': user.username,
            'status': user.status,
            'roles': roles
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)

def user_soft_delete(request, user_id):
    if request.method == 'PATCH':
        try:
            # Находим пользователя по ID
            user = CustomUser.objects.get(id=user_id)
            # Мягкое удаление
            user.soft_delete()
            return JsonResponse({'message': 'User soft deleted successfully'}, status=200)

        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)
   
def user_permanent_delete(request, user_id):
    if request.method == 'DELETE':
        try:
            # Находим пользователя по ID
            user = CustomUser.objects.get(id=user_id)

            # Полное удаление
            UserRole.objects.filter(user=user).delete()
            UserProfile.objects.filter(user=user).delete()
            ManagerProfile.objects.filter(user=user).delete()
            user.delete()

            return JsonResponse({'message': 'User permanently deleted successfully'}, status=200)

        except CustomUser.DoesNotExist:
            return JsonResponse({'error': 'User not found'}, status=404)