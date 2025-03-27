from django.db import models

# Create your models here.
class Equipment(models.Model):
    id_equipment = models.AutoField(primary_key=True)
    name = models.CharField(max_length=50)
    description = models.CharField(max_length=255)

    def __str__(self):
        return self.name