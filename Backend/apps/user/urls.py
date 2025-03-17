from django.urls import path

from . import views

urlpatterns = [
    path("", views.get_users, name="get_users"),  
    path("create-user/", views.user_create, name="create-user"),
    path("<int:user_id>/", views.get_user, name="user-detail"), 
    path('<int:user_id>/update/', views.user_update, name='update_user'),
    path('<int:user_id>/soft_delete/', views.user_soft_delete, name='user_soft_delete'),
    path('<int:user_id>/permanent_delete/', views.user_permanent_delete, name='user_permanent_delete')
]
