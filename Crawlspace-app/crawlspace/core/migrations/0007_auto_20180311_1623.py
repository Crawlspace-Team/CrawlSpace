# -*- coding: utf-8 -*-
# Generated by Django 1.10.5 on 2018-03-11 16:23
from __future__ import unicode_literals

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0006_auto_20180311_1536'),
    ]

    operations = [
        migrations.RenameModel(
            old_name='Pub_On_Crawl',
            new_name='PubOnCrawl',
        ),
    ]