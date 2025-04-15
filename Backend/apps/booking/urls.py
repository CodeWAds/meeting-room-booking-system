from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_booking, name="get_locations"),  
    path("create-booking/", views.create_booking, name="create-booking"),
    path("<int:booking_id>/", views.booking_detail, name="booking-detail"), 
    path('<int:booking_id>/update/', views.update_booking, name='update_booking'),
    path('<int:booking_id>/delete/', views.delete_booking, name='delete_booking'),
    path('user/<int:user_id>/', views.get_user_bookings, name='get_user_bookings'),
    
    path('verify_code/', views.verify_code, name='veryfy_code'),

    path('location/<int:location_id>/', views.booking_location, name='booking_location'),

    path('upcoming-notifications/', views.get_upcoming_bookings_for_notifications, name='upcoming_notifications'),
]

