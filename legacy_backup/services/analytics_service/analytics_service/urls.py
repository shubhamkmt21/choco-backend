from django.contrib import admin
from django.urls import path
from analytics import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/analytics/track', views.track_view),
    path('api/analytics/stats', views.get_stats),
]
