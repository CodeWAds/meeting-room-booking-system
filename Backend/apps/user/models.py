from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from apps.location.views import Location, Room

class CustomUserManager(BaseUserManager):
    def create_user(self, username, id_telegram=None):
        """
        Создает обычного пользователя (без логина и пароля).
        """
        if not username:
            raise ValueError("The Username must be set")
        
        user = self.model(username=username, id_telegram=id_telegram)
        user.set_status("active")
        user.save(using=self._db)
        return user
    
    def create_stuff(self, login, username, password=None):
        """
        Создает пользователя с логином и паролем (для staff).
        """
        if not username:
            raise ValueError("The Username must be set")
        if not login:
            raise ValueError("The Login must be set")
        
        user = self.model(username=username, login=login)
        if password:
            user.set_password(password)  # Хэширование пароля
        else:
            raise ValueError("Password must be provided")

        user.set_status("active")
        user.save(using=self._db)
        return user
    

class CustomUser(AbstractBaseUser, PermissionsMixin):
    id_user = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50)
    id_telegram = models.BigIntegerField(unique=True, null=True, blank=True)
    login = models.CharField(max_length=50, unique=True, null=True, blank=True)  # Необязательное поле
    password = models.CharField(max_length=128, null=True, blank=True)  # Необязательное поле

    STATUS_CHOICES = [
        ("active", "Active"),
        ("ban", "Banned"),
        ("deleted", "Deleted"),
    ]

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="active",
    )

    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return self.username
    
    def set_status(self, status):
        if status not in dict(self.STATUS_CHOICES).keys():
            raise ValueError(f"Invalid status. Allowed values are: {dict(self.STATUS_CHOICES).keys()}")
        self.status = status
        self.save()  
    
    def set_id_telegram(self, id_telegram):
        self.id_telegram = id_telegram
        self.save()  

    def soft_delete(self):
        self.set_status("deleted")


class UserRole(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name= 'roles')
    role = models.CharField(
        max_length=20,
        choices=[
            ("user", "User"),
            ("manager", "Manager"),
            ("admin", "Administrator"),
            ("superadmin", "SuperAdministrator"),
        ],
        default="user",
    )  
    def __str__(self):
        return f"{self.user.username} - {self.role.name}"

class UserProfile(models.Model):
    user_role = models.OneToOneField(UserRole, on_delete=models.CASCADE, primary_key=True)
    karma = models.IntegerField(default=100) 
    def __str__(self):
        return f"{self.user_role.user.username} (karma: {self.karma})"

class ManagerProfile(models.Model):
    user_role = models.OneToOneField(UserRole, on_delete=models.CASCADE, primary_key=True)
    location_id = models.ForeignKey(Location, on_delete=models.CASCADE, related_name="Location")
    def __str__(self):
        return f"{self.user_role.user.username} (location_id: {self.location_id})"

class FavoriteRoom(models.Model):
    favorite_id = models.AutoField(primary_key=True)
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='favorite_rooms')
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='favorite_rooms')
    class Meta:
        unique_together = ('room', 'user')
    def __str__(self):
        return f"{self.user.username} - {self.room.name}"
    
