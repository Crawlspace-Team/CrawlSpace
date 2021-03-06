# Generated by Django 2.0.2 on 2018-02-16 15:46

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Crawl',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Crawl_Name', models.CharField(max_length=50)),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
        migrations.CreateModel(
            name='Pub',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('Pub_Name', models.CharField(max_length=255)),
            ],
        ),
        migrations.CreateModel(
            name='Pub_On_Crawl',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('position', models.IntegerField()),
                ('crawl', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Crawl')),
                ('pub', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='core.Pub')),
            ],
        ),
        migrations.RemoveField(
            model_name='crawls',
            name='user',
        ),
        migrations.DeleteModel(
            name='Crawls',
        ),
    ]
