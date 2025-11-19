# backend/toolcare_api/permissions.py

from rest_framework import permissions

# Permissão para verificar se o usuário é do tipo MÁXIMO
class IsMaximoUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == 'MAXIMO'

# Permissão para verificar se o usuário é ADMIN ou MÁXIMO
class IsAdminOrMaximo(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo in ['ADMINISTRADOR', 'MAXIMO']

# Permissão para permitir apenas leitura (GET, HEAD, OPTIONS)
class ReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

# --- CLASSE DE PERMISSÃO DE USUÁRIO RESTAURADA ---
# Permissão customizada e detalhada para o CRUD de Usuários
class UsuarioPermissions(permissions.BasePermission):
    """
    Regras de permissão específicas para o endpoint de Usuários.
    """
    def has_permission(self, request, view):
        # Usuário MÁXIMO pode listar todos os usuários
        if view.action == 'list':
            return request.user.tipo == 'MAXIMO'
        
        # Coordenadores não podem criar usuários
        if view.action == 'create' and request.user.tipo == 'COORDENADOR':
            return False
            
        # Qualquer usuário autenticado pode tentar acessar outras ações (como ver a si mesmo)
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Usuário MÁXIMO pode fazer tudo em qualquer objeto de usuário
        if request.user.tipo == 'MAXIMO':
            return True

        # Administrador pode ver (retrieve) e editar (update) Coordenadores
        if request.user.tipo == 'ADMINISTRADOR' and obj.tipo == 'COORDENADOR':
            if view.action in ['retrieve', 'update', 'partial_update']:
                return True

        # Um usuário sempre pode ver (retrieve) e editar (update) a si mesmo
        if obj == request.user:
            if view.action in ['retrieve', 'update', 'partial_update']:
                return True
        
        # Nega todas as outras interações entre objetos
        return False