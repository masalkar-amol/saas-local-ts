from rest_framework import viewsets, filters
from .models import Biomarker
from .serializers import BiomarkerSerializer
class BiomarkerViewSet(viewsets.ModelViewSet):
    queryset = Biomarker.objects.all().order_by("-created_at")
    serializer_class = BiomarkerSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ["code","name","assay_type"]
    ordering_fields = ["created_at","code"]
