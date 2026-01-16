from rest_framework import generics
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny

from .models import IndustryCategory, Objective, STAGE_CHOICES
from .serializers import IndustryCategorySerializer, ObjectiveSerializer


class IndustryListView(generics.ListAPIView):
    queryset = IndustryCategory.objects.prefetch_related('subcategories').all()
    serializer_class = IndustryCategorySerializer
    permission_classes = [AllowAny]
    pagination_class = None


class ObjectiveListView(generics.ListAPIView):
    queryset = Objective.objects.all()
    serializer_class = ObjectiveSerializer
    permission_classes = [AllowAny]
    pagination_class = None


class StageListView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        stages = [{'value': value, 'label': label} for value, label in STAGE_CHOICES]
        return Response(stages)
