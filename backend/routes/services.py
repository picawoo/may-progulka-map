import gpxpy
import re

from django.utils import timezone

from .models import Route
from math import radians, cos, sin, asin, sqrt


def process_gpx_file(file_data, file_name):
    """
    Общая логика парсинга GPX для одиночного и массового импорта.
    file_obj: объект файла или путь к нему
    file_name: имя файла для парсинга года
    """
    try:
        if hasattr(file_data, 'read'):
            file_data.seek(0)
            content = file_data.read()
        else:
            content = file_data

        gpx = gpxpy.parse(content)

        year_match = re.search(r'\d{4}', file_name)
        parsed_date = f"{year_match.group()}-05-15" if year_match else timezone.now().date().isoformat()

        points = []
        for track in gpx.tracks:
            for segment in track.segments:
                for p in segment.points:
                    points.append({'lat': p.latitude, 'lng': p.longitude})

        dist = round(gpx.length_2d() / 1000, 1) if gpx.tracks else 0

        start_coord = points[0] if points else None
        end_coord = points[-1] if points else None

        return {
            'distanceKm': dist,
            'points': points,
            'name': file_name.replace('.gpx', '').replace('.GPX', ''),
            'date': parsed_date,
            'startLocation': {
                "name": get_smart_location_name(start_coord, "Точка старта"),
                "coord": start_coord or {}
            },
            'endLocation': {
                "name": get_smart_location_name(end_coord, "Точка финиша"),
                "coord": end_coord or {}
            }
        }
    except Exception as e:
        raise Exception(f"Ошибка парсинга GPX: {str(e)}")


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
    if not coord:
        return default_name

    try:
        curr_lat = float(coord.get('lat'))
        curr_lng = float(coord.get('lng') or coord.get('lon'))
    except (TypeError, ValueError):
        return default_name

    bad_names = ["точка старта", "точка финиша", "старт", "финиш", "точка", default_name.lower()]

    existing_routes = Route.objects.all().only('startLocation', 'endLocation')
    threshold = 100

    for route in existing_routes:
        for loc in [route.startLocation, route.endLocation]:
            if not loc or not isinstance(loc, dict):
                continue

            db_name = loc.get('name', '')

            if db_name and db_name.lower().strip() not in bad_names:
                db_coord = loc.get('coord')
                if not db_coord: continue

                try:
                    db_lat = float(db_coord.get('lat'))
                    db_lng = float(db_coord.get('lng') or db_coord.get('lon'))

                    dist = haversine(curr_lng, curr_lat, db_lng, db_lat)

                    if dist < threshold:
                        return db_name
                except (TypeError, ValueError, AttributeError):
                    continue

    return default_name