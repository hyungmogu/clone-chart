# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.utils import timezone
from django.db import models


class Clone(models.Model):
    date = models.DateTimeField(default=timezone.now().today, unique=True)
    count = models.IntegerField(default=0)

    def __str__(self):
        return "{}".format(self.date)
