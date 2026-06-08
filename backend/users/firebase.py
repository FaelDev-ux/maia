from firebase_admin import auth, credentials, firestore, get_app, initialize_app
from google.auth.exceptions import DefaultCredentialsError
from django.conf import settings
import json
import requests


class FirebaseNotConfiguredError(RuntimeError):
    pass


class FirebaseAuthRequestError(RuntimeError):
    pass


def initialize_firebase_app():
    try:
        return get_app()
    except ValueError:
        pass

    credentials_json = settings.FIREBASE_CREDENTIALS_JSON
    credentials_file = settings.FIREBASE_CREDENTIALS_FILE

    if credentials_json:
        try:
            credential = credentials.Certificate(json.loads(credentials_json))
            return initialize_app(credential)
        except (json.JSONDecodeError, ValueError, DefaultCredentialsError) as exc:
            raise FirebaseNotConfiguredError(
                "FIREBASE_CREDENTIALS_JSON invalido ou indisponivel."
            ) from exc

    if not credentials_file:
        try:
            return initialize_app(credentials.ApplicationDefault())
        except (ValueError, DefaultCredentialsError) as exc:
            raise FirebaseNotConfiguredError(
                "Credencial Firebase indisponivel. Configure FIREBASE_CREDENTIALS_JSON ou FIREBASE_CREDENTIALS_FILE."
            ) from exc

    try:
        credential = credentials.Certificate(credentials_file)
        return initialize_app(credential)
    except (FileNotFoundError, ValueError, DefaultCredentialsError) as exc:
        raise FirebaseNotConfiguredError(
            "Credencial Firebase indisponivel. Configure FIREBASE_CREDENTIALS_FILE."
        ) from exc


def get_firebase_auth():
    initialize_firebase_app()
    return auth


def get_firestore_client():
    initialize_firebase_app()
    return firestore.client()


def server_timestamp():
    return firestore.SERVER_TIMESTAMP


def sign_in_with_password(email, password):
    if not settings.FIREBASE_WEB_API_KEY:
        raise FirebaseNotConfiguredError("FIREBASE_WEB_API_KEY nao foi configurada.")

    response = requests.post(
        "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword",
        params={"key": settings.FIREBASE_WEB_API_KEY},
        json={
            "email": email,
            "password": password,
            "returnSecureToken": True,
        },
        timeout=10,
    )

    if response.ok:
        return response.json()

    try:
        error_payload = response.json()
        error_message = error_payload.get("error", {}).get("message")
    except ValueError:
        error_message = None

    if error_message in {"OPERATION_NOT_ALLOWED", "PASSWORD_LOGIN_DISABLED"}:
        raise FirebaseAuthRequestError("Login por e-mail e senha nao esta habilitado no Firebase.")

    if error_message == "INVALID_LOGIN_CREDENTIALS":
        raise FirebaseAuthRequestError("E-mail ou senha invalidos.")

    if error_message == "INVALID_PASSWORD":
        raise FirebaseAuthRequestError("E-mail ou senha invalidos.")

    if error_message == "EMAIL_NOT_FOUND":
        raise FirebaseAuthRequestError("E-mail ou senha invalidos.")

    raise FirebaseAuthRequestError("Nao foi possivel autenticar com o Firebase.")
