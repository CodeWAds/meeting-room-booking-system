from django.http import JsonResponse, HttpResponseNotAllowed, HttpResponseBadRequest
from django.shortcuts import get_object_or_404
from .models import CustomUser, UserProfile, ManagerProfile, UserRole, FavoriteRoom
from django.core.exceptions import ValidationError
from django.views.decorators.csrf import csrf_exempt
from apps.location.models import Room, Location
from apps.equipment.models import Equipment
from django.contrib.auth import authenticate, login, logout


import  json

def login_by_telegram(request):
    if request.method != "POST":
        JsonResponse({"message": "Method not supported"})
        # Предполагаем, что данные могут передаваться в формате JSON или POST form-data
    try:
        data = json.loads(request.body)
    except Exception:
        data = request.POST

    username = data.get("username")
    id_telegram = data.get("id_telegram")
    if not id_telegram:
        return JsonResponse({"message": "Parameter 'telegram_id' is required."})

    if CustomUser.objects.filter(id_telegram=id_telegram).exists():
        user = CustomUser.objects.filter(id_telegram=id_telegram).first()
    else :
        user_create_tg(username, id_telegram)
        user = CustomUser.objects.filter(id_telegram=id_telegram).first()

    if user.status == "banned":
        return JsonResponse({"message": "User is banned"}, status=403)

    login(request, user)
    return JsonResponse({"message": "Login via Telegram successful", "id_user": user.id_user})
    
    

def user_login(request):
    if request.method != "POST":
        JsonResponse({"message": "Method not supported"})
    try:
        data = json.loads(request.body)
    except Exception:
        data = request.POST

    login_field = data.get("login")
    password = data.get("password")

    if not login_field or not password:
        return JsonResponse({"message": "Both 'login' and 'password' fields are required."})
    user = authenticate(request, username=login_field, password=password)

    if user is not None:
        login(request, user)
        return JsonResponse({"message": "Login successful", "user_id": user.id_user,"username": user.username})
    else:
        return JsonResponse({"message": "Invalid login credentials"}, status=400)


def user_logout(request):
    logout(request)
    return JsonResponse({"message": "Logout successful"})


def get_clients(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    try:
        users = CustomUser.objects.all()
        user_data = []
        for user in users:
            roles = UserRole.objects.filter(user=user)
            role_names = [role.role for role in roles]
            if len(roles) == 1 and role_names[0] == "user":
                user_info = {
                        "id_user": user.id_user,
                        "username": user.username,
                        "status": user.status,    
                }
                user_data.append(user_info)
        return JsonResponse({'users': user_data}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)
    
def get_stuff(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    try:
        data = json.loads(request.body)
        id = data.get('id_user')
        user = get_object_or_404(CustomUser, id_user=id)
        roles = UserRole.objects.filter(user=user)
        role_names = [role.role for role in roles]
        super_admin = False
      
        if "superadmin" in role_names:
            super_admin = True
        if (not "admin" in role_names) and (not super_admin):
            return JsonResponse({"message": "you don't have priviliges for this"})
        users = CustomUser.objects.all()
        user_data = []
        for user in users:
            roles = UserRole.objects.filter(user=user)
            role_names = [role.role for role in roles]
            if  ((not "admin" in role_names and not "superadmin" in role_names) or super_admin) and  (not "user" in role_names):
                user_info = {
                        "id_user": user.id_user,
                        "username": user.username,
                        "roles": role_names,
                        "status": user.status,    
                }
                user_data.append(user_info)
        return JsonResponse({'users': user_data}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_users(request):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
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
                    "id_user": user.id_user,
                    "username": user.username,
                    "roles": role_names,    
            }
            user_data.append(user_info)
        return JsonResponse({'users': user_data}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def get_role(request, id_user):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"}, status=405)

    try:
        user = get_object_or_404(CustomUser, id_user=id_user)
        roles = list(user.roles.values_list("role", flat=True))
        role_list = []
        for role in roles:
            data = {"role": role}
            if role == "user":
                user_profile = UserProfile.objects.filter(user_role__user=user).first()
                data['karma'] = user_profile.karma if user_profile else None
            if role == "manager" :
                manager_profile = ManagerProfile.objects.filter(user_role__user=user).first()
                location_id = manager_profile.location_id.id_location if manager_profile and manager_profile.location_id else None
                data['location_id'] = location_id
            role_list.append(data)
        data = {
            'id_user': user.id_user,
            'roles': role_list
        }

        return JsonResponse(data, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


def get_user(request, id_user):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"}, status=405)

    try:
        user = get_object_or_404(CustomUser, id_user=id_user)
        roles = list(user.roles.values_list("role", flat=True))
        role_list = []
        for role in roles:
            data = {"role": role}
            if role == "user":
                user_profile = UserProfile.objects.filter(user_role__user=user).first()
                data['karma'] = user_profile.karma if user_profile else None
            if role == "manager" :
                manager_profile = ManagerProfile.objects.filter(user_role__user=user).first()
                location_id = manager_profile.location_id.id_location if manager_profile and manager_profile.location_id else None
                data['location_id'] = location_id
            role_list.append(data)
        data = {
            'id_user': user.id_user,
            'username': user.username,
            'status': user.status,
            'roles': role_list
        }
        return JsonResponse(data, status=200)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)





def user_create_tg(username, id_telegram):
    # Проверка на уникальность username
    if CustomUser.objects.filter(id_telegram=id_telegram).exists():
        return 0

    print(id_telegram)
    # Создание пользователя
    user = CustomUser(username=username, id_telegram=id_telegram)
    status = "active"
    user.set_status(status)
    user.save()  # Сохраняем пользователя, чтобы получить ID
    user_role = UserRole.objects.create(user=user, role="user")
    UserProfile.objects.create(user_role=user_role)
    return user

def user_create(request):
    if request.method != "POST":
        return JsonResponse({"message": "Method not supported"})
    try:
        data = json.loads(request.body)

        username = data.get('username')
        id_telegram = data.get('id_telegram')
        login = data.get('login')
        password = data.get('password')
        status = data.get('status', "active")  # По умолчанию "active"
        location_id = data.get('location_id')
        roles = data.get('roles', [])  # roles передается как список строк, например ["user", "manager"]

        # Проверка на уникальность username
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({'error': 'Username already exists'}, status=400)

        # Создание пользователя
        user = CustomUser(username=username, id_telegram=id_telegram, login=login)
        if password:
            user.set_password(password)  # Хэширование пароля
        user.set_status(status)
        user.save()  # Сохраняем пользователя, чтобы получить ID

        # Привязка ролей
        for role_name in roles:
            user_role = UserRole.objects.create(user=user, role=role_name)

            if role_name == "user":
                UserProfile.objects.create(user_role=user_role)

            if role_name == "manager":
                # Получение экземпляра Location
                location = get_object_or_404(Location, id_location=location_id)
                ManagerProfile.objects.create(user_role=user_role, location_id=location)

        return JsonResponse({
            'id_user': user.id_user,
            'username': user.username,
            'login': user.login if user.login else None,
            'status': user.status,
            'roles': roles
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

def user_update(request, id_user):
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"}, status=405)
    try:
        data = json.loads(request.body)

        username = data.get('username')
        id_telegram = data.get('id_telegram')
        login = data.get('login')
        password = data.get('password')
        status = data.get('status')
        location_id = data.get('location_id')
        roles = data.get('roles', [])

        # Находим пользователя по id_user
        user = get_object_or_404(CustomUser, id_user=id_user)

        # Обновление полей пользователя
        if username:
            user.username = username
        if id_telegram:
            user.id_telegram = id_telegram
        if login:
            user.login = login
        if password:
            user.set_password(password)
        if status is not None:
            user.set_status(status)  # Обновление статуса

        user.save()  # Сохраняем изменения

        # Удаление старых ролей
        UserRole.objects.filter(user=user).delete()

        # Привязка новых ролей
        for role_name in roles:
            user_role = UserRole.objects.create(user=user, role=role_name)

            if role_name == "user":
                UserProfile.objects.update_or_create(user_role=user_role)

            if role_name == "manager":
                location = get_object_or_404(Location, id_location=location_id)
                ManagerProfile.objects.update_or_create(user_role=user_role, defaults={'location_id': location})

        return JsonResponse({
            'id_user': user.id_user,
            'username': user.username,
            'login': user.login if user.login else None,
            'status': user.status,
            'roles': roles
        }, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON data'}, status=400)
    except ValidationError as e:
        return JsonResponse({'error': str(e)}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)



def user_soft_delete(request, id_user):
    if request.method != "PATCH":
        return JsonResponse({"message": "Method not supported"})
    try:
        # Находим пользователя по ID
        user = CustomUser.objects.get(id_user=id_user)
        # Мягкое удаление
        user.soft_delete()
        return JsonResponse({'message': 'User soft deleted successfully'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)


def user_permanent_delete(request, id_user):
    if request.method != "DELETE":
        return JsonResponse({"message": "Method not supported"}, status=405)
    
    try:
        # Находим пользователя по ID
        user = CustomUser.objects.get(id_user=id_user)

        # Полное удаление
        UserRole.objects.filter(user=user).delete()

        # Исправляем фильтры для связанных моделей
        UserProfile.objects.filter(user_role__user=user).delete()  # Убедитесь, что поле названо правильно
        ManagerProfile.objects.filter(user_role__user=user).delete()  # Как и здесь

        user.delete()

        return JsonResponse({'message': 'User permanently deleted successfully'}, status=200)

    except CustomUser.DoesNotExist:
        return JsonResponse({'error': 'User not found'}, status=404)

    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)

        

def add_favourite_room(request, id_user):
    if request.method != "POST":
        return HttpResponseNotAllowed(["POST"])

    try:
        data = json.loads(request.body)
        room_id = data.get("room_id")
        if not room_id :
            return HttpResponseBadRequest("room_id обязательны для создания избранного.")
        
        # Получаем связанные объекты
        room = get_object_or_404(Room, pk=room_id)
        user = get_object_or_404(CustomUser, pk=id_user)
        
        favorite, created = FavoriteRoom.objects.get_or_create(room=room, user=user)
        if created:
            message = "Избранная комната успешно добавлена."
        else:
            message = "Избранная комната уже существует."
            
        return JsonResponse({
            "message": message,
            "room_id": favorite.room.id_room,
            "id_user": favorite.user.id_user,
        })

    except json.JSONDecodeError:
        return HttpResponseBadRequest("Неверный формат JSON.")

def favourite_room_detail(request,id_user, room_id):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    favorite = get_object_or_404(FavoriteRoom, room = room_id, user = id_user)
    list_equip = list(favorite.room.id_equipment.values_list('id_equipment', flat=True))
    final_equip = []
    for i in range(len(list_equip)):
        equipment = get_object_or_404(Equipment, id_equipment = list_equip[i])
        final_equip.append({"name" : equipment.name, "description": equipment.description})
    return JsonResponse({
        "favorite_id": favorite.favorite_id,
        "id_room": favorite.room.id_room,
        "room_name": favorite.room.room_name, 
        "capacity": favorite.room.capacity, 
        "id_equipment": final_equip
    })

def get_favourite_rooms(request, id_user):
    if request.method != "GET":
        return JsonResponse({"message": "Method not supported"})
    
    favorites = FavoriteRoom.objects.filter(user=id_user)
    data = []
    for fav in favorites:
        list_equip = list(fav.room.id_equipment.values_list('id_equipment', flat=True))
        final_equip = []
        for i in range(len(list_equip)):
            equipment = get_object_or_404(Equipment, id_equipment = list_equip[i])
            final_equip.append({"name" : equipment.name, "description": equipment.description})
        data.append({
            "favorite_id": fav.favorite_id,
            "room_id": fav.room.id_room,
            "location_id": fav.room.id_location.id_location,
            "location_name": fav.room.id_location.name,
            "id_user": fav.user.id_user,
            "room_name": fav.room.room_name, 
            "capacity": fav.room.capacity, 
            "id_equipment": final_equip
        })
    return JsonResponse(data, safe=False)

def delete_favourite_room(request,id_user, room_id):
    if request.method != "DELETE":
        return HttpResponseNotAllowed(["DELETE"])
    
    favorite = get_object_or_404(FavoriteRoom, room = room_id, user = id_user)
    favorite.delete()
    return JsonResponse({"message": "Избранная комната удалена", "favorite_id": favorite.room.id_room})