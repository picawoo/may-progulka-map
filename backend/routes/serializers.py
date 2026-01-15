from rest_framework import serializers
from .models import Route
import logging

logger = logging.getLogger(__name__)

class RouteSerializer(serializers.ModelSerializer):
    date = serializers.DateField()
    
    def to_representation(self, instance):
        """Преобразуем данные для API"""
        try:
            data = super().to_representation(instance)
        except Exception as e:
            logger.error(f"Ошибка при сериализации маршрута {instance.id}: {str(e)}")
            # Если произошла ошибка при сериализации, возвращаем базовую структуру
            try:
                return {
                    'id': instance.id,
                    'name': getattr(instance, 'name', ''),
                    'date': str(instance.date) if hasattr(instance, 'date') and instance.date else '',
                    'distanceKm': getattr(instance, 'distanceKm', 0),
                    'walkType': getattr(instance, 'walkType', 'walk'),
                    'description': getattr(instance, 'description', ''),
                    'points': [],
                    'startLocation': {
                        'name': '',
                        'coord': {'lat': 0, 'lng': 0}
                    }
                }
            except Exception as e2:
                logger.error(f"Критическая ошибка при создании базовой структуры: {str(e2)}")
                raise
        
        # Убеждаемся, что startLocation имеет правильную структуру
        try:
            if 'startLocation' in data:
                if not data['startLocation'] or not isinstance(data['startLocation'], dict):
                    data['startLocation'] = {
                        'name': '',
                        'coord': {'lat': 0, 'lng': 0}
                    }
                else:
                    # Нормализуем структуру startLocation
                    if 'name' not in data['startLocation']:
                        data['startLocation']['name'] = ''
                    if 'coord' not in data['startLocation'] or not isinstance(data['startLocation']['coord'], dict):
                        data['startLocation']['coord'] = {'lat': 0, 'lng': 0}
                    elif 'lat' not in data['startLocation']['coord'] or 'lng' not in data['startLocation']['coord']:
                        data['startLocation']['coord'] = {'lat': 0, 'lng': 0}
            else:
                data['startLocation'] = {
                    'name': '',
                    'coord': {'lat': 0, 'lng': 0}
                }
        except Exception as e:
            logger.warning(f"Ошибка при обработке startLocation для маршрута {data.get('id', 'unknown')}: {str(e)}")
            data['startLocation'] = {
                'name': '',
                'coord': {'lat': 0, 'lng': 0}
            }
        
        # Убеждаемся, что points существует и является списком
        try:
            if 'points' not in data or data['points'] is None:
                data['points'] = []
            elif not isinstance(data['points'], list):
                data['points'] = []
        except Exception as e:
            logger.warning(f"Ошибка при обработке points для маршрута {data.get('id', 'unknown')}: {str(e)}")
            data['points'] = []
        
        return data

    class Meta:
        model = Route
        fields = '__all__'