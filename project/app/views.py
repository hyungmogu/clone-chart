# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db.models import Q
from django.utils import timezone
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
        # if items count is less than 14, check items
        clones = self.get_clones()

        if len(clones) < 14:
            self.init_clones(clones)
            clones = self.get_clones()

        return clones

    def get_clones(self):
        fourteen_days =  timezone.timedelta(days=14)

        fourteen_days_ago = timezone.now().today() - fourteen_days

        clones = models.Clone.objects.filter(
            Q(date__lte=timezone.now().today())&
            Q(date__gte=fourteen_days_ago))

        return clones

    def init_clones(self, clones):
        dates = []
        temp_set = set()

        print(clones)

        # check and see if date exists in array
        # if not, put in output
        for i in range(0,14):
            date = timezone.now().today() - timezone.timedelta(days=i)

            # if clone is not empty, then go through the following process
            if len(clones) != 0:
                for clone in clones:
                    clone_date = datetime.combine(clone.date, datetime.min.time())

                    if str(clone_date) in temp_set:
                        continue

                    if (clone_date - date).days > 0:
                        new_clone = self.model(date=date)
                        dates.append(new_clone)

                    temp_set.add(str(clone_date))
                    break

            # if clone is empty, then add
            dates.append(self.model(date=date))

        self.model.objects.bulk_create(dates)


class POSTCloneView(CreateAPIView):
    model = models.Clone
    queryset = models.Clone.objects.all()
    serializer_class = serializers.CloneSerializer

    def perform_create(self, serializer):
        today = timezone.now().date()

        try:
            clone = self.model.objects.get(date=today)
        except self.model.DoesNotExist:
            clone = self.model.objects.create(date=today)

        serializer = self.serializer_class(clone, data={'count': clone.count + 1}, partial=True)

        if not serializer.is_valid():
            raise NotAcceptable('An error occurred while trying to save/update clone count! Contact Moe for fix')

        serializer.save()

