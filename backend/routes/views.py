from rest_framework import generics
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.filters import OrderingFilter
from .models import Route
from .serializers import RouteSerializer


class RouteListAPIView(generics.ListAPIView):
    """
    Возвращает список маршрутов с геометрией.
    Поддерживает фильтрацию по году и типу.
    Пример: /api/routes/?year=2024&route_type=BIKE
    """
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    filter_backends = [DjangoFilterBackend, OrderingFilter]
    filterset_fields = ['year', 'route_type']  # Поля для фильтрации
    ordering_fields = ['year', 'distance_km']

    # Опционально: пагинацию можно отключить, если нужно показать все 175 сразу
    pagination_class = None