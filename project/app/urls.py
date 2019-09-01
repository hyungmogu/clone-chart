from django.conf.urls import url

import app.views as views

# API endpoints
urlpatterns = [
    url(r'^api/v1/get-count/$', views.GETCloneView.as_view(), name="counts"),
    url(r'^$', views.HomeView.as_view(), name="home"),
]
