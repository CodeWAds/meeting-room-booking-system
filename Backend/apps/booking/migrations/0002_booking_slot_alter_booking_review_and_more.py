# Generated by Django 5.1.7 on 2025-03-19 20:45

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('booking', '0001_initial'),
        ('location', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='booking',
            name='slot',
            field=models.ManyToManyField(to='location.timeslot'),
        ),
        migrations.AlterField(
            model_name='booking',
            name='review',
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.DeleteModel(
            name='BookingTimeSlot',
        ),
    ]
