from django.core.serializers import serialize
from django.http import HttpResponse, FileResponse, Http404, JsonResponse
from django.shortcuts import get_object_or_404
from .models import Route


def routes_geojson_list(request):
    """
    REST API эндпоинт для получения маршрутов в формате GeoJSON.
    Поддерживает фильтрацию через GET-параметры в URL.
    """
    queryset = Route.objects.all()

    filters = {
        'year__gte': request.GET.get('year_from'),
        'year__lte': request.GET.get('year_to'),
        'route_type': request.GET.get('type'),
        'distance_km__gte': request.GET.get('min_dist'),
        'distance_km__lte': request.GET.get('max_dist'),
    }

    active_filters = {k: v for k, v in filters.items() if v and v != 'all'}

    try:
        if active_filters:
            queryset = queryset.filter(**active_filters)

        # db data -> geojson
        geojson_data = serialize(
            'geojson',
            queryset,
            geometry_field='geom',
            fields=('id', 'name', 'year', 'distance_km', 'route_type')
        )
        return HttpResponse(geojson_data, content_type='application/json')

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)


def download_gpx(request, route_id):
    """
    Эндпоинт для скачивания оригинального GPX файла по его ID.
    Пример вызова: /api/routes/download/12/
    """
    route = get_object_or_404(Route, pk=route_id)

    if not route.gpx_file:
        return JsonResponse({"error": "Файл GPX не найден для этого маршрута"}, status=404)

    try:
        response = FileResponse(
            route.gpx_file.open('rb'),
            content_type='application/gpx+xml'
        )
        filename = route.gpx_file.name.split('/')[-1]
        response['Content-Disposition'] = f'attachment; filename="{filename}"'
        return response
    except Exception as e:
        return JsonResponse({"error": "Ошибка при чтении файла"}, status=500)