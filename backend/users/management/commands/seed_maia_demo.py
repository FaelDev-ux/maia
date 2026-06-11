from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timedelta, timezone

from django.core.management.base import BaseCommand
from firebase_admin import auth as firebase_auth
from google.cloud import firestore

from users.firebase import get_firebase_auth, get_firestore_client


DEMO_PASSWORD = "MaiaDemo2026!"

PROFILE_SLUGS = {
    "PUE": "postpartum-mother",
    "MMT": "mentor-mother",
    "DSM": "future-mother",
    "PRO": "health-professional",
    "ADM": "administrator",
}

PROFILE_LABELS = {
    "PUE": "Mae no puerperio",
    "MMT": "Mae mentora",
    "DSM": "Futura mae",
    "PRO": "Profissional de saude",
    "ADM": "Administrador",
}

CONTENT_IMAGES = {
    "respiracao": {
        "imageUrl": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Pessoa respirando com calma em ambiente iluminado",
    },
    "sono": {
        "imageUrl": "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Bebe dormindo tranquilo com manta clara",
    },
    "apoio": {
        "imageUrl": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Maos unidas representando rede de apoio",
    },
    "preparacao": {
        "imageUrl": "https://images.unsplash.com/photo-1537673156864-5d2c72de7824?auto=format&fit=crop&w=1200&q=82",
        "imageAlt": "Quarto de bebe preparado com luz suave",
    },
}


@dataclass(frozen=True)
class DemoUser:
    key: str
    email: str
    full_name: str
    profile_code: str
    post_category: str
    post_title: str
    post_body: str
    post_tags: list[str]
    anonymous: bool = False
    professional_status: str = "not-required"
    professional: dict | None = None


DEMO_USERS = [
    DemoUser(
        key="admin",
        email="maia.demo.admin@example.com",
        full_name="Camila Admin Maia",
        profile_code="ADM",
        post_category="rede",
        post_title="Como manter a comunidade acolhedora",
        post_body=(
            "Estamos organizando este espaco para que cada relato seja recebido com respeito, "
            "sem julgamentos e sem exposicao desnecessaria."
        ),
        post_tags=["moderacao", "acolhimento", "seguranca"],
    ),
    DemoUser(
        key="pue-ana",
        email="maia.demo.ana@example.com",
        full_name="Ana Beatriz Lima",
        profile_code="PUE",
        post_category="sono",
        post_title="As madrugadas estao pesadas",
        post_body=(
            "Meu bebe acorda muitas vezes e sinto que fico sem energia durante o dia. "
            "Queria ouvir como outras maes dividem pequenos descansos."
        ),
        post_tags=["sono", "cansaco", "rede"],
        anonymous=True,
    ),
    DemoUser(
        key="pue-luiza",
        email="maia.demo.luiza@example.com",
        full_name="Luiza Martins",
        profile_code="PUE",
        post_category="apoio",
        post_title="Hoje chorei sem saber explicar",
        post_body=(
            "Foi um dia sensivel. Eu amo meu bebe, mas tambem me senti sobrecarregada. "
            "Escrever aqui ja me ajuda a respirar um pouco."
        ),
        post_tags=["acolhimento", "tristeza", "puerperio"],
        anonymous=True,
    ),
    DemoUser(
        key="pue-marina",
        email="maia.demo.marina@example.com",
        full_name="Marina Costa",
        profile_code="PUE",
        post_category="rede",
        post_title="Pedi ajuda e me senti culpada",
        post_body=(
            "Minha familia ajudou com o jantar, mas eu fiquei com culpa de nao dar conta de tudo. "
            "Estou tentando lembrar que pedir apoio tambem e cuidado."
        ),
        post_tags=["rede", "culpa", "apoio"],
    ),
    DemoUser(
        key="mentor-joana",
        email="maia.demo.joana@example.com",
        full_name="Joana Ferreira",
        profile_code="MMT",
        post_category="rede",
        post_title="Uma coisa que aprendi no segundo pos-parto",
        post_body=(
            "Quando eu parei de tentar resolver tudo sozinha, a rotina ficou mais possivel. "
            "Uma lista pequena de pessoas de confianca fez diferenca."
        ),
        post_tags=["mentoria", "rede", "rotina"],
    ),
    DemoUser(
        key="future-sofia",
        email="maia.demo.sofia@example.com",
        full_name="Sofia Andrade",
        profile_code="DSM",
        post_category="apoio",
        post_title="Estou me preparando e tenho receios",
        post_body=(
            "Ainda estou gestante e tenho lido sobre o puerperio. Quero me preparar sem ficar tomada "
            "pelo medo. O que ajudou voces antes da chegada do bebe?"
        ),
        post_tags=["preparacao", "medo", "gestacao"],
    ),
    DemoUser(
        key="pro-renata",
        email="maia.demo.renata@example.com",
        full_name="Dra. Renata Alves",
        profile_code="PRO",
        post_category="profissional",
        post_title="Sono fragmentado e cuidado possivel",
        post_body=(
            "Sono interrompido e comum no puerperio. Quando possivel, combine turnos de apoio, "
            "reduza tarefas nao urgentes e observe sinais persistentes com uma profissional."
        ),
        post_tags=["sono", "orientacao", "apoio"],
        professional_status="verified",
        professional={"council": "CRP", "registrationNumber": "06/123456", "state": "SP", "specialty": "Psicologia perinatal"},
    ),
    DemoUser(
        key="pro-paula",
        email="maia.demo.paula@example.com",
        full_name="Enf. Paula Nogueira",
        profile_code="PRO",
        post_category="profissional",
        post_title="Rede de apoio tambem precisa de combinados",
        post_body=(
            "Apoio costuma funcionar melhor quando os pedidos sao concretos: comida, banho, descanso, "
            "mercado ou uma hora de silencio. Pequenos combinados protegem a mae."
        ),
        post_tags=["rede", "orientacao", "familia"],
        professional_status="pending",
        professional={"council": "COREN", "registrationNumber": "123456", "state": "SP", "specialty": "Enfermagem obstetrica"},
    ),
]

DEMO_CONTENTS = [
    {
        "id": "demo-content-respiracao-breve",
        "title": "Respiracao breve para momentos intensos",
        "summary": "Um exercicio simples para pausar e perceber o corpo sem cobranca.",
        "category": "Bem-estar",
        "tags": ["ansiedade", "respiracao", "autocuidado"],
        "readingTimeMinutes": 4,
        "body": (
            "Sente-se de um jeito possivel, solte os ombros e observe o ar entrando. "
            "Inspire contando ate tres e expire contando ate quatro. Repita algumas vezes, "
            "sem buscar perfeicao. A ideia e criar uma pequena pausa segura."
        ),
        "authorKey": "pro-renata",
        "status": "published",
        "quote": "Uma pausa pequena tambem pode ser cuidado.",
        **CONTENT_IMAGES["respiracao"],
    },
    {
        "id": "demo-content-sono-revezamento",
        "title": "Sono no puerperio: combinados pequenos",
        "summary": "Ideias para conversar sobre revezamento e descanso possivel.",
        "category": "Sono",
        "tags": ["sono", "cansaco", "rede"],
        "readingTimeMinutes": 5,
        "body": (
            "Nem sempre e possivel dormir muitas horas seguidas. Ainda assim, combinados pequenos "
            "podem ajudar: escolher uma tarefa para outra pessoa assumir, proteger um cochilo curto "
            "ou reduzir atividades que podem esperar."
        ),
        "authorKey": "pro-paula",
        "status": "pending-review",
        "quote": "Descanso possivel vale mais que descanso perfeito.",
        **CONTENT_IMAGES["sono"],
    },
    {
        "id": "demo-content-culpa-apoio",
        "title": "Pedir apoio nao diminui seu cuidado",
        "summary": "Um texto sobre culpa, apoio e expectativas no pos-parto.",
        "category": "Rede de apoio",
        "tags": ["rede", "culpa", "apoio"],
        "readingTimeMinutes": 4,
        "body": (
            "Pedir ajuda nao significa falhar. Muitas maes carregam expectativas irreais de dar conta "
            "de tudo. Nomear uma necessidade concreta pode aproximar pessoas e aliviar a rotina."
        ),
        "authorKey": "admin",
        "status": "published",
        "quote": "Voce nao precisa sustentar tudo sozinha.",
        **CONTENT_IMAGES["apoio"],
    },
    {
        "id": "demo-content-preparacao-puerperio",
        "title": "Preparar a casa tambem e preparar apoio",
        "summary": "Checklist afetivo para quem esta se aproximando do puerperio.",
        "category": "Preparacao",
        "tags": ["gestacao", "preparacao", "rede"],
        "readingTimeMinutes": 6,
        "body": (
            "Antes da chegada do bebe, vale combinar quem pode ajudar com refeicoes, limpeza, compras "
            "e visitas. Preparar apoio e uma forma concreta de proteger a mae."
        ),
        "authorKey": "pro-renata",
        "status": "published",
        "quote": "Cuidado tambem se planeja em rede.",
        **CONTENT_IMAGES["preparacao"],
    },
]

COMMENT_POOL = [
    "Obrigada por compartilhar. Ler seu relato me fez sentir menos sozinha.",
    "Tambem passei por algo parecido. Um passo pequeno por vez ja conta.",
    "Que bom que voce escreveu aqui. Pedir apoio pode ser um gesto de cuidado.",
    "Como profissional, reforco que observar padroes persistentes e buscar apoio pode ajudar.",
    "Sua experiencia importa. Espero que hoje tenha algum respiro possivel.",
    "Eu combinaria uma ajuda bem concreta para hoje, como refeicao ou um cochilo curto.",
]


def now_minus(minutes: int) -> datetime:
    return datetime.now(timezone.utc) - timedelta(minutes=minutes)


def server_timestamp():
    return firestore.SERVER_TIMESTAMP


def infer_content_image(content):
    tags = content.get("tags") if isinstance(content.get("tags"), list) else []
    searchable = " ".join(
        [
            str(content.get("category") or ""),
            str(content.get("title") or ""),
            " ".join(str(tag) for tag in tags),
        ]
    ).lower()

    if "sono" in searchable or "descanso" in searchable or "cansaco" in searchable:
        return CONTENT_IMAGES["sono"]
    if "respir" in searchable or "ansiedade" in searchable or "medo" in searchable:
        return CONTENT_IMAGES["respiracao"]
    if "prepar" in searchable or "gesta" in searchable or "bebe" in searchable:
        return CONTENT_IMAGES["preparacao"]
    if "apoio" in searchable or "rede" in searchable or "culpa" in searchable:
        return CONTENT_IMAGES["apoio"]

    return CONTENT_IMAGES["apoio"]


class Command(BaseCommand):
    help = "Cria usuarios, conteudos, posts e comentarios demo do Maia no Firebase/Firestore."

    def add_arguments(self, parser):
        parser.add_argument("--password", default=DEMO_PASSWORD)

    def handle(self, *args, **options):
        password = options["password"]
        auth_client = get_firebase_auth()
        db = get_firestore_client()

        created_users = self.upsert_users(auth_client, db, password)
        self.upsert_contents(db, created_users)
        self.backfill_content_images(db)
        created_posts = self.upsert_posts(db, created_users)
        self.upsert_comments_and_supports(db, created_users, created_posts)

        self.stdout.write(self.style.SUCCESS("Seed Maia demo concluido."))
        self.stdout.write(f"Senha padrao dos usuarios demo: {password}")
        for user in DEMO_USERS:
            self.stdout.write(f"- {user.profile_code}: {user.email}")

    def upsert_users(self, auth_client, db, password):
        created = {}

        for user in DEMO_USERS:
            try:
                record = auth_client.get_user_by_email(user.email)
                auth_client.update_user(record.uid, password=password, display_name=user.full_name)
            except firebase_auth.UserNotFoundError:
                record = auth_client.create_user(
                    email=user.email,
                    password=password,
                    display_name=user.full_name,
                    email_verified=True,
                )

            claims = {"roles": [user.profile_code], "role": user.profile_code}
            if user.profile_code == "ADM":
                claims["admin"] = True
            auth_client.set_custom_user_claims(record.uid, claims)

            user_payload = {
                "id": record.uid,
                "authUid": record.uid,
                "fullName": user.full_name,
                "normalizedName": user.full_name.lower(),
                "firstName": user.full_name.split()[0],
                "email": user.email,
                "emailVerified": True,
                "phone": "",
                "birthDate": "",
                "profileCode": user.profile_code,
                "profileSlug": PROFILE_SLUGS[user.profile_code],
                "roles": [user.profile_code],
                "status": "active",
                "professionalVerificationStatus": user.professional_status,
                "privacy": {
                    "defaultAnonymousCommunityPost": user.anonymous,
                    "showAvatarInCommunity": True,
                    "allowPersonalizedRecommendations": True,
                    "allowUsageAnalytics": False,
                },
                "notificationSummary": {
                    "dailyCheckInEnabled": True,
                    "pushEnabled": False,
                    "timezone": "America/Fortaleza",
                    "dailyCheckInTime": "20:00",
                },
                "stats": {
                    "checkInsCount": 0,
                    "postsCount": 1,
                    "repliesCount": 2,
                    "supportsGivenCount": 3,
                    "supportsReceivedCount": 3,
                },
                "onboarding": {"completed": True, "completedSteps": ["select-type", "demo-seed"]},
                "acceptedTermsVersion": "demo",
                "acceptedPrivacyVersion": "demo",
                "isDemo": True,
                "demoKey": user.key,
                "createdAt": server_timestamp(),
                "updatedAt": server_timestamp(),
            }

            if user.profile_code == "PRO":
                user_payload["professional"] = user.professional or {}

            db.collection("users").document(record.uid).set(user_payload, merge=True)
            created[user.key] = {**user_payload, "uid": record.uid}

        return created

    def upsert_contents(self, db, users_by_key):
        for index, content in enumerate(DEMO_CONTENTS):
            author = users_by_key[content["authorKey"]]
            payload = {
                **{key: value for key, value in content.items() if key != "authorKey"},
                "author": {
                    "uid": author["uid"],
                    "name": author["fullName"],
                    "role": author["profileCode"],
                },
                "status": content["status"],
                "isDemo": True,
                "createdAt": now_minus(720 - index * 30).isoformat(),
                "updatedAt": server_timestamp(),
            }
            if content["status"] == "published":
                payload["reviewedBy"] = users_by_key["admin"]["uid"]
            db.collection("contents").document(content["id"]).set(payload, merge=True)

    def backfill_content_images(self, db):
        for snapshot in db.collection("contents").stream():
            content = snapshot.to_dict() or {}
            image_payload = infer_content_image(content)
            update_payload = {"updatedAt": server_timestamp()}

            if not content.get("imageUrl"):
                update_payload["imageUrl"] = image_payload["imageUrl"]
            if not content.get("imageAlt"):
                update_payload["imageAlt"] = image_payload["imageAlt"]

            if len(update_payload) > 1:
                snapshot.reference.set(update_payload, merge=True)

    def upsert_posts(self, db, users_by_key):
        created_posts = {}

        for index, user in enumerate(DEMO_USERS):
            author = users_by_key[user.key]
            post_id = f"demo-post-{user.key}"
            payload = {
                "id": post_id,
                "authorId": author["uid"],
                "authorName": "Usuario com identidade protegida" if user.anonymous else user.full_name,
                "authorRole": user.profile_code,
                "anonymous": user.anonymous,
                "isAnonymous": user.anonymous,
                "category": user.post_category,
                "title": user.post_title,
                "body": user.post_body,
                "message": user.post_body,
                "tags": user.post_tags,
                "supportCount": 3,
                "commentsCount": 2,
                "status": "active",
                "isDemo": True,
                "createdAt": now_minus(480 - index * 35).isoformat(),
                "updatedAt": server_timestamp(),
            }
            db.collection("communityPosts").document(post_id).set(payload, merge=True)
            created_posts[user.key] = payload

        return created_posts

    def upsert_comments_and_supports(self, db, users_by_key, posts_by_key):
        user_keys = [user.key for user in DEMO_USERS]

        for post_index, (post_key, post) in enumerate(posts_by_key.items()):
            author_id = post["authorId"]
            commenter_keys = [key for key in user_keys if users_by_key[key]["uid"] != author_id][:2]

            for comment_index, commenter_key in enumerate(commenter_keys):
                commenter = users_by_key[commenter_key]
                comment_id = f"demo-comment-{post_key}-{comment_index + 1}"
                body = COMMENT_POOL[(post_index + comment_index) % len(COMMENT_POOL)]
                db.collection("communityComments").document(comment_id).set(
                    {
                        "id": comment_id,
                        "postId": post["id"],
                        "authorId": commenter["uid"],
                        "authorName": commenter["fullName"],
                        "authorRole": commenter["profileCode"],
                        "body": body,
                        "message": body,
                        "helpfulCount": 1 + comment_index,
                        "notHelpfulCount": 0,
                        "status": "active",
                        "isDemo": True,
                        "createdAt": now_minus(360 - post_index * 20 - comment_index * 5).isoformat(),
                        "updatedAt": server_timestamp(),
                    },
                    merge=True,
                )

            supporter_keys = [key for key in user_keys if users_by_key[key]["uid"] != author_id][:3]
            for supporter_key in supporter_keys:
                supporter = users_by_key[supporter_key]
                support_id = f"{post['id']}_{supporter['uid']}"
                db.collection("communitySupports").document(support_id).set(
                    {
                        "id": support_id,
                        "postId": post["id"],
                        "userId": supporter["uid"],
                        "isDemo": True,
                        "createdAt": server_timestamp(),
                    },
                    merge=True,
                )
