import logging

from firebase_admin import auth as firebase_admin_auth
from firebase_admin import exceptions as firebase_admin_exceptions
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
    refresh_id_token,
    reset_password_with_oob_code,
    send_password_reset_email,
    server_timestamp,
    sign_in_with_password,
)
from .permissions import user_is_admin


logger = logging.getLogger(__name__)


PROFILE_SLUGS = {
    "PUE": "recent-mother",
    "MMT": "experienced-mother",
    "DSM": "future-mother",
    "PRO": "health-professional",
    "ADM": "administrator",
}

PROFILE_CODES = {slug: code for code, slug in PROFILE_SLUGS.items()}

PRIVACY_FIELDS = {
    "defaultAnonymousCommunityPost",
    "showAvatarInCommunity",
    "allowPersonalizedRecommendations",
    "allowUsageAnalytics",
}

NOTIFICATION_SUMMARY_FIELDS = {
    "dailyCheckInEnabled",
    "pushEnabled",
    "timezone",
    "dailyCheckInTime",
}

RECENT_MOTHER_FIELDS = {"babyIds", "babyBirthDate", "bio", "supportNeeds"}
FUTURE_MOTHER_FIELDS = {"journeyMoment", "interests", "supportNeeds"}
MENTOR_FIELDS = {"motherhoodExperience", "mentorBio", "availableForSupport", "supportTopics"}
PROFESSIONAL_FIELDS = {
    "registrationNumber",
    "council",
    "state",
    "specialty",
    "verifiedAt",
    "verifiedBy",
    "publicBio",
}
ONBOARDING_FIELDS = {"completed", "selectedProfileAt", "completedAt", "completedSteps"}


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


def get_dict_value(data, key):
    value = data.get(key)

    return value if isinstance(value, dict) else None


def get_list_value(data, key):
    value = data.get(key)

    return value if isinstance(value, list) else None


def filter_known_fields(data, allowed_fields):
    if not isinstance(data, dict):
        return {}

    return {key: value for key, value in data.items() if key in allowed_fields and value is not None}


def get_profile_code_from_update(data, current_user):
    profile_code = get_value(data, "profileCode")

    if profile_code in PROFILE_SLUGS:
        return profile_code

    profile_slug = get_value(data, "profileSlug")

    if profile_slug in PROFILE_CODES:
        return PROFILE_CODES[profile_slug]

    return current_user.get("profileCode") or "PUE"


def get_current_roles(current_user):
    roles = current_user.get("roles")

    if isinstance(roles, list):
        return [role for role in roles if isinstance(role, str)]

    if isinstance(roles, str):
        return [roles]

    return []


def build_profile_update_data(data, current_user):
    updated_data = {}
    full_name = get_value(data, "name", "fullName", "nome_completo")
    phone = get_value(data, "phone", "telefone")
    birth_date = get_value(data, "birthDate", "data_nascimento")
    avatar_url = get_value(data, "avatarUrl")
    profile_code = get_profile_code_from_update(data, current_user)

    if full_name is not None:
        updated_data["fullName"] = full_name
        updated_data["normalizedName"] = normalize_name(full_name)
        updated_data["firstName"] = get_first_name(full_name)

    if phone is not None:
        updated_data["phone"] = phone

    if birth_date is not None:
        updated_data["birthDate"] = birth_date

    if avatar_url is not None:
        updated_data["avatarUrl"] = avatar_url

    if profile_code in PROFILE_SLUGS:
        updated_data["profileCode"] = profile_code
        updated_data["profileSlug"] = PROFILE_SLUGS[profile_code]
        updated_data["roles"] = list(
            dict.fromkeys([*get_current_roles(current_user), profile_code])
        )

    privacy = filter_known_fields(get_dict_value(data, "privacy"), PRIVACY_FIELDS)
    if privacy:
        updated_data["privacy"] = {**(current_user.get("privacy") or {}), **privacy}

    notification_summary = filter_known_fields(
        get_dict_value(data, "notificationSummary"),
        NOTIFICATION_SUMMARY_FIELDS,
    )
    if notification_summary:
        updated_data["notificationSummary"] = {
            **(current_user.get("notificationSummary") or {}),
            **notification_summary,
        }

    recent_mother = filter_known_fields(get_dict_value(data, "recentMother"), RECENT_MOTHER_FIELDS)
    if recent_mother:
        updated_data["recentMother"] = {**(current_user.get("recentMother") or {}), **recent_mother}

    future_mother = filter_known_fields(get_dict_value(data, "futureMother"), FUTURE_MOTHER_FIELDS)
    if future_mother:
        updated_data["futureMother"] = {**(current_user.get("futureMother") or {}), **future_mother}

    mentor = filter_known_fields(get_dict_value(data, "mentor"), MENTOR_FIELDS)
    if mentor:
        updated_data["mentor"] = {**(current_user.get("mentor") or {}), **mentor}

    professional = filter_known_fields(get_dict_value(data, "professional"), PROFESSIONAL_FIELDS)
    if professional:
        updated_data["professional"] = {**(current_user.get("professional") or {}), **professional}

        if current_user.get("professionalVerificationStatus") != "verified":
            updated_data["professionalVerificationStatus"] = "pending"

    onboarding = filter_known_fields(get_dict_value(data, "onboarding"), ONBOARDING_FIELDS)
    if onboarding:
        updated_data["onboarding"] = {**(current_user.get("onboarding") or {}), **onboarding}

    completed_steps = get_list_value(data, "completedSteps")
    if completed_steps is not None:
        updated_data["onboarding"] = {
            **(current_user.get("onboarding") or {}),
            **(updated_data.get("onboarding") or {}),
            "completedSteps": completed_steps,
        }

    updated_data["updatedAt"] = server_timestamp()

    return updated_data


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST, code="request_error"):
    return Response(
        {
            "erro": message,
            "code": code,
            "status": http_status,
        },
        status=http_status,
    )


def firebase_error_response(exc, http_status=status.HTTP_503_SERVICE_UNAVAILABLE):
    if isinstance(exc, FirebaseNotConfiguredError):
        return error_response(str(exc), http_status)

    if isinstance(exc, FirebaseAuthRequestError):
        return error_response(str(exc), status.HTTP_401_UNAUTHORIZED)

    return error_response(
        "Nao foi possivel concluir a operacao no Firebase.",
        status.HTTP_500_INTERNAL_SERVER_ERROR,
    )


def firebase_create_user_error_response(exc):
    if isinstance(exc, firebase_admin_auth.EmailAlreadyExistsError):
        return error_response(
            "Este e-mail ja esta cadastrado. Tente entrar ou recuperar sua senha.",
            status.HTTP_409_CONFLICT,
        )

    if isinstance(exc, firebase_admin_auth.PhoneNumberAlreadyExistsError):
        return error_response(
            "Este telefone ja esta vinculado a outra conta.",
            status.HTTP_409_CONFLICT,
        )

    if isinstance(exc, firebase_admin_auth.UidAlreadyExistsError):
        return error_response(
            "Nao foi possivel criar o usuario com esses dados.",
            status.HTTP_409_CONFLICT,
        )

    if isinstance(exc, firebase_admin_exceptions.PermissionDeniedError):
        logger.warning("Firebase Admin sem permissao para criar usuario.", exc_info=True)
        return error_response(
            "Nao foi possivel criar sua conta agora. Tente novamente em alguns minutos.",
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if isinstance(exc, firebase_admin_exceptions.UnavailableError):
        return error_response(
            (
                "O servico de autenticacao esta indisponivel no momento. "
                "Tente novamente em alguns minutos."
            ),
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    if isinstance(exc, firebase_admin_exceptions.FirebaseError):
        logger.warning("Firebase Admin falhou ao criar usuario.", exc_info=True)
        return error_response(
            "Nao foi possivel criar sua conta agora. Tente novamente em alguns minutos.",
            status.HTTP_503_SERVICE_UNAVAILABLE,
        )

    error_message = str(exc).lower()

    if "email" in error_message:
        return error_response("Informe um e-mail valido.")

    if "password" in error_message or "senha" in error_message:
        return error_response(
            "A senha informada nao atende aos requisitos. Use pelo menos 8 caracteres."
        )

    return error_response("Confira os dados de cadastro e tente novamente.")


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
        professional = data.get("professional") if isinstance(data.get("professional"), dict) else {}

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
                "professionalVerificationStatus": "pending" if profile_code == "PRO" else "not-required",
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
                    "completed": True,
                    "completedSteps": ["select-type"],
                },
                "acceptedTermsVersion": "pending",
                "acceptedPrivacyVersion": "pending",
                "createdAt": timestamp,
                "updatedAt": timestamp,
            }

            if profile_code == "PRO":
                user_data["professional"] = {
                    "registrationNumber": get_value(professional, "registrationNumber") or "",
                    "council": get_value(professional, "council") or "",
                    "state": get_value(professional, "state") or "",
                    "specialty": get_value(professional, "specialty") or "",
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
        except (firebase_admin_exceptions.FirebaseError, ValueError) as exc:
            if created_uid:
                cleanup_created_user(created_uid)
            return firebase_create_user_error_response(exc)
        except Exception:
            if created_uid:
                cleanup_created_user(created_uid)
            logger.exception("Erro inesperado ao criar usuario.")
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


class RefreshUsuarioView(APIView):
    def post(self, request):
        refresh_token = get_value(request.data, "refreshToken", "refresh_token")

        if not refresh_token:
            return error_response("Refresh token e obrigatorio.", status.HTTP_401_UNAUTHORIZED)

        try:
            token_data = refresh_id_token(refresh_token)
            uid = token_data.get("user_id")
            user = get_user_payload(uid) if uid else None

            return Response(
                {
                    "mensagem": "Sessao renovada com sucesso.",
                    "accessToken": token_data.get("id_token"),
                    "refreshToken": token_data.get("refresh_token") or refresh_token,
                    "expiresIn": token_data.get("expires_in"),
                    "uid": uid,
                    "user": user,
                },
                status=status.HTTP_200_OK,
            )
        except (FirebaseNotConfiguredError, FirebaseAuthRequestError) as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response("Nao foi possivel renovar a sessao.")


class ForgotPasswordView(APIView):
    def post(self, request):
        email = get_value(request.data, "email")

        if not email:
            return error_response("E-mail e obrigatorio.")

        try:
            send_password_reset_email(email)

            return Response(
                {
                    "mensagem": (
                        "Se este e-mail estiver cadastrado, enviaremos instrucoes para recuperar a senha."
                    )
                },
                status=status.HTTP_200_OK,
            )
        except (FirebaseNotConfiguredError, FirebaseAuthRequestError) as exc:
            return firebase_error_response(exc)
        except Exception:
            logger.exception("Erro inesperado ao solicitar recuperacao de senha.")
            return error_response("Nao foi possivel solicitar a recuperacao de senha.")


class ResetPasswordView(APIView):
    def post(self, request):
        oob_code = get_value(request.data, "oobCode", "oob_code", "code")
        new_password = get_value(request.data, "newPassword", "new_password", "password")

        if not oob_code or not new_password:
            return error_response("Codigo de recuperacao e nova senha sao obrigatorios.")

        try:
            reset_password_with_oob_code(oob_code, new_password)

            return Response(
                {"mensagem": "Senha redefinida com sucesso."},
                status=status.HTTP_200_OK,
            )
        except (FirebaseNotConfiguredError, FirebaseAuthRequestError) as exc:
            return firebase_error_response(exc)
        except Exception:
            logger.exception("Erro inesperado ao redefinir senha.")
            return error_response("Nao foi possivel redefinir a senha.")


class ChangePasswordView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = get_value(request.data, "currentPassword", "current_password")
        new_password = get_value(request.data, "newPassword", "new_password", "password")

        if not current_password or not new_password:
            return error_response("Senha atual e nova senha sao obrigatorias.")

        if current_password == new_password:
            return error_response("A nova senha precisa ser diferente da senha atual.")

        try:
            user = get_user_payload(request.user.uid)

            if not user or not user.get("email"):
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            sign_in_with_password(user["email"], current_password)
            get_firebase_auth().update_user(request.user.uid, password=new_password)

            return Response(
                {"mensagem": "Senha atualizada com sucesso."},
                status=status.HTTP_200_OK,
            )
        except FirebaseAuthRequestError:
            return error_response("Senha atual invalida.", status.HTTP_401_UNAUTHORIZED)
        except FirebaseNotConfiguredError as exc:
            return firebase_error_response(exc)
        except (firebase_admin_exceptions.FirebaseError, ValueError):
            return error_response(
                "A nova senha nao atende aos requisitos. Use pelo menos 8 caracteres."
            )
        except Exception:
            logger.exception("Erro inesperado ao alterar senha.")
            return error_response("Nao foi possivel alterar a senha.")


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

            user_snapshot = user_ref.get()

            if not user_snapshot.exists:
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            data = request.data
            current_user = user_snapshot.to_dict() or {}
            updated_data = build_profile_update_data(data, current_user)
            user_ref.update(updated_data)

            if "fullName" in updated_data:
                get_firebase_auth().update_user(uid, display_name=updated_data["fullName"])

            updated_user = get_user_payload(uid)

            return Response(
                {
                    "mensagem": "Perfil atualizado com sucesso.",
                    "user": updated_user,
                },
                status=status.HTTP_200_OK,
            )
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


class OnboardingUsuarioView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def put(self, request, uid):
        permission_error = ensure_user_can_access(request, uid)
        if permission_error:
            return permission_error

        try:
            db = get_firestore_client()
            user_ref = db.collection("users").document(uid)
            user_snapshot = user_ref.get()

            if not user_snapshot.exists:
                return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

            current_user = user_snapshot.to_dict() or {}
            data = request.data
            onboarding = filter_known_fields(data, ONBOARDING_FIELDS)

            if "completed" not in onboarding:
                onboarding["completed"] = True

            if "completedSteps" not in onboarding:
                onboarding["completedSteps"] = data.get("completedSteps") or ["select-type"]

            updated_data = {
                "onboarding": {
                    **(current_user.get("onboarding") or {}),
                    **onboarding,
                },
                "updatedAt": server_timestamp(),
            }
            user_ref.update(updated_data)

            return Response(
                {
                    "mensagem": "Onboarding atualizado com sucesso.",
                    "user": get_user_payload(uid),
                },
                status=status.HTTP_200_OK,
            )
        except FirebaseNotConfiguredError as exc:
            return firebase_error_response(exc)
        except Exception:
            return error_response("Nao foi possivel atualizar o onboarding.")


class LogoutUsuarioView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        return Response({"mensagem": "Sessao encerrada."}, status=status.HTTP_200_OK)
