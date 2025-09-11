from rest_framework.routers import DefaultRouter
from .views import BiomarkerViewSet
router = DefaultRouter()
router.register("biomarkers", BiomarkerViewSet)
urlpatterns = router.urls
