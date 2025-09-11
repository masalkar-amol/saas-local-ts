from rest_framework import serializers
from .models import Biomarker
class BiomarkerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Biomarker
        fields = "__all__"
