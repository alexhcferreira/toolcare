from rest_framework.pagination import PageNumberPagination

class PaginacaoSobDemanda(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 1000

    def paginate_queryset(self, queryset, request, view=None):
        # A MÁGICA: Se não tiver o parâmetro 'page' na URL, desativa a paginação!
        if 'page' not in request.query_params:
            return None
        
        return super().paginate_queryset(queryset, request, view)