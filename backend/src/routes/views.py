from django.core.serializers import serialize
from django.http import HttpResponse
from django.views.generic import TemplateView
from .models import Route


class MapView(TemplateView):
    template_name = "map.html"


def routes_api(request):
    """Отдает все маршруты в формате GeoJSON"""
    routes = Route.objects.all()

    geojson_data = serialize(
        'geojson',
        routes,
        geometry_field='geom',
        fields=('name', 'year', 'distance_km', 'route_type', 'gpx_file')
    )
    return HttpResponse(geojson_data, content_type='application/json')