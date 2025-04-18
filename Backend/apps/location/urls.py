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
    path("<int:location_id>/rooms/create_room/", views.create_room, name="create-room"),
    path("<int:location_id>/rooms/<int:room_id>/", views.room_detail, name="room-detail"), 
    path('<int:location_id>/rooms/<int:room_id>/update/', views.update_room, name='update_room'),
    path('<int:location_id>/rooms/<int:room_id>/delete/', views.delete_room, name='delete_room'),
    path('get_available_rooms/', views.get_available_rooms, name='get_available_rooms'),

    #time_slot
    path("<int:location_id>/time_slot/", views.get_time_slot_availability, name="get_time_slots"), 
    path("<int:location_id>/time_slot_all/", views.get_time_slot, name="get_time_slots"), 
    path("<int:location_id>/time_slot/create_slot/", views.create_time_slot, name="create_time_slot"),
    path("<int:location_id>/time_slot/<int:slot_id>/", views.time_slot_detail, name="time_slot_detail"), 
    path('<int:location_id>/time_slot/<int:slot_id>/update/', views.update_time_slot, name='update_time_slot'),
    path('<int:location_id>/time_slot/<int:slot_id>/delete/', views.delete_time_slot, name='delete_time_slot'),

    #RoomAvailability
    path("<int:location_id>/rooms/<int:room_id>/availability/", views.availability_room, name="get_availability"),  
    path("<int:location_id>/rooms/<int:room_id>/availability/create_availability/", views.create_availability_room, name="create_availability"),
    path("<int:location_id>/rooms/<int:room_id>/availability/<int:availability_id>/", views.availability_detail_room, name="availability_detail"), 
    path('<int:location_id>/rooms/<int:room_id>/availability/<int:availability_id>/update/', views.update_availability_room, name='update_availability'),
    path('<int:location_id>/rooms/<int:room_id>/availability/<int:availability_id>/delete/', views.delete_availability_room, name='delete_availability'),


    #LocAvailability
    path("<int:location_id>/availability/", views.availability_loc, name="get_availability_loc"),  
    path("<int:location_id>/availability/create_availability/", views.create_availability_loc, name="create_availability_loc"),
    path("<int:location_id>/availability/<int:availability_id>/", views.availability_detail_loc, name="availability_detail_loc"), 
    path('<int:location_id>/availability/<int:availability_id>/update/', views.update_availability_loc, name='update_availability_loc'),
    path('<int:location_id>/availability/<int:availability_id>/delete/', views.delete_availability_loc, name='delete_availability_loc'),

    #Reason
    path("reason/", views.availability_reason, name="availability_reason"),  
    path("reason/create_availability/", views.create_availability_reason, name="create_availability_reason"), 
    path('reason/update/', views.update_availability_reason, name='update_availability_reason'),
    path('reason/delete/', views.delete_availability_reason, name='delete_availability_reason'),


]
