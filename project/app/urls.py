from django.conf.urls import url

import app.views as views

# API endpoints
urlpatterns = [
    url(r'^$', views.HomeView.as_view(), name="home"),
]
