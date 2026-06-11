from rest_framework.authentication import BaseAuthentication
from rest_framework.exceptions import AuthenticationFailed

from .firebase import FirebaseNotConfiguredError, get_firebase_auth


class FirebaseUser:
    def __init__(self, decoded_token):
        self.decoded_token = decoded_token
        self.uid = decoded_token.get("uid")
        self.email = decoded_token.get("email")
        self.is_authenticated = True


class FirebaseAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.META.get("HTTP_AUTHORIZATION")

        if not auth_header:
            return None

        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != "bearer":
            raise AuthenticationFailed('Formato de token invalido. Use "Bearer <token>".')

        token = parts[1]

        try:
            decoded_token = get_firebase_auth().verify_id_token(token)
        except FirebaseNotConfiguredError as exc:
            raise AuthenticationFailed(str(exc)) from exc
        except Exception as exc:
            raise AuthenticationFailed("Token invalido ou expirado.") from exc

        return (FirebaseUser(decoded_token), token)
