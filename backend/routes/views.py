import json

import gpxpy
from django.http import HttpResponse
from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
import os
from .models import Route
from .serializers import RouteSerializer
from .services import process_gpx_file

class RouteViewSet(viewsets.ModelViewSet):
    queryset = Route.objects.all()
    serializer_class = RouteSerializer

    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def parse_gpx(self, request):
        file = request.FILES.get('file')
        if not file:
            return Response({'error': 'Файл не прикреплен'}, status=400)

        try:
            file.seek(0)
            result = process_gpx_file(file, file.name)
            return Response(result)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def bulk_import(self, request):
        folder_path = '/app/gpx_data'
        stats = {'created': 0, 'skipped': 0, 'errors': 0}

        if not os.path.exists(folder_path):
            return Response({'error': f'Папка {folder_path} не найдена'}, status=404)

        from .models import Route

        all_routes = list(Route.objects.all())

        for filename in os.listdir(folder_path):
            if filename.lower().endswith('.gpx'):
                try:
                    full_path = os.path.join(folder_path, filename)
                    with open(full_path, 'r', encoding='utf-8') as f:
                        file_content = f.read()
                        data = process_gpx_file(file_content, filename)

                        curr_date = str(data['date'])
                        curr_dist = round(float(data['distanceKm']), 1)
                        curr_s = data.get('startLocation', {}).get('coord', {})
                        curr_lat = float(curr_s.get('lat', 0))
                        curr_lng = float(curr_s.get('lng', 0))

                        is_duplicate = False

                        for dupe in all_routes:
                            db_date = str(dupe.date)
                            db_dist = round(float(dupe.distanceKm), 1)

                            s_data = dupe.startLocation
                            if isinstance(s_data, str):
                                s_data = json.loads(s_data)

                            d_s = s_data.get('coord', {})
                            db_lat = float(d_s.get('lat', 0))
                            db_lng = float(d_s.get('lng', 0))

                            date_match = (db_date == curr_date)
                            dist_match = (db_dist == curr_dist)
                            coord_match = (abs(db_lat - curr_lat) < 0.001 and abs(db_lng - curr_lng) < 0.001)

                            if date_match and dist_match and coord_match:
                                is_duplicate = True
                                break

                        if is_duplicate:
                            print(f"--- [SKIP] {filename} уже есть")
                            stats['skipped'] += 1
                            continue

                        new_obj = Route.objects.create(
                            name=data['name'],
                            distanceKm=data['distanceKm'],
                            points=data['points'],
                            date=data['date'],
                            startLocation=data['startLocation'],
                            endLocation=data['endLocation']
                        )
                        all_routes.append(new_obj)
                        stats['created'] += 1
                        print(f"+++ [NEW] {filename} добавлен")

                except Exception as e:
                    print(f"!!! Ошибка {filename}: {e}")
                    stats['errors'] += 1

        return Response({
            'status': 'success',
            'message': 'Импорт завершен',
            'created': stats['created'],
            'skipped': stats['skipped'],
            'errors': stats['errors']
        })

    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        route = self.get_object()

        gpx = gpxpy.gpx.GPX()
        gpx_track = gpxpy.gpx.GPXTrack(name=route.name)
        gpx.tracks.append(gpx_track)
        gpx_segment = gpxpy.gpx.GPXTrackSegment()
        gpx_track.segments.append(gpx_segment)

        for pt in route.points:
            gpx_segment.points.append(gpxpy.gpx.GPXTrackPoint(pt['lat'], pt['lng']))

        xml_data = gpx.to_xml()

        response = HttpResponse(xml_data, content_type='application/gpx+xml')
        response['Content-Disposition'] = f'attachment; filename="{route.name}.gpx"'
        return response