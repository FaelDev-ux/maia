from django.urls import path
from .views import CadastroUsuarioView, UsuarioDetailView

urlpatterns = [
    path('cadastro/', CadastroUsuarioView.as_view(), name='api_cadastro'),
    path('usuario/<str:uid>/', UsuarioDetailView.as_view(), name='api_usuario_detail'), # Rota para buscar detalhes do usuário
]