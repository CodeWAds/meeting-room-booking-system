from django.urls import path

from . import views

urlpatterns = [
    path("login_telegram/", views.login_by_telegram, name="login_by_telegram"),
    path("login_password/", views.user_login, name="user_login"),
    path("logout/", views.user_logout, name="user_logout"),
    path("", views.get_users, name="get_users"),  
    path("create-user/", views.user_create, name="create-user"),
    path("create-user-tg/", views.user_create_tg, name="create-user-tg"),
    path("<int:id_user>/", views.get_user, name="user-detail"), 
    path('<int:id_user>/update/', views.user_update, name='update_user'),
    path('<int:id_user>/soft_delete/', views.user_soft_delete, name='user_soft_delete'),
    path('<int:id_user>/permanent_delete/', views.user_permanent_delete, name='user_permanent_delete'),
    path("<int:id_user>/get_roles/", views.get_role, name="get_roles"), 

    #favourite_rooms
    path("<int:id_user>/favourite_rooms/", views.get_favourite_rooms, name="favourite-rooms"),  
    path("<int:id_user>/favourite_rooms/add_room/", views.add_favourite_room, name="add-favourite-room"),
    path("<int:id_user>/favourite_rooms/<int:room_id>/", views.favourite_room_detail, name="favourite-room-detail"), 
    path('<int:id_user>/favourite_rooms/<int:room_id>/delete/', views.delete_favourite_room, name='delete-favourite-room')
]
