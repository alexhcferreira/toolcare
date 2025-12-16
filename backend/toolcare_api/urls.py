from django.contrib import admin
from django.urls import path, include 
from rest_framework.routers import DefaultRouter
from django.conf import settings
from .views import CustomTokenObtainPairView
from django.conf.urls.static import static
from .views import FilialViewSet, DepositoViewSet, SetorViewSet, CargoViewSet, FuncionarioViewSet, FerramentaViewSet, EmprestimoViewSet, ManutencaoViewSet, UsuarioViewSet
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

router = DefaultRouter()

router.register(r'filiais', FilialViewSet)
router.register(r'depositos', DepositoViewSet)
router.register(r'setores', SetorViewSet)
router.register(r'cargos', CargoViewSet)
router.register(r'funcionarios', FuncionarioViewSet)
router.register(r'ferramentas', FerramentaViewSet)
router.register(r'emprestimos', EmprestimoViewSet)
router.register(r'manutencoes', ManutencaoViewSet)
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    path('api/', include(router.urls)),
    
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework'))
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)