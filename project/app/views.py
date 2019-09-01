# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db.models import Q
from django.utils import timezone
from django.views.generic import TemplateView
from rest_framework import permissions, status
from rest_framework.generics import CreateAPIView, ListAPIView, UpdateAPIView

from . import models, serializers

class HomeView(TemplateView):
    template_name = 'app/home.html'


class GETCloneView(ListAPIView):
    permission_classes = (permissions.AllowAny,)
    model = models.Clone
    serializer_class = serializers.CloneSerializer

    def get_queryset(self):
            """
            This view returns all clone counts between two weeks
            """
            seven_days =  timezone.timedelta(days=7)

            seven_days_ago = timezone.now() + seven_days
            seven_days_from_now = timezone.now() - seven_days

            return models.Clone.objects.filter(
                    Q(date__lte=seven_days_ago)&
                    Q(date__gte=seven_days_from_now))


# class POSTCloneView(UpdateAPIView):
#     permission_classes = (permissions.AllowAny,)
#     model = get_user_model()
#     serializer_class = serializers.UserSerializer

#     def perform_create(self, serializer):
#         user = serializer.save()

#         dogs = models.Dog.objects.all()
#         models.UserDog.objects.bulk_create([
#             models.UserDog(user=user, dog=dog) for dog in dogs])
