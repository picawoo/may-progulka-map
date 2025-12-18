import gpxpy
from django.contrib.gis import admin
from django.contrib.gis.geos import LineString, MultiLineString
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
            'description': 'Если вы загружаете GPX-файл, дистанция и геометрия обновятся автоматически.'
        }),
        ('Файлы и Геометрия', {
            'fields': ('gpx_file', 'geom'),
        }),
    )

    def get_form(self, request, obj=None, **kwargs):
        form = super().get_form(request, obj, **kwargs)
        form.base_fields['geom'].required = False
        form.base_fields['distance_km'].required = False
        return form

    def save_model(self, request, obj, form, change):
        if obj.gpx_file and (not obj.geom or 'gpx_file' in form.changed_data):
            try:
                gpx_data = obj.gpx_file.open('r')
                gpx = gpxpy.parse(gpx_data)

                if gpx.tracks:
                    track = gpx.tracks[0]
                    points = []
                    for segment in track.segments:
                        for point in segment.points:
                            points.append((point.longitude, point.latitude))

                    if len(points) >= 2:
                        line = LineString(points)
                        obj.geom = MultiLineString(line)

                        if not obj.distance_km:
                            obj.distance_km = round(track.length_2d() / 1000, 2)

                        if not obj.name:
                            obj.name = track.name or obj.gpx_file.name
            except Exception as e:
                print(f"Ошибка парсинга GPX в админке: {e}")

        super().save_model(request, obj, form, change)