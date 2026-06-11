from rest_framework.permissions import BasePermission

from .firebase import get_firestore_client


ADMIN_ROLE = "ADM"
PROFESSIONAL_ROLE = "PRO"


def normalize_roles(value):
    if isinstance(value, str):
        return {value}

    if isinstance(value, (list, tuple, set)):
        return {role for role in value if isinstance(role, str)}

    return set()


def get_claim_roles(firebase_user):
    claims = getattr(firebase_user, "decoded_token", {}) or {}
    roles = normalize_roles(claims.get("roles"))
    role = claims.get("role")

    if isinstance(role, str):
        roles.add(role)

    if claims.get("admin"):
        roles.add(ADMIN_ROLE)

    return roles


def get_firestore_roles(uid):
    if not uid:
        return set()

    user_doc = get_firestore_client().collection("users").document(uid).get()

    if not user_doc.exists:
        return set()

    user_data = user_doc.to_dict() or {}
    roles = normalize_roles(user_data.get("roles"))
    profile_code = user_data.get("profileCode")

    if isinstance(profile_code, str):
        roles.add(profile_code)

    return roles


def get_user_roles(firebase_user):
    roles = get_claim_roles(firebase_user)

    if roles:
        return roles

    return get_firestore_roles(getattr(firebase_user, "uid", None))


def user_has_role(firebase_user, role):
    return role in get_user_roles(firebase_user)


def user_is_admin(firebase_user):
    return user_has_role(firebase_user, ADMIN_ROLE)


class IsAdminRole(BasePermission):
    message = "Voce nao tem permissao administrativa para acessar este recurso."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)

        return bool(getattr(user, "is_authenticated", False) and user_is_admin(user))


class IsProfessionalRole(BasePermission):
    message = "Este recurso esta disponivel apenas para profissionais de saude."

    def has_permission(self, request, view):
        user = getattr(request, "user", None)

        return bool(getattr(user, "is_authenticated", False) and user_has_role(user, PROFESSIONAL_ROLE))
