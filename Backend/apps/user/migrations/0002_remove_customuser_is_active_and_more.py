# Generated by Django 5.1.7 on 2025-03-17 17:32

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('user', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='customuser',
            name='is_active',
        ),
        migrations.RemoveField(
            model_name='customuser',
            name='is_staff',
        ),
        migrations.AddField(
            model_name='customuser',
            name='status',
            field=models.CharField(choices=[('active', 'Active'), ('ban', 'Banned'), ('deleted', 'Deleted')], default='active', max_length=20),
        ),
    ]
