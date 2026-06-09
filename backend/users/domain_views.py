import mimetypes
import json
import uuid
from datetime import datetime, timedelta
from urllib.parse import quote

from django.conf import settings
from rest_framework import status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .authentication import FirebaseAuthentication
from .firebase import (
    FirebaseNotConfiguredError,
    get_firestore_client,
    get_storage_bucket,
    server_timestamp,
)
from .permissions import user_is_admin


CHECK_IN_COLLECTION = "checkIns"
CONTENT_COLLECTION = "contents"
COMMUNITY_POST_COLLECTION = "communityPosts"
COMMUNITY_COMMENT_COLLECTION = "communityComments"
COMMUNITY_SUPPORT_COLLECTION = "communitySupports"
NOTIFICATION_SUBSCRIPTION_COLLECTION = "notificationSubscriptions"
ADMIN_ACTION_COLLECTION = "adminActions"

ALLOWED_IMAGE_TYPES = {
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
}
MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024

SEED_CONTENTS = [
    {
        "id": "sono-descanso-puerperio",
        "title": "Sono e descanso no puerpério",
        "summary": "Estratégias práticas para melhorar o descanso em meio às demandas do bebê.",
        "category": "Sono e Repouso",
        "tags": ["sono", "cansaco", "descanso", "puerperio"],
        "readingTimeMinutes": 10,
        "body": "Dormir com um bebê pequeno pode ser desafiador. Pequenas pausas, divisão de tarefas e apoio da rede podem ajudar a proteger janelas de descanso.",
        "author": {"name": "Equipe Maia", "role": "editorial"},
        "status": "published",
    },
    {
        "id": "respiracao-para-ansiedade",
        "title": "Respiração para desacelerar pensamentos",
        "summary": "Um exercício simples para voltar ao corpo quando a mente acelera.",
        "category": "Bem-estar Mental",
        "tags": ["ansiedade", "medo", "respiracao", "autocuidado"],
        "readingTimeMinutes": 8,
        "body": "Respire com calma, observe o corpo e escolha um ponto de apoio no ambiente. Se o desconforto persistir, considere buscar apoio profissional.",
        "author": {"name": "Equipe Maia", "role": "editorial"},
        "status": "published",
    },
    {
        "id": "rede-de-apoio",
        "title": "Como pedir ajuda sem culpa",
        "summary": "Ideias simples para acionar sua rede de apoio de forma possível.",
        "category": "Rede de apoio",
        "tags": ["apoio", "rede", "sobrecarga", "rotina"],
        "readingTimeMinutes": 7,
        "body": "Pedir ajuda pode começar por tarefas pequenas e concretas, como preparar uma refeição, cuidar de uma roupa ou ficar alguns minutos com o bebê.",
        "author": {"name": "Equipe Maia", "role": "editorial"},
        "status": "published",
    },
]


def now_iso():
    return datetime.utcnow().isoformat(timespec="seconds") + "Z"


def serialize_firestore_value(value):
    if isinstance(value, dict):
        return {key: serialize_firestore_value(current_value) for key, current_value in value.items()}

    if isinstance(value, list):
        return [serialize_firestore_value(item) for item in value]

    if hasattr(value, "isoformat"):
        return value.isoformat()

    return value


def error_response(message, http_status=status.HTTP_400_BAD_REQUEST):
    return Response({"erro": message}, status=http_status)


def success_response(payload=None, http_status=status.HTTP_200_OK):
    return Response(payload or {"mensagem": "Operacao realizada com sucesso."}, status=http_status)


def get_db():
    return get_firestore_client()


def get_document_payload(snapshot):
    if not snapshot.exists:
        return None

    data = snapshot.to_dict() or {}
    data.setdefault("id", snapshot.id)

    return serialize_firestore_value(data)


def list_collection(collection_name, predicate=None):
    items = []

    for snapshot in get_db().collection(collection_name).stream():
        item = get_document_payload(snapshot)

        if item and (predicate is None or predicate(item)):
            items.append(item)

    return items


def sort_by_created_at(items, reverse=True):
    return sorted(items, key=lambda item: item.get("createdAt") or "", reverse=reverse)


def get_user(uid):
    return get_document_payload(get_db().collection("users").document(uid).get())


def current_user(request):
    return get_user(request.user.uid) or {}


def user_roles(user):
    roles = user.get("roles")

    if isinstance(roles, list):
        return [role for role in roles if isinstance(role, str)]

    if isinstance(roles, str):
        return [roles]

    return []


def is_professional_or_admin(user, request):
    return user_is_admin(request.user) or "PRO" in user_roles(user)


def ensure_admin(request):
    if user_is_admin(request.user):
        return None

    return error_response("Voce nao tem permissao para acessar esta area.", status.HTTP_403_FORBIDDEN)


def ensure_content_seeded():
    db = get_db()

    for content in SEED_CONTENTS:
        ref = db.collection(CONTENT_COLLECTION).document(content["id"])

        if ref.get().exists:
            continue

        ref.set(
            {
                **content,
                "createdAt": server_timestamp(),
                "updatedAt": server_timestamp(),
            }
        )


def check_in_payload(data, uid, existing=None):
    existing = existing or {}
    emotion = (
        data.get("emotion")
        or data.get("emotionId")
        or data.get("humor")
        or existing.get("emotion")
        or existing.get("emotionId")
    )

    if not emotion:
        return None

    intensity = data.get("intensity", data.get("energy", data.get("energia", existing.get("intensity"))))
    energy = data.get("energy", intensity if intensity is not None else existing.get("energy"))
    sleep_quality = (
        data.get("sleepQuality")
        or data.get("sleep")
        or data.get("sono")
        or existing.get("sleepQuality")
    )
    received_support = (
        data.get("receivedSupport")
        or data.get("support")
        or data.get("apoioRecebido")
        or existing.get("receivedSupport")
    )
    tags = data.get("tags") or data.get("feelings") or data.get("sentimentos") or existing.get("tags") or []
    note = data.get("note") if "note" in data else data.get("observacao", existing.get("note", ""))

    if not isinstance(tags, list):
        tags = []

    payload = {
        **existing,
        "userId": uid,
        "emotion": emotion,
        "emotionId": data.get("emotionId") or emotion,
        "intensity": intensity,
        "energy": energy,
        "sleepQuality": sleep_quality,
        "receivedSupport": received_support,
        "tags": [tag for tag in tags if isinstance(tag, str)][:10],
        "note": note,
        "recordedAt": data.get("recordedAt") or data.get("date") or existing.get("recordedAt") or now_iso(),
        "updatedAt": server_timestamp(),
    }

    return {key: value for key, value in payload.items() if value is not None}


class CheckInListView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = list_collection(
            CHECK_IN_COLLECTION,
            lambda item: item.get("userId") == request.user.uid and item.get("status") != "deleted",
        )

        return success_response({"checkIns": sort_by_created_at(items)})

    def post(self, request):
        payload = check_in_payload(request.data, request.user.uid)

        if not payload:
            return error_response("Informe o humor principal do check-in.")

        ref = get_db().collection(CHECK_IN_COLLECTION).document()
        payload = {
            **payload,
            "id": ref.id,
            "createdAt": server_timestamp(),
            "status": "active",
        }
        ref.set(payload)

        return success_response({"checkIn": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class CheckInDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_check_in(self, request, check_in_id):
        ref = get_db().collection(CHECK_IN_COLLECTION).document(check_in_id)
        item = get_document_payload(ref.get())

        if not item or item.get("status") == "deleted":
            return ref, None, error_response("Check-in nao encontrado.", status.HTTP_404_NOT_FOUND)

        if item.get("userId") != request.user.uid and not user_is_admin(request.user):
            return ref, item, error_response(
                "Voce nao tem permissao para acessar este check-in.",
                status.HTTP_403_FORBIDDEN,
            )

        return ref, item, None

    def get(self, request, check_in_id):
        _, item, permission_error = self.get_check_in(request, check_in_id)

        if permission_error:
            return permission_error

        return success_response({"checkIn": item})

    def patch(self, request, check_in_id):
        ref, item, permission_error = self.get_check_in(request, check_in_id)

        if permission_error:
            return permission_error

        payload = check_in_payload(request.data, request.user.uid, item)

        if not payload:
            return error_response("Informe o humor principal do check-in.")

        ref.update(payload)

        return success_response({"checkIn": get_document_payload(ref.get())})

    def put(self, request, check_in_id):
        return self.patch(request, check_in_id)

    def delete(self, request, check_in_id):
        ref, _, permission_error = self.get_check_in(request, check_in_id)

        if permission_error:
            return permission_error

        ref.update({"status": "deleted", "deletedAt": server_timestamp(), "updatedAt": server_timestamp()})

        return success_response({"mensagem": "Check-in removido."})


class CheckInSummaryView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        period = request.GET.get("period", "weekly")
        days = 30 if period == "monthly" else 7
        start = datetime.utcnow() - timedelta(days=days)
        check_ins = list_collection(
            CHECK_IN_COLLECTION,
            lambda item: item.get("userId") == request.user.uid and item.get("status") != "deleted",
        )
        recent = []

        for item in check_ins:
            recorded_at = str(item.get("recordedAt") or item.get("createdAt") or "")

            try:
                parsed_date = datetime.fromisoformat(recorded_at.replace("Z", "+00:00")).replace(tzinfo=None)
            except ValueError:
                parsed_date = datetime.utcnow()

            if parsed_date >= start:
                recent.append(item)

        emotion_frequency = {}
        sleep_scores = {"poor": 1, "Pouco sono": 1, "interrupted": 2, "Sono interrompido": 2, "rested": 3, "Consegui descansar": 3}
        sleep_total = 0
        sleep_count = 0
        intensity_total = 0
        intensity_count = 0
        tags = {}

        for item in recent:
            emotion = item.get("emotion") or item.get("emotionId")
            if emotion:
                emotion_frequency[emotion] = emotion_frequency.get(emotion, 0) + 1

            sleep = item.get("sleepQuality")
            if sleep in sleep_scores:
                sleep_total += sleep_scores[sleep]
                sleep_count += 1

            try:
                intensity_total += int(item.get("intensity") or item.get("energy") or 0)
                intensity_count += 1
            except (TypeError, ValueError):
                pass

            for tag in item.get("tags") or []:
                tags[tag] = tags.get(tag, 0) + 1

        recurring_patterns = [
            {"tag": tag, "count": count}
            for tag, count in sorted(tags.items(), key=lambda current: current[1], reverse=True)
            if count > 1
        ][:5]
        top_emotion = max(emotion_frequency, key=emotion_frequency.get) if emotion_frequency else None
        insight_message = (
            "Percebemos alguns registros recorrentes. Se isso persistir, considere buscar apoio profissional."
            if recurring_patterns
            else "Continue registrando seus sentimentos para acompanhar sua semana com mais clareza."
        )

        if top_emotion:
            insight_message = (
                f"{top_emotion} apareceu com mais frequencia nos seus check-ins. "
                "Observe esse padrao com cuidado e acolhimento."
            )

        summary = {
            "period": period,
            "totalCheckIns": len(recent),
            "emotionFrequency": emotion_frequency,
            "averageSleep": round(sleep_total / sleep_count, 2) if sleep_count else None,
            "averageIntensity": round(intensity_total / intensity_count, 2) if intensity_count else None,
            "recentCheckIns": sort_by_created_at(recent)[:5],
            "recurringPatterns": recurring_patterns,
            "insight": {"message": insight_message},
        }

        return success_response({"summary": summary, **summary})


class ContentsListView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_content_seeded()
        items = list_collection(
            CONTENT_COLLECTION,
            lambda item: item.get("status", "published") == "published"
            or user_is_admin(request.user)
            or (item.get("author") or {}).get("uid") == request.user.uid,
        )

        return success_response({"contents": sort_by_created_at(items, reverse=False)})

    def post(self, request):
        user = current_user(request)

        if not is_professional_or_admin(user, request):
            return error_response("Somente profissionais ou administradores podem criar conteudos.", status.HTTP_403_FORBIDDEN)

        title = request.data.get("title")

        if not title:
            return error_response("Titulo e obrigatorio.")

        ref = get_db().collection(CONTENT_COLLECTION).document()
        payload = {
            "id": ref.id,
            "title": title,
            "summary": request.data.get("summary") or "",
            "category": request.data.get("category") or "Geral",
            "tags": request.data.get("tags") if isinstance(request.data.get("tags"), list) else [],
            "readingTimeMinutes": request.data.get("readingTimeMinutes") or request.data.get("readingTime") or 5,
            "body": request.data.get("body") or "",
            "author": {
                "uid": request.user.uid,
                "name": user.get("fullName") or "Maia",
                "role": user.get("profileCode") or "PRO",
            },
            "status": request.data.get("status", "published") if user_is_admin(request.user) else "pending-review",
            "createdAt": server_timestamp(),
            "updatedAt": server_timestamp(),
        }
        ref.set(payload)

        return success_response({"content": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class ContentDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_content(self, request, content_id):
        ensure_content_seeded()
        ref = get_db().collection(CONTENT_COLLECTION).document(content_id)
        item = get_document_payload(ref.get())

        if not item:
            return ref, None, error_response("Conteudo nao encontrado.", status.HTTP_404_NOT_FOUND)

        if (
            item.get("status") != "published"
            and not user_is_admin(request.user)
            and (item.get("author") or {}).get("uid") != request.user.uid
        ):
            return ref, item, error_response("Conteudo indisponivel.", status.HTTP_404_NOT_FOUND)

        return ref, item, None

    def get(self, request, content_id):
        _, item, permission_error = self.get_content(request, content_id)

        if permission_error:
            return permission_error

        return success_response({"content": item})

    def patch(self, request, content_id):
        ref, item, permission_error = self.get_content(request, content_id)

        if permission_error:
            return permission_error

        user = current_user(request)
        author_uid = (item.get("author") or {}).get("uid")

        if author_uid != request.user.uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para editar este conteudo.", status.HTTP_403_FORBIDDEN)

        allowed = {"title", "summary", "category", "tags", "readingTimeMinutes", "body", "status"}
        payload = {key: value for key, value in request.data.items() if key in allowed}

        if "status" in payload and not user_is_admin(request.user):
            payload["status"] = "pending-review"

        payload["updatedAt"] = server_timestamp()
        payload["reviewedBy"] = request.user.uid if user_is_admin(request.user) else item.get("reviewedBy")
        ref.update(payload)

        return success_response({"content": get_document_payload(ref.get()), "user": user})

    def put(self, request, content_id):
        return self.patch(request, content_id)

    def delete(self, request, content_id):
        ref, _, permission_error = self.get_content(request, content_id)

        if permission_error:
            return permission_error

        if not user_is_admin(request.user):
            return error_response("Somente administradores podem remover conteudos.", status.HTTP_403_FORBIDDEN)

        ref.update({"status": "archived", "updatedAt": server_timestamp()})

        return success_response({"mensagem": "Conteudo arquivado."})


class RecommendationsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        ensure_content_seeded()
        user = current_user(request)

        if not (user.get("privacy") or {}).get("allowPersonalizedRecommendations", True):
            contents = list_collection(CONTENT_COLLECTION, lambda item: item.get("status", "published") == "published")[:3]
            return success_response({"recommendations": contents, "signals": []})

        check_ins = sort_by_created_at(
            list_collection(
                CHECK_IN_COLLECTION,
                lambda item: item.get("userId") == request.user.uid and item.get("status") != "deleted",
            )
        )[:10]
        signals = set()

        for item in check_ins:
            tags = {tag.lower() for tag in item.get("tags") or []}
            emotion = str(item.get("emotion") or item.get("emotionId") or "").lower()
            sleep = str(item.get("sleepQuality") or "").lower()
            support = str(item.get("receivedSupport") or "").lower()

            if "cansaco" in tags or "cansaço" in tags or "tired" in emotion or "cansada" in emotion:
                signals.update({"cansaco", "descanso", "sono"})
            if "ansiedade" in tags or "medo" in tags or "pensativa" in emotion:
                signals.update({"ansiedade", "respiracao", "autocuidado"})
            if "tristeza" in tags or "melanc" in emotion:
                signals.update({"acolhimento", "autocuidado"})
            if "poor" in sleep or "pouco" in sleep:
                signals.update({"sono", "descanso"})
            if "nao" in support or "não" in support:
                signals.update({"apoio", "rede"})

        if not signals:
            signals.update({"autocuidado", "puerperio"})

        contents = list_collection(CONTENT_COLLECTION, lambda item: item.get("status", "published") == "published")
        ranked = []

        for content in contents:
            content_tags = {str(tag).lower() for tag in content.get("tags") or []}
            score = len(content_tags.intersection(signals))
            ranked.append((score, content))

        recommendations = [
            content
            for score, content in sorted(ranked, key=lambda item: item[0], reverse=True)
            if score > 0
        ][:3]

        if not recommendations:
            recommendations = contents[:3]

        return success_response(
            {
                "recommendations": recommendations,
                "signals": sorted(signals),
                "message": "Selecionamos poucos conteudos a partir dos seus registros, sem fazer diagnosticos.",
            }
        )


class CommunityPostsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = list_collection(COMMUNITY_POST_COLLECTION, lambda item: item.get("status", "active") == "active")

        return success_response({"posts": sort_by_created_at(items)})

    def post(self, request):
        body = request.data.get("body") or request.data.get("message")
        title = request.data.get("title")

        if not title or not body:
            return error_response("Titulo e mensagem sao obrigatorios.")

        user = current_user(request)
        anonymous = bool(request.data.get("anonymous"))
        ref = get_db().collection(COMMUNITY_POST_COLLECTION).document()
        payload = {
            "id": ref.id,
            "authorId": request.user.uid,
            "authorName": "Usuario com identidade protegida" if anonymous else user.get("fullName", "Maia"),
            "authorRole": user.get("profileCode", "PUE"),
            "anonymous": anonymous,
            "category": request.data.get("category") or "apoio",
            "title": title,
            "body": body,
            "tags": request.data.get("tags") if isinstance(request.data.get("tags"), list) else [],
            "supportCount": 0,
            "commentsCount": 0,
            "status": "active",
            "createdAt": server_timestamp(),
            "updatedAt": server_timestamp(),
        }
        ref.set(payload)

        return success_response({"post": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class CommunityPostDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get_post(self, post_id):
        ref = get_db().collection(COMMUNITY_POST_COLLECTION).document(post_id)
        post = get_document_payload(ref.get())

        if not post or post.get("status") not in {"active", "hidden"}:
            return ref, None

        return ref, post

    def get(self, request, post_id):
        _, post = self.get_post(post_id)

        if not post or (post.get("status") == "hidden" and not user_is_admin(request.user)):
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        comments = list_collection(
            COMMUNITY_COMMENT_COLLECTION,
            lambda item: item.get("postId") == post_id and item.get("status", "active") == "active",
        )

        return success_response({"post": post, "comments": sort_by_created_at(comments, reverse=False)})

    def patch(self, request, post_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        ref, post = self.get_post(post_id)

        if not post:
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        status_value = request.data.get("status")

        if status_value not in {"active", "hidden", "removed"}:
            return error_response("Status de publicacao invalido.")

        ref.update({"status": status_value, "moderatedBy": request.user.uid, "updatedAt": server_timestamp()})
        get_db().collection(ADMIN_ACTION_COLLECTION).document().set(
            {
                "type": "community-post-moderation",
                "targetId": post_id,
                "status": status_value,
                "adminId": request.user.uid,
                "createdAt": server_timestamp(),
            }
        )

        return success_response({"post": get_document_payload(ref.get())})

    def delete(self, request, post_id):
        ref, post = self.get_post(post_id)

        if not post:
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        if post.get("authorId") != request.user.uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para remover esta publicacao.", status.HTTP_403_FORBIDDEN)

        ref.update({"status": "removed", "updatedAt": server_timestamp()})

        return success_response({"mensagem": "Publicacao removida."})


class CommunityCommentCreateView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        post_ref = get_db().collection(COMMUNITY_POST_COLLECTION).document(post_id)
        post = get_document_payload(post_ref.get())

        if not post or post.get("status") != "active":
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        body = request.data.get("body") or request.data.get("message")

        if not body:
            return error_response("Mensagem da resposta e obrigatoria.")

        user = current_user(request)
        ref = get_db().collection(COMMUNITY_COMMENT_COLLECTION).document()
        payload = {
            "id": ref.id,
            "postId": post_id,
            "authorId": request.user.uid,
            "authorName": user.get("fullName", "Maia"),
            "authorRole": user.get("profileCode", "PUE"),
            "body": body,
            "helpfulCount": 0,
            "status": "active",
            "createdAt": server_timestamp(),
            "updatedAt": server_timestamp(),
        }
        ref.set(payload)
        post_ref.update({"commentsCount": int(post.get("commentsCount") or 0) + 1, "updatedAt": server_timestamp()})

        return success_response({"comment": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class CommunitySupportView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, post_id):
        db = get_db()
        post_ref = db.collection(COMMUNITY_POST_COLLECTION).document(post_id)
        post = get_document_payload(post_ref.get())

        if not post or post.get("status") != "active":
            return error_response("Publicacao nao encontrada.", status.HTTP_404_NOT_FOUND)

        support_id = f"{post_id}_{request.user.uid}"
        support_ref = db.collection(COMMUNITY_SUPPORT_COLLECTION).document(support_id)
        supported = support_ref.get().exists
        support_count = int(post.get("supportCount") or 0)

        if supported:
            support_ref.delete()
            support_count = max(support_count - 1, 0)
            next_supported = False
        else:
            support_ref.set(
                {
                    "id": support_id,
                    "postId": post_id,
                    "userId": request.user.uid,
                    "createdAt": server_timestamp(),
                }
            )
            support_count += 1
            next_supported = True

        post_ref.update({"supportCount": support_count, "updatedAt": server_timestamp()})

        return success_response({"supported": next_supported, "supportCount": support_count})


class CommentFeedbackView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request, comment_id):
        ref = get_db().collection(COMMUNITY_COMMENT_COLLECTION).document(comment_id)
        comment = get_document_payload(ref.get())

        if not comment:
            return error_response("Resposta nao encontrada.", status.HTTP_404_NOT_FOUND)

        delta = 1 if request.data.get("helpful", True) else -1
        ref.update(
            {
                "helpfulCount": int(comment.get("helpfulCount") or 0) + delta,
                "updatedAt": server_timestamp(),
            }
        )

        return success_response({"comment": get_document_payload(ref.get())})


class NotificationPreferencesView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = current_user(request)

        return success_response({"preferences": user.get("notificationSummary") or {}})

    def put(self, request):
        allowed = {"dailyCheckInEnabled", "pushEnabled", "timezone", "dailyCheckInTime"}
        current = current_user(request)
        preferences = {
            **(current.get("notificationSummary") or {}),
            **{key: value for key, value in request.data.items() if key in allowed},
        }
        get_db().collection("users").document(request.user.uid).update(
            {"notificationSummary": preferences, "updatedAt": server_timestamp()}
        )

        return success_response({"preferences": preferences})


class NotificationSubscriptionView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        endpoint = request.data.get("endpoint")

        if not endpoint:
            return error_response("Endpoint da subscription e obrigatorio.")

        ref = get_db().collection(NOTIFICATION_SUBSCRIPTION_COLLECTION).document()
        ref.set(
            {
                "id": ref.id,
                "userId": request.user.uid,
                "endpoint": endpoint,
                "keys": request.data.get("keys") if isinstance(request.data.get("keys"), dict) else {},
                "createdAt": server_timestamp(),
                "updatedAt": server_timestamp(),
            }
        )

        return success_response({"subscription": get_document_payload(ref.get())}, status.HTTP_201_CREATED)


class NotificationDispatchView(APIView):
    def post(self, request):
        configured_secret = getattr(settings, "NOTIFICATION_DISPATCH_SECRET", "")
        request_secret = request.headers.get("X-Maia-Dispatch-Secret", "")

        if configured_secret and request_secret != configured_secret:
            return error_response("Chave de disparo invalida.", status.HTTP_403_FORBIDDEN)

        if not settings.VAPID_PRIVATE_KEY:
            return success_response(
                {
                    "sent": 0,
                    "skipped": True,
                    "message": "Configure VAPID_PRIVATE_KEY para ativar push real.",
                }
            )

        try:
            from pywebpush import WebPushException, webpush
        except ImportError:
            return error_response("Dependencia pywebpush indisponivel.", status.HTTP_503_SERVICE_UNAVAILABLE)

        users = list_collection(
            "users",
            lambda user: (user.get("notificationSummary") or {}).get("dailyCheckInEnabled")
            and (user.get("notificationSummary") or {}).get("pushEnabled")
            and user.get("status", "active") == "active",
        )
        enabled_user_ids = {user.get("id") or user.get("authUid") for user in users}
        subscriptions = list_collection(
            NOTIFICATION_SUBSCRIPTION_COLLECTION,
            lambda item: item.get("userId") in enabled_user_ids,
        )
        payload = json.dumps(
            {
                "title": "Maia",
                "body": "Um check-in gentil pode ajudar voce a perceber como esta hoje.",
                "url": "/check-in",
            }
        )
        sent = 0
        failed = 0

        for subscription in subscriptions:
            try:
                webpush(
                    subscription_info={
                        "endpoint": subscription.get("endpoint"),
                        "keys": subscription.get("keys") or {},
                    },
                    data=payload,
                    vapid_private_key=settings.VAPID_PRIVATE_KEY,
                    vapid_claims={"sub": settings.VAPID_CLAIMS_EMAIL},
                )
                sent += 1
            except WebPushException:
                failed += 1

        return success_response({"sent": sent, "failed": failed, "subscriptions": len(subscriptions)})


class AdminMetricsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        users = list_collection("users")
        posts = list_collection(COMMUNITY_POST_COLLECTION)
        check_ins = list_collection(CHECK_IN_COLLECTION)

        return success_response(
            {
                "metrics": {
                    "usersCount": len(users),
                    "pendingProfessionalsCount": len(
                        [user for user in users if user.get("professionalVerificationStatus") == "pending"]
                    ),
                    "communityPostsCount": len(posts),
                    "checkInsCount": len(check_ins),
                }
            }
        )


class AdminProfessionalVerificationsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        users = list_collection(
            "users",
            lambda user: user.get("profileCode") == "PRO"
            and user.get("professionalVerificationStatus") in {"pending", "verified", "rejected"},
        )

        return success_response({"professionalVerifications": sort_by_created_at(users)})


class AdminProfessionalVerificationDetailView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def patch(self, request, verification_id):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        next_status = request.data.get("status")

        if next_status not in {"verified", "rejected", "pending"}:
            return error_response("Status de validacao invalido.")

        user_ref = get_db().collection("users").document(verification_id)
        previous_user = get_document_payload(user_ref.get())

        if not previous_user:
            return error_response("Profissional nao encontrado.", status.HTTP_404_NOT_FOUND)

        user_ref.update(
            {
                "professionalVerificationStatus": next_status,
                "professional": {
                    **(previous_user.get("professional") or {}),
                    "verifiedAt": server_timestamp() if next_status == "verified" else None,
                    "verifiedBy": request.user.uid if next_status == "verified" else None,
                },
                "updatedAt": server_timestamp(),
            }
        )
        get_db().collection(ADMIN_ACTION_COLLECTION).document().set(
            {
                "type": "professional-verification",
                "targetId": verification_id,
                "previousStatus": previous_user.get("professionalVerificationStatus", "pending"),
                "nextStatus": next_status,
                "reason": request.data.get("reason") or "",
                "adminId": request.user.uid,
                "createdAt": server_timestamp(),
            }
        )

        return success_response({"message": "Validacao profissional atualizada.", "user": get_document_payload(user_ref.get())})


class AdminActionsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        return success_response({"actions": sort_by_created_at(list_collection(ADMIN_ACTION_COLLECTION))[:25]})


class AdminCommunityPostsView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        permission_error = ensure_admin(request)

        if permission_error:
            return permission_error

        return success_response({"posts": sort_by_created_at(list_collection(COMMUNITY_POST_COLLECTION))})


class PrivacyExportView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user_id = request.user.uid

        export_payload = {
            "user": get_user(user_id),
            "checkIns": list_collection(CHECK_IN_COLLECTION, lambda item: item.get("userId") == user_id),
            "communityPosts": list_collection(COMMUNITY_POST_COLLECTION, lambda item: item.get("authorId") == user_id),
            "communityComments": list_collection(COMMUNITY_COMMENT_COLLECTION, lambda item: item.get("authorId") == user_id),
            "notificationSubscriptions": list_collection(
                NOTIFICATION_SUBSCRIPTION_COLLECTION,
                lambda item: item.get("userId") == user_id,
            ),
            "exportedAt": now_iso(),
        }

        return success_response({"export": export_payload})


class PrivacyDeleteRequestView(APIView):
    authentication_classes = [FirebaseAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_ref = get_db().collection("users").document(request.user.uid)

        if not user_ref.get().exists:
            return error_response("Usuario nao encontrado.", status.HTTP_404_NOT_FOUND)

        requested_at = now_iso()
        user_ref.update(
            {
                "status": "pending-deletion",
                "deleteRequestedAt": server_timestamp(),
                "updatedAt": server_timestamp(),
            }
        )

        return success_response(
            {
                "mensagem": "Solicitacao de exclusao registrada.",
                "deleteRequest": {
                    "status": "pending-deletion",
                    "requestedAt": requested_at,
                },
            }
        )


class UserAvatarUploadView(APIView):
    authentication_classes = [FirebaseAuthentication]
    parser_classes = [MultiPartParser, FormParser]
    permission_classes = [IsAuthenticated]

    def post(self, request, uid):
        if request.user.uid != uid and not user_is_admin(request.user):
            return error_response("Voce nao tem permissao para alterar esta foto.", status.HTTP_403_FORBIDDEN)

        image = request.FILES.get("image") or request.FILES.get("file") or request.FILES.get("avatar")

        if not image:
            return error_response("Envie uma foto de perfil.")

        content_type = image.content_type or mimetypes.guess_type(image.name)[0] or ""

        if content_type not in ALLOWED_IMAGE_TYPES:
            return error_response("Envie apenas fotos em JPG, PNG ou WebP.", status.HTTP_415_UNSUPPORTED_MEDIA_TYPE)

        if image.size > MAX_AVATAR_SIZE_BYTES:
            return error_response("A foto deve ter no maximo 5 MB.", status.HTTP_413_REQUEST_ENTITY_TOO_LARGE)

        try:
            bucket = get_storage_bucket()
            token = str(uuid.uuid4())
            extension = ALLOWED_IMAGE_TYPES[content_type]
            storage_path = f"profile-avatars/{uid}/{uuid.uuid4().hex}{extension}"
            blob = bucket.blob(storage_path)
            blob.metadata = {"firebaseStorageDownloadTokens": token}
            blob.upload_from_file(image, content_type=content_type)

            avatar_url = (
                f"https://firebasestorage.googleapis.com/v0/b/{settings.FIREBASE_STORAGE_BUCKET}/o/"
                f"{quote(storage_path, safe='')}?alt=media&token={token}"
            )
            user_ref = get_db().collection("users").document(uid)
            user_ref.update(
                {
                    "avatarUrl": avatar_url,
                    "avatarStoragePath": storage_path,
                    "updatedAt": server_timestamp(),
                }
            )

            return success_response({"avatarUrl": avatar_url, "user": get_document_payload(user_ref.get())})
        except FirebaseNotConfiguredError as exc:
            return error_response(str(exc), status.HTTP_503_SERVICE_UNAVAILABLE)
        except Exception:
            return error_response("Nao foi possivel salvar a foto de perfil.", status.HTTP_500_INTERNAL_SERVER_ERROR)
