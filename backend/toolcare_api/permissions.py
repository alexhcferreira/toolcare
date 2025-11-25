
from rest_framework import permissions

class IsMaximoUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo == 'MAXIMO'

class IsAdminOrMaximo(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.tipo in ['ADMINISTRADOR', 'MAXIMO']

class ReadOnly(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.method in permissions.SAFE_METHODS

class UsuarioPermissions(permissions.BasePermission):
    """
    Regras de permissão específicas para o endpoint de Usuários.
    """
    def has_permission(self, request, view):
        if view.action == 'list':
            return request.user.tipo == 'MAXIMO'
        
        if view.action == 'create' and request.user.tipo == 'COORDENADOR':
            return False
            
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        if request.user.tipo == 'MAXIMO':
            return True

        if request.user.tipo == 'ADMINISTRADOR' and obj.tipo == 'COORDENADOR':
            if view.action in ['retrieve', 'update', 'partial_update']:
                return True

        if obj == request.user:
            if view.action in ['retrieve', 'update', 'partial_update']:
                return True
        
        return False