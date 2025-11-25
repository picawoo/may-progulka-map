from django.contrib.gis.db import models


class Route(models.Model):
    TYPE_CHOICES = [
        ('walk', 'Пешеходный'),
        ('bike', 'Велосипедный'),
    ]

    name = models.CharField("Название", max_length=255)
    year = models.IntegerField("Год")
    distance_km = models.FloatField("Дистанция (км)")
    route_type = models.CharField("Тип", max_length=10, choices=TYPE_CHOICES, default='walk')

    # Файл для скачивания пользователем
    gpx_file = models.FileField(upload_to='gpx_archives/', null=True, blank=True)

    geom = models.MultiLineStringField("Маршрут")

    def __str__(self):
        return f"{self.year} - {self.name} ({self.distance_km}km)"
