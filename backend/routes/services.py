import os
import gpxpy
import re
from .models import Route
from datetime import date
from math import radians, cos, sin, asin, sqrt


def run_gpx_import(folder_path, overwrite=False):
    """
    Универсальная функция для импорта.
    """
    stats = {'created': 0, 'updated': 0, 'skipped': 0, 'errors': 0}

    if not os.path.exists(folder_path):
        raise FileNotFoundError(f"Папка {folder_path} не найдена внутри контейнера")

    for filename in os.listdir(folder_path):
        if filename.lower().endswith('.gpx'):
            file_path = os.path.join(folder_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    gpx = gpxpy.parse(f)

                points = []
                for track in gpx.tracks:
                    for segment in track.segments:
                        for p in segment.points:
                            points.append({'lat': p.latitude, 'lng': p.longitude})

                dist = round(gpx.length_2d() / 1000, 1) if gpx.tracks else 0
                year_match = re.search(r'\d{4}', filename)
                year = int(year_match.group()) if year_match else 2025
                clean_name = filename.replace('.gpx', '').replace('_', ' ')

                if not overwrite and Route.objects.filter(name=clean_name).exists():
                    stats['skipped'] += 1
                    continue

                route, created = Route.objects.update_or_create(
                    name=clean_name,
                    defaults={
                        'date': date(year, 5, 18),
                        'distanceKm': dist,
                        'walkType': 'bike' if 'bike' in filename.lower() else 'walk',
                        'points': points,
                        'startLocation': {
                            "name": "Старт",
                            "coord": points[0] if points else {}
                        }
                    }
                )

                if created:
                    stats['created'] += 1
                else:
                    stats['updated'] += 1

            except Exception:
                stats['errors'] += 1

    return stats


from django.core.management.base import BaseCommand


class Command(BaseCommand):
    help = 'Импорт GPX файлов'

    def add_arguments(self, parser):
        parser.add_argument('folder_path', type=str)

    def handle(self, *args, **options):
        res = run_gpx_import(options['folder_path'], overwrite=True)
        self.stdout.write(f"Успех! Создано: {res['created']}, Обновлено: {res['updated']}")


def haversine(lon1, lat1, lon2, lat2):
    """
    Вычисляет расстояние в метрах между двумя точками на сфере.
    """
    R = 6371000
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat / 2) ** 2 + cos(lat1) * cos(lat2) * sin(dlon / 2) ** 2
    c = 2 * asin(sqrt(a))
    return R * c


def get_smart_location_name(coord, default_name="Точка"):
    """
    Ищет в базе ближайший маршрут. Если точка в пределах 50м,
    возвращает название этой локации.
    """
    if not coord or 'lat' not in coord or 'lng' not in coord:
        return default_name

    existing_routes = Route.objects.all().only('startLocation', 'endLocation')

    threshold = 50

    for route in existing_routes:
        s_loc = route.startLocation
        if s_loc and 'coord' in s_loc and s_loc['coord']:
            dist = haversine(coord['lng'], coord['lat'], s_loc['coord']['lng'], s_loc['coord']['lat'])
            if dist < threshold:
                return s_loc.get('name', default_name)

        e_loc = route.endLocation
        if e_loc and 'coord' in e_loc and e_loc['coord']:
            dist = haversine(coord['lng'], coord['lat'], e_loc['coord']['lng'], e_loc['coord']['lat'])
            if dist < threshold:
                return e_loc.get('name', default_name)

    return default_name