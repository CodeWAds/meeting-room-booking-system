from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin

class CustomUserManager(BaseUserManager):
    # Метод для создания обычного пользователя
    def create_user(self, login, username, password=None):
        if not login:
            raise ValueError("Users must have a login")
        user = self.model(login=login, username=username)
        user.set_password(password)  # Хеширование пароля
        user.save(using=self._db)
        return user

    # Метод для создания суперпользователя
    def create_superuser(self, login, username, password=None):
        user = self.create_user(login, username, password)
        user.is_staff = True
        user.is_active = True
        user.is_superuser = True
        user.save(using=self._db)
        return user

class CustomUser(AbstractBaseUser, PermissionsMixin):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    id_telegram = models.BigIntegerField(unique=True, null=True, blank=True)
    login = models.CharField(max_length=50, unique=True, null=True)
    password = models.CharField(max_length=128, null=True)

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)


    USERNAME_FIELD = "login"
    REQUIRED_FIELDS = ["username"]

    objects = CustomUserManager()

    def __str__(self):
        return self.username

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
    #ЗАМЕНИТЬ ПРИ ДОБАВЛЕНИИ ЛОКАЦИИ
    department = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.user_role.user.username} (Department: {self.department})"
