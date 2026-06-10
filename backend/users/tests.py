from django.test import SimpleTestCase
from rest_framework.test import APIRequestFactory, force_authenticate
from unittest.mock import patch

from .domain_views import NavigationView, check_in_payload
from .views import ForgotPasswordView, ResetPasswordView


class TestFirebaseUser:
    is_authenticated = True

    def __init__(self, uid, decoded_token=None):
        self.uid = uid
        self.email = f"{uid}@example.com"
        self.decoded_token = decoded_token or {"uid": uid, "email": self.email}


class CheckInPayloadTests(SimpleTestCase):
    def test_partial_update_preserves_existing_emotion(self):
        payload = check_in_payload(
            {"intensity": 5, "note": "editado"},
            "uid-123",
            {"emotion": "tired", "emotionId": "tired", "intensity": 3},
        )

        self.assertEqual(payload["emotion"], "tired")
        self.assertEqual(payload["emotionId"], "tired")
        self.assertEqual(payload["intensity"], 5)
        self.assertEqual(payload["note"], "editado")

    def test_create_requires_main_emotion(self):
        self.assertIsNone(check_in_payload({"intensity": 3}, "uid-123"))


class PasswordRecoveryTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    @patch("users.views.send_password_reset_email")
    def test_forgot_password_returns_safe_success_message(self, send_password_reset_email):
        request = self.factory.post(
            "/api/password/forgot/",
            {"email": "maia@example.com"},
            format="json",
        )
        response = ForgotPasswordView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        send_password_reset_email.assert_called_once_with("maia@example.com")

    def test_forgot_password_requires_email(self):
        request = self.factory.post("/api/password/forgot/", {}, format="json")
        response = ForgotPasswordView.as_view()(request)

        self.assertEqual(response.status_code, 400)

    @patch("users.views.reset_password_with_oob_code")
    def test_reset_password_uses_oob_code(self, reset_password_with_oob_code):
        request = self.factory.post(
            "/api/password/reset/",
            {"oobCode": "abc123", "newPassword": "NovaSenha123"},
            format="json",
        )
        response = ResetPasswordView.as_view()(request)

        self.assertEqual(response.status_code, 200)
        reset_password_with_oob_code.assert_called_once_with("abc123", "NovaSenha123")


class NavigationViewTests(SimpleTestCase):
    def setUp(self):
        self.factory = APIRequestFactory()

    @patch("users.domain_views.current_user", return_value={"roles": ["ADM"]})
    def test_admin_navigation_includes_admin_item(self, current_user):
        request = self.factory.get("/api/navigation/")
        force_authenticate(
            request,
            user=TestFirebaseUser(
                "admin-uid",
                {"uid": "admin-uid", "email": "admin@example.com", "admin": True, "role": "ADM"},
            ),
        )

        response = NavigationView.as_view()(request)
        item_ids = [item["id"] for item in response.data["navigation"]]

        self.assertEqual(response.status_code, 200)
        self.assertIn("admin", item_ids)
        current_user.assert_called_once()

    @patch("users.domain_views.current_user", return_value={"roles": ["PUE"]})
    def test_regular_navigation_does_not_include_admin_item(self, current_user):
        request = self.factory.get("/api/navigation/")
        force_authenticate(
            request,
            user=TestFirebaseUser(
                "regular-uid",
                {"uid": "regular-uid", "email": "regular@example.com", "roles": ["PUE"]},
            ),
        )

        response = NavigationView.as_view()(request)
        item_ids = [item["id"] for item in response.data["navigation"]]

        self.assertEqual(response.status_code, 200)
        self.assertNotIn("admin", item_ids)
        current_user.assert_called_once()
