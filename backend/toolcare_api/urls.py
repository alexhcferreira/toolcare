from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import RedirectView

# Importe suas views
from .views import SetorViewSet, CargoViewSet, FuncionarioViewSet

# 1. Crie e Registre o router
router = DefaultRouter()
router.register(r'setores', SetorViewSet)
router.register(r'cargos', CargoViewSet)
router.register(r'funcionarios', FuncionarioViewSet)

# 2. Defina os padrões de URL principais do projeto.
urlpatterns = [
    # 2a. A rota do Admin
    path('admin/', admin.site.urls),
    
    # 2b. O principal endpoint da API (rotas DRF)
    # A rota 'api/' agora inclui as URLs geradas pelo router (router.urls).
    # O router já contém /setores/, /cargos/, etc.
    path('api/', include(router.urls)),
    
    # 2c. Redireciona a URL raiz (http://...:8000/) para o /api/
    # Se você não quiser que a URL raiz retorne 404, esta linha a envia para o /api/
    path('', RedirectView.as_view(url='api/', permanent=False)),
]

# 3. Adicione a configuração para servir arquivos de mídia (se DEBUG=True)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
