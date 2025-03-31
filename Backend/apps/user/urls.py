from django.urls import path

from . import views

urlpatterns = [
    path("login_telegram", views.login_by_telegram, name="login_by_telegram"),
    path("login_password", views.user_login, name="user_login"),
    path("logout", views.user_logout, name="user_logout"),
    path("", views.get_users, name="get_users"),  
    path("create-user/", views.user_create, name="create-user"),
    path("<int:user_id>/", views.get_user, name="user-detail"), 
    path('<int:user_id>/update/', views.user_update, name='update_user'),
    path('<int:user_id>/soft_delete/', views.user_soft_delete, name='user_soft_delete'),
    path('<int:user_id>/permanent_delete/', views.user_permanent_delete, name='user_permanent_delete'),

    #favourite_rooms
    path("<int:user_id>/favourite_rooms/", views.get_favourite_rooms, name="favourite-rooms"),  
    path("<int:user_id>/favourite_rooms/add_room/", views.add_favourite_room, name="add-favourite-room"),
    path("<int:user_id>/favourite_rooms/<int:favorite_id>/", views.favourite_room_detail, name="favourite-room-detail"), 
    path('<int:user_id>/favourite_rooms/<int:favorite_id>/delete/', views.delete_favourite_room, name='delete-favourite-room')
]
