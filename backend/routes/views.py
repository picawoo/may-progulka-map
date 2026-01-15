from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
import gpxpy
from .models import Route
from .serializers import RouteSerializer


class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def parse_gpx(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Файл не прикреплен'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            gpx = gpxpy.parse(file)
            points = []
            for track in gpx.tracks:
                for segment in track.segments:
                    for p in segment.points:
                        points.append({'lat': p.latitude, 'lng': p.longitude})

            dist = round(gpx.length_2d() / 1000, 1) if gpx.tracks else 0

            return Response({
                'distanceKm': dist,
                'points': points,
                'name': file.name.replace('.gpx', '')
            })
        except Exception as e:
            return Response({'error': f'Ошибка парсинга: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bulk_import(self, request): # массовый импорт из папки
        from .services import run_gpx_import

        folder_path = '/app/gpx_data' # путь откуда брать файлы

        try:
            stats = run_gpx_import(folder_path, overwrite=False)
            return Response({
                'status': 'success',
                'message': 'Импорт завершен',
                'created': stats['created'],
                'skipped': stats['skipped'],
                'errors': stats['errors']
            })
        except Exception as e:
            return Response({'status': 'error', 'message': str(e)}, status=500)