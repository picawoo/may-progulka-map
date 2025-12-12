from django.contrib.gis import admin
from .models import Route

@admin.register(Route)
class RouteAdmin(admin.GISModelAdmin):
    list_display = ('year', 'name', 'route_type', 'distance_km')
    list_filter = ('year', 'route_type')
    search_fields = ('name',)
    ordering = ('-year', 'name')

    gis_widget_kwargs = {
        'attrs': {
            'default_zoom': 11,
            'default_lon': 60.6057,
            'default_lat': 56.8389,
        }
    }

    fieldsets = (
        ('Основная информация', {
            'fields': ('name', 'year', 'route_type', 'distance_km'),
            'description': 'Общие метаданные маршрута (название, год проведения и тип).'
        }),
        ('Файлы и Геометрия', {
            'fields': ('gpx_file', 'geom'),
            'description': 'Загрузите исходный GPX файл и проверьте корректность отрисовки трека на карте.'
        }),
    )