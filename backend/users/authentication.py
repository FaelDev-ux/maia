from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed
from firebase_admin import auth

class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        # 1. Pega o cabeçalho "Authorization" da requisição enviada pelo Front-end
        auth_header = request.META.get('HTTP_AUTHORIZATION')
        
        if not auth_header:
            return None # Não enviou token, a requisição segue como "Anônima"

        # 2. O formato padrão é "Bearer <TOKEN_GIGANTE>". Vamos separar e pegar só o Token.
        try:
            token = auth_header.split(' ')[1]
        except IndexError:
            raise AuthenticationFailed('Formato de token inválido. Use "Bearer <token>".')

        try:
            # 3. Manda o Token para os servidores do Google validarem.
            # Se for falso ou estiver expirado, ele dá erro automático aqui.
            decoded_token = auth.verify_id_token(token)
            
            # O Django exige que a gente retorne uma tupla (usuario, auth).
            # Como não temos o usuário no DB local, retornamos o token decodificado no lugar do usuário.
            return (decoded_token, token)
            
        except Exception as e:
            raise AuthenticationFailed(f'Token inválido ou expirado: {str(e)}')