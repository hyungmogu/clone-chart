from django.contrib.auth import get_user_model

from rest_framework import serializers

from . import models


class CloneSerializer(serializers.ModelSerializer):
    class Meta:
        model = models.Clone
