from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import FirebaseAuthentication
from .firebase import (
    FirebaseAuthRequestError,
    FirebaseNotConfiguredError,
    get_firebase_auth,
    get_firestore_client,
    server_timestamp,
    sign_in_with_password,
)


PROFILE_SLUGS = {
    "PUE": "recent-mother",
    "MMT": "experienced-mother",
    "DSM": "future-mother",
    "PRO": "health-professional",
    "ADM": "administrator",
}


def get_first_name(full_name):
    return (full_name or "Maia").strip().split(" ")[0]


def normalize_name(full_name):
    return " ".join((full_name or "").strip().lower().split())


def get_value(data, *keys):
    for key in keys:
        value = data.get(key)
        if value not in (None, ""):
            return value
    return None


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({"erro": message}, status=http_status)


def firebase_error_response(exc, http_status=status.HTTP_503_SERVICE_UNAVAILABLE):
    if isinstance(exc, FirebaseNotConfiguredError):
        return error_response(str(exc), http_status)

    if isinstance(exc, FirebaseAuthRequestError):
        return error_response(str(exc), status.HTTP_401_UNAUTHORIZED)

    return error_response(
        "Nao foi possivel concluir a operacao no Firebase.",
        status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def serialize_firestore_value(value):
    if isinstance(value, dict):
        return {key: serialize_firestore_value(current_value) for key, current_value in value.items()}

    if isinstance(value, list):
        return [serialize_firestore_value(item) for item in value]

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return value


def get_user_payload(uid):
    user_doc = get_firestore_client().collection("users").document(uid).get()

    if not user_doc.exists:
        return None

    return serialize_firestore_value(user_doc.to_dict())


def cleanup_created_user(uid):
    try:
        get_firestore_client().collection("users").document(uid).delete()
    except Exception:
        pass

    try:
        get_firebase_auth().delete_user(uid)
    except Exception:
        pass


def user_is_admin(firebase_user):
    claims = getattr(firebase_user, "decoded_token", {}) or {}
    return bool(claims.get("admin") or claims.get("role") == "ADM")


def ensure_user_can_access(request, uid):
    if request.user.uid == uid or user_is_admin(request.user):
        return None

    return error_response(
        "Voce nao tem permissao para acessar este perfil.",
        status.HTTP_403_FORBIDDEN,
    )


class CadastroUsuarioView(APIView):
    def post(self, request):
        data = request.data
        email = get_value(data, "email")
        password = get_value(data, "password", "senha")
        full_name = get_value(data, "name", "fullName", "nome_completo")
        phone = get_value(data, "phone", "telefone")
        birth_date = get_value(data, "birthDate", "data_nascimento")
        profile_code = get_value(data, "profileCode", "perfil") or "PUE"

        if not email or not password:
            return error_response("E-mail e senha sao obrigatorios.")

        if not full_name:
            return error_response("Nome completo e obrigatorio.")

        if profile_code not in PROFILE_SLUGS:
            return error_response("Perfil de usuario invalido.")

        created_uid = None

        try:
            firebase_auth = get_firebase_auth()
            db = get_firestore_client()

            user_record = firebase_auth.create_user(
                email=email,
                password=password,
                display_name=full_name,
            )
            created_uid = user_record.uid

            timestamp = server_timestamp()
            user_data = {
                "id": user_record.uid,
                "authUid": user_record.uid,
                "fullName": full_name,
                "normalizedName": normalize_name(full_name),
                "firstName": get_first_name(full_name),
                "email": email,
                "emailVerified": False,
                "phone": phone or "",
                "birthDate": birth_date or "",
                "profileCode": profile_code,
                "profileSlug": PROFILE_SLUGS[profile_code],
                "roles": [profile_code],
                "status": "active",
                "professionalVerificationStatus": "not-required",
                "privacy": {
                    "defaultAnonymousCommunityPost": True,
                    "showAvatarInCommunity": True,
                    "allowPersonalizedRecommendations": True,
                    "allowUsageAnalytics": False,
                },
                "notificationSummary": {
                    "dailyCheckInEnabled": False,
                    "pushEnabled": False,
                    "timezone": "America/Fortaleza",
                },
                "stats": {
                    "checkInsCount": 0,
                    "postsCount": 0,
                    "repliesCount": 0,
                    "supportsGivenCount": 0,
                    "supportsReceivedCount": 0,
                },
                "onboarding": {
                    "completed": False,
                    "completedSteps": [],
                },
                "acceptedTermsVersion": "pending",
                "acceptedPrivacyVersion": "pending",
                "createdAt": timestamp,
                "updatedAt": timestamp,
            }

            db.collection("users").document(user_record.uid).set(user_data)
            token_data = sign_in_with_password(email, password)

            return Response(
                {
                    "mensagem": "Usuario criado com sucesso no Maia.",
                    "accessToken": token_data.get("idToken"),
                    "refreshToken": token_data.get("refreshToken"),
                    "expiresIn": token_data.get("expiresIn"),
                    "uid": user_record.uid,
                    "user": serialize_firestore_value(
                        {
                            **user_data,
                            "createdAt": None,
                            "updatedAt": None,
                        }
                    ),
                },
                status=status.HTTP_201_CREATED,
            )
        except FirebaseNotConfiguredError as exc:
            if created_uid:
                cleanup_created_user(created_uid)
            return firebase_error_response(exc)
        except FirebaseAuthRequestError as exc:
            if created_uid:
                cleanup_created_user(created_uid)
            return firebase_error_response(exc)
        except Exception:
            if created_uid:
                cleanup_created_user(created_uid)
            return error_response("Nao foi possivel criar o usuario.")


class LoginUsuarioView(APIView):
    def post(self, request):
        data = request.data
        email = get_value(data, "email")
        password = get_value(data, "password", "senha")

        if not email or not password:
            return error_response("E-mail e senha sao obrigatorios.")

        try:
            token_data = sign_in_with_password(email, password)
            uid = token_data.get("localId")
            user = get_user_payload(uid) if uid else None

            return Response(
                {
                    "mensagem": "Login realizado com sucesso.",
                    "accessToken": token_data.get("idToken"),
                    "refreshToken": token_data.get("refreshToken"),
                    "expiresIn": token_data.get("expiresIn"),
                    "uid": uid,
                    "user": user,
                },
                status=status.HTTP_200_OK,
            )
        except (FirebaseNotConfiguredError, FirebaseAuthRequestError) as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response("Nao foi possivel realizar o login.")


class UsuarioDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request, uid):
        permission_error = ensure_user_can_access(request, uid)
        if permission_error:
            return permission_error

        try:
            user_doc = get_firestore_client().collection("users").document(uid).get()

            if not user_doc.exists:
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            return Response(user_doc.to_dict(), status=status.HTTP_200_OK)
        except FirebaseNotConfiguredError as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response(
                "Nao foi possivel buscar o usuario.",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def put(self, request, uid):
        permission_error = ensure_user_can_access(request, uid)
        if permission_error:
            return permission_error

        try:
            db = get_firestore_client()
            user_ref = db.collection("users").document(uid)

            if not user_ref.get().exists:
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            data = request.data
            full_name = get_value(data, "name", "fullName", "nome_completo")

            updated_data = {
                "fullName": full_name,
                "phone": get_value(data, "phone", "telefone"),
                "birthDate": get_value(data, "birthDate", "data_nascimento"),
                "updatedAt": server_timestamp(),
            }

            if full_name:
                updated_data["normalizedName"] = normalize_name(full_name)
                updated_data["firstName"] = get_first_name(full_name)

            updated_data = {key: value for key, value in updated_data.items() if value is not None}
            user_ref.update(updated_data)

            if full_name:
                get_firebase_auth().update_user(uid, display_name=full_name)

            return Response({"mensagem": "Perfil atualizado com sucesso."}, status=status.HTTP_200_OK)
        except FirebaseNotConfiguredError as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response("Nao foi possivel atualizar o perfil.")

    def delete(self, request, uid):
        permission_error = ensure_user_can_access(request, uid)
        if permission_error:
            return permission_error

        try:
            db = get_firestore_client()
            user_ref = db.collection("users").document(uid)

            if not user_ref.get().exists:
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            user_ref.update(
                {
                    "status": "pending-deletion",
                    "deletedAt": server_timestamp(),
                    "updatedAt": server_timestamp(),
                }
            )

            get_firebase_auth().update_user(uid, disabled=True)

            return Response(
                {"mensagem": "Conta marcada para exclusao e acesso desativado."},
                status=status.HTTP_200_OK,
            )
        except FirebaseNotConfiguredError as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response("Nao foi possivel iniciar a exclusao da conta.")


class MeView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user = get_user_payload(request.user.uid)

            if not user:
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            return Response({"user": user}, status=status.HTTP_200_OK)
        except FirebaseNotConfiguredError as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response(
                "Nao foi possivel buscar a sessao.",
                status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LogoutUsuarioView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"mensagem": "Sessao encerrada."}, status=status.HTTP_200_OK)
