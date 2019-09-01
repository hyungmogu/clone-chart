# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db.models import Q
from django.utils import timezone
from django.views.generic import TemplateView
from rest_framework import permissions, status
from rest_framework.exceptions import NotAcceptable
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


class POSTCloneView(CreateAPIView):
    model = models.Clone
    queryset = models.Clone.objects.all()
    serializer_class = serializers.CloneSerializer

    def perform_create(self, serializer):
        # find date today
        today = timezone.now().today()

        # get value today. if it doesn't exist, then create one
        try:
            clone = self.model.objects.get(date=today)
            serializer = self.serializer_class(clone, data={'count': clone.count + 1}, partial=True)
        except self.model.DoesNotExist:
            clone = self.model.objects.create(date=today)

        serializer = self.serializer_class(clone, data={'count': 1}, partial=True)

        if not serializer.is_valid():
            raise NotAcceptable('An error occurred while trying to save/update clone count! Contact Moe for fix')

        serializer.save()

