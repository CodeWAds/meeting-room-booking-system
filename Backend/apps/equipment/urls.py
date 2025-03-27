from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_equipments, name="get_equipment"),  
    path("create_equipment/", views.equipment_create, name="create_equipment"),
    path("<int:equipment_id>/", views.equipment_detail, name="equipment_detail"), 
    path('<int:equipment_id>/update/', views.equipment_update, name='update_equipment'),
    path('<int:equipment_id>/delete/', views.equipment_delete, name='delete_equipment')
]
