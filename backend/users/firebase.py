from firebase_admin import auth, credentials, firestore, get_app, initialize_app
from google.auth.exceptions import DefaultCredentialsError
from django.conf import settings
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

    credentials_file = settings.FIREBASE_CREDENTIALS_FILE

    if not credentials_file:
        raise FirebaseNotConfiguredError("FIREBASE_CREDENTIALS_FILE nao foi configurado.")

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

    raise FirebaseAuthRequestError("E-mail ou senha invalidos.")
