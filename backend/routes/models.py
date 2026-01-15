from django.db import models
from django.utils import timezone


class Route(models.Model):
    WALK_TYPES = [('walk', 'Пешая'), ('bike', 'Велосипедная')]

    name = models.CharField(
        max_length=255,
        default="Новый маршрут",
        verbose_name="Название"
    )

    date = models.DateField(
        default=timezone.now,
        verbose_name="Дата проведения"
    )

    distanceKm = models.FloatField(
        default=0.0,
        verbose_name="Дистанция (км)"
    )

    walkType = models.CharField(
        max_length=10,
        choices=WALK_TYPES,
        default='walk',
        verbose_name="Тип прогулки"
    )

    description = models.TextField(
        blank=True,
        default="",
        verbose_name="Описание"
    )

    startLocation = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Место старта"
    )
    
    endLocation = models.JSONField(
        default=dict,
        blank=True,
        verbose_name="Место финиша"
    )

    points = models.JSONField(
        default=list,
        blank=True,
        verbose_name="Координаты (трек)"
    )

    def __str__(self):
        return f"{self.date.year} - {self.name} ({self.distanceKm} км)"

    class Meta:
        ordering = ['-date', '-id']
        verbose_name = "Маршрут"
        verbose_name_plural = "Маршруты"