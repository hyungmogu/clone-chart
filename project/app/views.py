# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db.models import Q
from django.utils import timezone,formats
from datetime import datetime
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
        clones = self.get_clones()

        if len(clones) < 14:
            self.init_clones(clones)
            clones = self.get_clones()

        return clones

    def get_clones(self):
        today = self.get_date()

        fourteen_days =  timezone.timedelta(days=14)

        date_upper_bound = today + timezone.timedelta(days=1)

        fourteen_days_ago = date_upper_bound - fourteen_days

        clones = models.Clone.objects.filter(
            Q(date__lte=date_upper_bound)&
            Q(date__gte=fourteen_days_ago))

        return clones

    def init_clones(self, clones):
        dates = []
        temp_set = set()
        temp_clone_dates = [str(clone.date.date()) for clone in clones]

        for i in range(0,14):
            date_upper_bound = self.get_date() + timezone.timedelta(days=1)
            date = date_upper_bound - timezone.timedelta(days=i)

            if len(temp_clone_dates) != 0:
                if str(date) not in temp_clone_dates:
                    new_clone = self.model(date=date)
                    dates.append(new_clone)
            else:
                dates.append(self.model(date=date))

        self.model.objects.bulk_create(dates)

    def get_date(self):
        today_with_time = timezone.now().today()

        today_year = today_with_time.year
        today_month = today_with_time.month
        today_day = today_with_time.day

        return datetime(today_year, today_month, today_day)


class POSTCloneView(CreateAPIView):
    model = models.Clone
    queryset = models.Clone.objects.all()
    serializer_class = serializers.CloneSerializer

    def perform_create(self, serializer):
        today = self.get_date()

        try:
            clone = self.model.objects.get(date=today)
        except self.model.DoesNotExist:
            clone = self.model.objects.create(date=today)

        serializer = self.serializer_class(clone, data={'count': clone.count + 1}, partial=True)

        if not serializer.is_valid():
            raise NotAcceptable('An error occurred while trying to save/update clone count! Contact Moe for fix')

        serializer.save()


    def get_date(self):
        today_with_time = timezone.now().today()

        today_year = today_with_time.year
        today_month = today_with_time.month
        today_day = today_with_time.day

        return datetime(today_year, today_month, today_day)
