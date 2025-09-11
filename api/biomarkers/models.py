from django.db import models
class Biomarker(models.Model):
    id = models.BigAutoField(primary_key=True)
    code = models.CharField(max_length=64, unique=True, db_index=True)
    name = models.CharField(max_length=255)
    assay_type = models.CharField(max_length=128, db_index=True)
    attributes = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self): return f"{self.code} - {self.name}"
