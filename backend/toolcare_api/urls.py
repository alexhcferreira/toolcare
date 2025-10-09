# backend/toolcare_api/urls.py

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from .views import SetorViewSet, CargoViewSet, FuncionarioViewSet, FerramentaViewSet, EmprestimoViewSet

router = DefaultRouter()

router.register(r'setores', SetorViewSet)
router.register(r'cargos', CargoViewSet)
router.register(r'funcionarios', FuncionarioViewSet)
router.register(r'ferramentas', FerramentaViewSet) # NOVO
router.register(r'emprestimos', EmprestimoViewSet) # NOVO

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)