from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),  # Главная страница
    path("<int:user_id>/", views.get_user, name="user-detail"),  # Страница пользователя с использованием user_id
]
