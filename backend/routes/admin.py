from django.contrib import admin
from .models import Route

@admin.register(Route)
class RouteAdmin(admin.ModelAdmin):
    list_display = ('year', 'title', 'route_type', 'distance_km', 'has_geometry')
    list_filter = ('year', 'route_type')
    search_fields = ('title',)

    def has_geometry(self, obj):
        return bool(obj.geometry)
    has_geometry.boolean = True
    has_geometry.short_description = "Трек обработан"