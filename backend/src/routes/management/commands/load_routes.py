import os
import re
import gpxpy
from django.core.management.base import BaseCommand
from django.contrib.gis.geos import LineString, MultiLineString
from django.core.files import File
from ....routes.models import Route


class Command(BaseCommand):
    help = 'Импорт GPX файлов из папки /app/gpx_data'

    def handle(self, *args, **options):
        folder_path = '/app/gpx_data'

        if not os.path.exists(folder_path):
            self.stdout.write(self.style.ERROR('Папка gpx_data пуста или не существует'))
            return

        for filename in os.listdir(folder_path):
            if not filename.endswith('.gpx'):
                continue

            file_path = os.path.join(folder_path, filename)
            self.stdout.write(f'Обработка {filename}...')

            try:
                year_match = re.search(r'(19|20)\d{2}', filename)
                year = int(year_match.group(0)) if year_match else 2025  # Дефолт, если не нашли

                is_bike = bool(re.search(r'velo|bike|вело', filename, re.IGNORECASE))
                route_type = 'bike' if is_bike else 'walk'

                with open(file_path, 'r', encoding='utf-8') as f:
                    gpx = gpxpy.parse(f)

                if not gpx.tracks:
                    continue

                track = gpx.tracks[0]
                points = []

                for segment in track.segments:
                    for point in segment.points:
                        points.append((point.longitude, point.latitude))

                if len(points) < 2:
                    continue

                line = LineString(points)
                multiline = MultiLineString(line)

                distance = track.length_2d() / 1000

                if not Route.objects.filter(name=filename, year=year).exists():
                    route_obj = Route(
                        name=track.name or filename,
                        year=year,
                        distance_km=round(distance, 2),
                        route_type=route_type,
                        geom=multiline
                    )
                    with open(file_path, 'rb') as f_binary:
                        route_obj.gpx_file.save(filename, File(f_binary), save=True)

                    self.stdout.write(self.style.SUCCESS(f'OK: {filename}'))
                else:
                    self.stdout.write(self.style.WARNING(f'SKIP: {filename} (уже есть)'))

            except Exception as e:
                self.stdout.write(self.style.ERROR(f'FAIL {filename}: {str(e)}'))