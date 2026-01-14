from rest_framework import serializers
from .models import Route

class RouteSerializer(serializers.ModelSerializer):
    date = serializers.DateField()

    class Meta:
        model = Route
        fields = '__all__'