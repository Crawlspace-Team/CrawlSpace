# Generated by Django 2.0.1 on 2018-02-27 12:25

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_pub_places_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='pub',
            name='Places_ID',
            field=models.TextField(default=1, max_length=100),
        ),
    ]
