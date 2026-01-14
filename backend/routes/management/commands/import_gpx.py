import os
import gpxpy
from django.core.management.base import BaseCommand
from django.core.files import File
from routes.models import Route


class Command(BaseCommand):
    help = 'Импорт GPX файлов из папки'

    def add_arguments(self, parser):
        parser.add_argument('folder_path', type=str, help='Путь к папке с GPX')

    def handle(self, *args, **options):
        folder = options['folder_path']

        if not os.path.exists(folder):
            self.stdout.write(self.style.ERROR(f'Папка {folder} не найдена'))
            return

        for filename in os.listdir(folder):
            if filename.lower().endswith('.gpx'):
                file_path = os.path.join(folder, filename)

                try:
                    # 1. Читаем файл для парсинга метаданных (текстовый режим)
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f_text:
                        gpx = gpxpy.parse(f_text)

                    # 2. Рассчитываем параметры
                    dist = round(gpx.length_2d() / 1000, 1) if gpx.tracks else 0
                    # Пытаемся вытащить год из имени файла (первые 4 цифры)
                    import re
                    year_match = re.search(r'\d{4}', filename)
                    year = int(year_match.group()) if year_match else 2025

                    # 3. КЛЮЧЕВОЙ МОМЕНТ: Открываем файл в бинарном режиме для Django
                    # Используем os.path.basename(filename), чтобы убрать любые пути (../)
                    clean_filename = os.path.basename(filename)

                    with open(file_path, 'rb') as f_binary:
                        django_file = File(f_binary)

                        # Используем update_or_create, чтобы можно было запускать скрипт повторно
                        route, created = Route.objects.update_or_create(
                            title=clean_filename.replace('.gpx', ''),
                            defaults={
                                'year': year,
                                'distance_km': dist,
                                'route_type': 'BIKE' if 'bike' in filename.lower() else 'WALK',
                            }
                        )

                        # Сохраняем файл отдельно, передавая ТОЛЬКО чистое имя
                        # Это исправляет ошибку Path Traversal
                        route.gpx_file.save(clean_filename, django_file, save=True)

                    status = "Created" if created else "Updated"
                    self.stdout.write(self.style.SUCCESS(f'{status}: {clean_filename} ({dist} km)'))

                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error {filename}: {str(e)}'))