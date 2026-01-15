from django.contrib import admin
from .models import Route


@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('name', 'date', 'distanceKm', 'walkType')

    list_filter = ('date', 'walkType')

    search_fields = ('name',)