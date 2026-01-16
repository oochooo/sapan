from rest_framework import serializers
from .models import IndustryCategory, IndustrySubcategory, Objective, STAGE_CHOICES


class IndustrySubcategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = IndustrySubcategory
        fields = ['id', 'name', 'slug']


class IndustryCategorySerializer(serializers.ModelSerializer):
    subcategories = IndustrySubcategorySerializer(many=True, read_only=True)

    class Meta:
        model = IndustryCategory
        fields = ['id', 'name', 'slug', 'subcategories']


class ObjectiveSerializer(serializers.ModelSerializer):
    class Meta:
        model = Objective
        fields = ['id', 'name', 'slug', 'category']


class StageSerializer(serializers.Serializer):
    value = serializers.CharField()
    label = serializers.CharField()
