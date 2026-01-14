from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    download_url = serializers.SerializerMethodField()

    class Meta:
        model = Route
        fields = [
            'id',
            'title',
            'year',
            'distance_km',
            'route_type',
            'geometry',    # Сам трек для отрисовки
            'download_url' # Ссылка на скачивание файла
        ]

    def get_download_url(self, obj):
        request = self.context.get('request')
        if obj.gpx_file and request:
            return request.build_absolute_uri(obj.gpx_file.url)
        return None