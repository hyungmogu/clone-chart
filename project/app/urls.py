from django.conf.urls import url

import app.views as views

# API endpoints
urlpatterns = [
    url(r'^api/v1/add-count/$', views.POSTCloneView.as_view(), name="add-counts"),
    url(r'^api/v1/get-count/$', views.GETCloneView.as_view(), name="get-counts"),
    url(r'^$', views.HomeView.as_view(), name="home"),
]
