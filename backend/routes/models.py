import json
import gpxpy
from django.db import models
from django.core.exceptions import ValidationError


class Route(models.Model):
    TYPE_CHOICES = (
        ('WALK', 'Пешеходный'),
        ('BIKE', 'Велосипедный'),
    )

    title = models.CharField("Название маршрута", max_length=255)
    year = models.PositiveIntegerField("Год")
    distance_km = models.FloatField("Дистанция (км)", help_text="Заявленная длина")
    route_type = models.CharField("Тип", max_length=10, choices=TYPE_CHOICES, default='WALK')

    # Сам файл для скачивания пользователями
    gpx_file = models.FileField("GPX файл", upload_to='routes/gpx/')

    # Поле для хранения готовой геометрии (чтобы не парсить файл каждый раз при запросе)
    # Используем стандартный JSONField (работает и в PostgreSQL, и в SQLite)
    geometry = models.JSONField("GeoJSON геометрия", blank=True, null=True, editable=False)

    class Meta:
        ordering = ['-year', 'distance_km']
        verbose_name = "Маршрут"
        verbose_name_plural = "Маршруты"

    def __str__(self):
        return f"{self.year} - {self.title} ({self.distance_km} км)"

    def save(self, *args, **kwargs):
        # Если файл загружен, парсим его и сохраняем геометрию
        if self.gpx_file and not self.geometry:
            try:
                self.gpx_file.open()
                gpx = gpxpy.parse(self.gpx_file)

                points = []
                if gpx.tracks:
                    for segment in gpx.tracks[0].segments:
                        for point in segment.points:
                            # GeoJSON формат: [lon, lat] (обратите внимание на порядок!)
                            points.append([point.longitude, point.latitude])

                if points:
                    self.geometry = {
                        "type": "LineString",
                        "coordinates": points
                    }
                self.gpx_file.close()
            except Exception as e:
                # Логируем ошибку, но не ломаем сохранение, если файл битый
                print(f"Error parsing GPX for {self.title}: {e}")

        super().save(*args, **kwargs)