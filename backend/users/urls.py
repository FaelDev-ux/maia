from django.urls import path

from .views import (
    CadastroUsuarioView,
    LoginUsuarioView,
    LogoutUsuarioView,
    MeView,
    RefreshUsuarioView,
    UsuarioDetailView,
)


urlpatterns = [
    path("cadastro/", CadastroUsuarioView.as_view(), name="api_cadastro"),
    path("login/", LoginUsuarioView.as_view(), name="api_login"),
    path("refresh/", RefreshUsuarioView.as_view(), name="api_refresh"),
    path("logout/", LogoutUsuarioView.as_view(), name="api_logout"),
    path("me/", MeView.as_view(), name="api_me"),
    path("usuario/<str:uid>/", UsuarioDetailView.as_view(), name="api_usuario_detail"),
]
