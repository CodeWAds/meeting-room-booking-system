from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_locations, name="get_locations"),  
    path("create-location/", views.create_location, name="create-location"),
    path("<int:location_id>/", views.location_detail, name="location-detail"), 
    path('<int:location_id>/update/', views.update_location, name='update_location'),
    path('<int:location_id>/delete/', views.location_delete, name='delete_location'),

    #rooms
    path("<int:location_id>/rooms/", views.get_rooms, name="get_rooms"),  
    path("<int:location_id>/rooms/create_room", views.create_room, name="create-room"),
    path("<int:location_id>/rooms/<int:room_id>/", views.room_detail, name="room-detail"), 
    path('<int:location_id>/rooms/<int:room_id>/update', views.update_room, name='update_room'),
    path('<int:location_id>/rooms/<int:room_id>/delete', views.delete_room, name='delete_room'),
    path('get_available_rooms/', views.get_available_rooms, name='get_available_rooms'),

    #time_slot
    path("<int:location_id>/time_slot/", views.get_time_slot, name="get_time_slots"),  
    path("<int:location_id>/time_slot/create_slot", views.create_time_slot, name="create_time_slot"),
    path("<int:location_id>/time_slot/<int:slot_id>/", views.time_slot_detail, name="time_slot_detail"), 
    path('<int:location_id>/time_slot/<int:slot_id>/update', views.update_time_slot, name='update_time_slot'),
    path('<int:location_id>/time_slot/<int:slot_id>/delete', views.delete_time_slot, name='delete_time_slot'),
    
]
