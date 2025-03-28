# Generated by Django 5.1.7 on 2025-03-24 13:32

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='UserRole',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('role', models.CharField(choices=[('user', 'User'), ('manager', 'Manager'), ('admin', 'Administrator'), ('superadmin', 'SuperAdministrator')], default='user', max_length=20)),
            ],
        ),
        migrations.CreateModel(
            name='CustomUser',
            fields=[
                ('last_login', models.DateTimeField(blank=True, null=True, verbose_name='last login')),
                ('is_superuser', models.BooleanField(default=False, help_text='Designates that this user has all permissions without explicitly assigning them.', verbose_name='superuser status')),
                ('user_id', models.AutoField(primary_key=True, serialize=False)),
                ('username', models.CharField(max_length=50, unique=True)),
                ('id_telegram', models.BigIntegerField(blank=True, null=True, unique=True)),
                ('login', models.CharField(blank=True, max_length=50, null=True, unique=True)),
                ('password', models.CharField(blank=True, max_length=128, null=True)),
                ('status', models.CharField(choices=[('active', 'Active'), ('ban', 'Banned'), ('deleted', 'Deleted')], default='active', max_length=20)),
                ('groups', models.ManyToManyField(blank=True, help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.', related_name='user_set', related_query_name='user', to='auth.group', verbose_name='groups')),
                ('user_permissions', models.ManyToManyField(blank=True, help_text='Specific permissions for this user.', related_name='user_set', related_query_name='user', to='auth.permission', verbose_name='user permissions')),
            ],
            options={
                'abstract': False,
            },
        ),
        migrations.CreateModel(
            name='UserProfile',
            fields=[
                ('user_role', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='user.userrole')),
                ('karma', models.IntegerField(default=100)),
            ],
        ),
        migrations.AddField(
            model_name='userrole',
            name='user',
            field=models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='roles', to=settings.AUTH_USER_MODEL),
        ),
        migrations.CreateModel(
            name='FavoriteRoom',
            fields=[
                ('favorite_id', models.AutoField(primary_key=True, serialize=False)),
                ('room', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorite_rooms', to='location.room')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='favorite_rooms', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'unique_together': {('room', 'user')},
            },
        ),
        migrations.CreateModel(
            name='ManagerProfile',
            fields=[
                ('user_role', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, primary_key=True, serialize=False, to='user.userrole')),
                ('location_id', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='Location', to='location.location')),
            ],
        ),
    ]
