# Maia Backend Endpoints

Este documento define os contratos REST do backend Django do Maia para o MVP.
Ele deve ser usado como fonte de verdade para implementar novos endpoints e para
conectar o frontend via BFF do Next.js.

## 1. Escopo e arquitetura

- O navegador consome apenas rotas internas do Next.js (`/api/...`).
- O Next.js atua como BFF e chama o Django REST no servidor.
- O Django REST e a API HTTP principal do produto.
- Firebase Authentication gerencia credenciais e tokens.
- Cloud Firestore guarda usuarios, check-ins, comunidade, conteudos, recomendacoes e dados operacionais.
- Cookies httpOnly sao definidos pelo Next.js, nunca pelo Django.
- Dados emocionais sao sensiveis e devem ser filtrados por `authUid`/UID.

## 2. Padrao de nomes

### JSON

Todos os payloads JSON do backend devem usar `camelCase`.

Usar:

```json
{
  "fullName": "Usuaria Maia",
  "birthDate": "1995-05-12",
  "profileCode": "PUE",
  "createdAt": "2026-06-08T12:00:00.000Z"
}
```

Nao criar novos campos em `snake_case` ou nomes em portugues. Aliases antigos podem ser aceitos temporariamente apenas em endpoints ja existentes.

### Datas

- Datas de calendario: `YYYY-MM-DD`.
- Timestamps: ISO 8601 em UTC.
- Campos de timestamp terminam com `At`: `createdAt`, `updatedAt`, `deletedAt`.

### Identificadores

- `id`: id publico do documento.
- `authUid`: UID do Firebase Authentication.
- `userId`: id de documento de usuario quando referenciado por outra colecao.
- `postId`, `commentId`, `contentId`, `checkInId`: referencias especificas.

### Perfil e papeis

Codigos canonicos:

| Codigo | Slug | Uso |
| --- | --- | --- |
| `PUE` | `recent-mother` | Mae no puerperio |
| `MMT` | `experienced-mother` | Mae mentora/experiente |
| `DSM` | `future-mother` | Futura mae ou deseja ser mae |
| `PRO` | `health-professional` | Profissional de saude |
| `ADM` | `administrator` | Administrador |

`DS` e alias legado de `DSM`, mas o backend deve persistir `DSM`.

### Estados

```ts
type UserStatus = "active" | "blocked" | "pending-deletion" | "deleted";
type ProfessionalVerificationStatus = "not-required" | "pending" | "verified" | "rejected";
type CommunityPostStatus = "published" | "hidden" | "removed" | "under-review";
type ContentStatus = "draft" | "published" | "archived";
```

### Respostas de erro

Contrato canonico futuro:

```json
{
  "error": "Mensagem clara para o usuario.",
  "code": "optional-machine-code"
}
```

Compatibilidade atual: endpoints existentes ainda podem retornar `erro`. O BFF do Next deve aceitar ambos durante a transicao.

### Respostas de sucesso

Contrato canonico futuro:

```json
{
  "message": "Operacao concluida com sucesso."
}
```

Compatibilidade atual: endpoints existentes ainda podem retornar `mensagem`. O BFF do Next deve aceitar ambos durante a transicao.

## 3. Autenticacao

Rotas protegidas exigem:

```txt
Authorization: Bearer <firebase-id-token>
```

### POST `/api/cadastro/`

Status: implementado.

Cria usuario no Firebase Auth, cria documento em `users/{uid}` no Firestore e retorna tokens para o BFF gravar cookies httpOnly.

Request canonico:

```json
{
  "name": "Usuaria Maia",
  "email": "usuario@example.com",
  "phone": "(85) 99999-9999",
  "birthDate": "1995-05-12",
  "password": "senha-segura",
  "profileCode": "PUE",
  "professional": {
    "registrationNumber": "123456",
    "council": "CRM",
    "state": "CE",
    "specialty": "Obstetricia"
  }
}
```

Regras:

- `profileCode` e obrigatorio no fluxo final do MVP.
- `professional` so deve ser enviado quando `profileCode` for `PRO`.
- Profissional de saude inicia com `professionalVerificationStatus: "pending"`.
- Outros perfis iniciam com `professionalVerificationStatus: "not-required"`.
- Senha nunca deve ser salva no Firestore.

Response `201`:

```json
{
  "mensagem": "Usuario criado com sucesso no Maia.",
  "accessToken": "firebase-id-token",
  "refreshToken": "firebase-refresh-token",
  "expiresIn": "3600",
  "uid": "firebase-uid",
  "user": {
    "id": "firebase-uid",
    "authUid": "firebase-uid",
    "fullName": "Usuaria Maia",
    "normalizedName": "usuaria maia",
    "firstName": "Usuaria",
    "email": "usuario@example.com",
    "emailVerified": false,
    "phone": "(85) 99999-9999",
    "birthDate": "1995-05-12",
    "profileCode": "PUE",
    "profileSlug": "recent-mother",
    "roles": ["PUE"],
    "status": "active",
    "professionalVerificationStatus": "not-required",
    "privacy": {
      "defaultAnonymousCommunityPost": true,
      "showAvatarInCommunity": true,
      "allowPersonalizedRecommendations": true,
      "allowUsageAnalytics": false
    },
    "notificationSummary": {
      "dailyCheckInEnabled": false,
      "pushEnabled": false,
      "timezone": "America/Fortaleza"
    },
    "stats": {
      "checkInsCount": 0,
      "postsCount": 0,
      "repliesCount": 0,
      "supportsGivenCount": 0,
      "supportsReceivedCount": 0
    },
    "onboarding": {
      "completed": true,
      "completedSteps": ["select-type"]
    },
    "acceptedTermsVersion": "pending",
    "acceptedPrivacyVersion": "pending",
    "createdAt": null,
    "updatedAt": null
  }
}
```

### POST `/api/login/`

Status: implementado.

Request:

```json
{
  "email": "usuario@example.com",
  "password": "senha-segura"
}
```

Response `200`:

```json
{
  "mensagem": "Login realizado com sucesso.",
  "accessToken": "firebase-id-token",
  "refreshToken": "firebase-refresh-token",
  "expiresIn": "3600",
  "uid": "firebase-uid",
  "user": {}
}
```

### POST `/api/refresh/`

Status: implementado.

Request:

```json
{
  "refreshToken": "firebase-refresh-token"
}
```

Response `200`:

```json
{
  "mensagem": "Sessao renovada com sucesso.",
  "accessToken": "new-firebase-id-token",
  "refreshToken": "new-or-current-refresh-token",
  "expiresIn": "3600",
  "uid": "firebase-uid",
  "user": {}
}
```

### POST `/api/logout/`

Status: implementado.

Protegido. Encerra sessao logica. A limpeza de cookies e responsabilidade do BFF.

Response `200`:

```json
{
  "mensagem": "Sessao encerrada."
}
```

### GET `/api/me/`

Status: implementado.

Protegido. Retorna o usuario autenticado.

Response `200`:

```json
{
  "user": {}
}
```

## 4. Usuario e perfil

### GET `/api/usuario/{uid}/`

Status: implementado.

Protegido. Usuario so acessa o proprio perfil. `ADM` pode acessar qualquer perfil.

Response `200`:

```json
{
  "id": "firebase-uid",
  "authUid": "firebase-uid",
  "fullName": "Usuaria Maia",
  "firstName": "Usuaria",
  "email": "usuario@example.com",
  "profileCode": "PUE",
  "profileSlug": "recent-mother"
}
```

### PUT `/api/usuario/{uid}/`

Status: parcial.

Atualiza perfil do usuario. O contrato do MVP deve aceitar os campos abaixo.

Request:

```json
{
  "fullName": "Usuaria Maia",
  "phone": "(85) 99999-9999",
  "birthDate": "1995-05-12",
  "avatarUrl": "https://example.com/avatar.png",
  "recentMother": {
    "babyIds": ["baby-001"],
    "bio": "Vivendo o puerperio com apoio.",
    "supportNeeds": ["sono", "rede-de-apoio"]
  },
  "futureMother": {
    "journeyMoment": "Planejando a maternidade",
    "interests": ["preparo-emocional", "rede-de-apoio"],
    "supportNeeds": ["informacao", "acolhimento"]
  },
  "mentor": {
    "motherhoodExperience": "Mae ha 5 anos",
    "mentorBio": "Acolho maes no inicio da jornada.",
    "availableForSupport": true,
    "supportTopics": ["rotina", "sono", "rede"]
  },
  "professional": {
    "registrationNumber": "123456",
    "council": "CRM",
    "state": "CE",
    "specialty": "Obstetricia",
    "publicBio": "Orientacoes gerais sobre saude materna."
  },
  "privacy": {
    "defaultAnonymousCommunityPost": true,
    "showAvatarInCommunity": true,
    "allowPersonalizedRecommendations": true,
    "allowUsageAnalytics": false
  },
  "notificationSummary": {
    "dailyCheckInEnabled": true,
    "pushEnabled": false,
    "timezone": "America/Fortaleza"
  }
}
```

Response `200`:

```json
{
  "message": "Perfil atualizado com sucesso.",
  "user": {}
}
```

### DELETE `/api/usuario/{uid}/`

Status: implementado.

Marca conta para exclusao e desativa acesso no Firebase Auth.

Response `200`:

```json
{
  "mensagem": "Conta marcada para exclusao e acesso desativado."
}
```

## 5. Check-ins

### POST `/api/check-ins/`

Status: planejado.

Cria registro emocional diario.

Request:

```json
{
  "emotionId": "sad",
  "intensity": 4,
  "secondaryEmotionIds": ["tired", "anxious"],
  "sleepQuality": "low",
  "receivedSupport": "partly",
  "note": "Hoje foi um dia mais dificil, mas consegui descansar um pouco."
}
```

Response `201`:

```json
{
  "checkIn": {
    "id": "check-in-001",
    "userId": "firebase-uid",
    "createdAt": "2026-06-08T12:00:00.000Z",
    "updatedAt": "2026-06-08T12:00:00.000Z",
    "emotionId": "sad",
    "intensity": 4,
    "secondaryEmotionIds": ["tired", "anxious"],
    "sleepQuality": "low",
    "receivedSupport": "partly",
    "note": "Hoje foi um dia mais dificil, mas consegui descansar um pouco."
  }
}
```

### GET `/api/check-ins/`

Status: planejado.

Lista check-ins do usuario autenticado.

Query params:

- `limit`: quantidade maxima.
- `cursor`: cursor de paginacao.
- `from`: data inicial `YYYY-MM-DD`.
- `to`: data final `YYYY-MM-DD`.

Response `200`:

```json
{
  "items": [],
  "nextCursor": null
}
```

### GET `/api/check-ins/{checkInId}/`

Status: planejado.

Retorna um check-in do usuario autenticado.

### PATCH `/api/check-ins/{checkInId}/`

Status: planejado.

Atualiza campos editaveis do check-in.

### DELETE `/api/check-ins/{checkInId}/`

Status: planejado.

Remove ou marca o registro como removido. Preferir soft delete se houver auditoria.

### GET `/api/check-ins/summary/`

Status: planejado.

Agregado para home, historico e dashboard.

Response `200`:

```json
{
  "period": {
    "from": "2026-06-01",
    "to": "2026-06-08"
  },
  "totalCheckIns": 5,
  "averageIntensity": 3.2,
  "sleepQualityCounts": {
    "low": 2,
    "medium": 2,
    "good": 1
  },
  "emotionCounts": {
    "sad": 2,
    "calm": 1,
    "tired": 2
  },
  "insight": {
    "eyebrow": "Seu cuidado da semana",
    "message": "Percebemos que o cansaco tem aparecido com frequencia. Se isso persistir, considere buscar apoio profissional."
  }
}
```

Regras de linguagem:

- Nunca retornar diagnostico.
- Usar padroes e sugestoes cuidadosas.
- Evitar frases como "voce tem depressao" ou "seu caso e grave".

## 6. Conteudos

### GET `/api/contents/`

Status: planejado.

Lista conteudos publicados.

Query params:

- `category`
- `tag`
- `profileCode`
- `limit`
- `cursor`

Response `200`:

```json
{
  "items": [
    {
      "id": "content-001",
      "title": "Respirar em dias intensos",
      "highlightWord": "Respirar",
      "summary": "Uma pratica breve para momentos de sobrecarga.",
      "category": "bem-estar",
      "tags": ["ansiedade", "respiracao", "autocuidado"],
      "readTime": "4 min",
      "badge": "Pratica guiada",
      "imageUrl": "https://example.com/image.jpg",
      "imageAlt": "Mae respirando em um ambiente tranquilo",
      "quote": "Um passo de cada vez tambem e cuidado.",
      "sections": [],
      "status": "published",
      "authorId": "user-pro-001",
      "createdAt": "2026-06-08T12:00:00.000Z",
      "updatedAt": "2026-06-08T12:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

### GET `/api/contents/{contentId}/`

Status: planejado.

Retorna conteudo publicado.

### POST `/api/contents/`

Status: planejado.

Permissao: `PRO` verificado ou `ADM`.

Cria conteudo tecnico/editorial.

### PATCH `/api/contents/{contentId}/`

Status: planejado.

Permissao: autor `PRO` ou `ADM`.

### DELETE `/api/contents/{contentId}/`

Status: planejado.

Permissao: autor `PRO` ou `ADM`. Preferir `status: "archived"`.

## 7. Recomendacoes

### GET `/api/recommendations/`

Status: planejado.

Retorna conteudos recomendados a partir do perfil e dos check-ins do usuario autenticado.

Query params:

- `limit`

Response `200`:

```json
{
  "items": [
    {
      "id": "recommendation-001",
      "contentId": "content-001",
      "title": "Respirar em dias intensos",
      "description": "Pode ajudar em momentos em que a tensao aparece com frequencia.",
      "duration": "4 min",
      "imageUrl": "https://example.com/image.jpg",
      "reasonTags": ["ansiedade", "intensidade-alta"],
      "createdAt": "2026-06-08T12:00:00.000Z"
    }
  ]
}
```

Regras:

- Regras simples por tags no MVP.
- Priorizar poucos itens por resposta.
- Nao diagnosticar.
- Respeitar `privacy.allowPersonalizedRecommendations`.

## 8. Comunidade

### GET `/api/community/posts/`

Status: planejado.

Lista posts publicados.

Query params:

- `category`
- `tag`
- `limit`
- `cursor`

Response `200`:

```json
{
  "items": [
    {
      "id": "post-001",
      "authorId": "firebase-uid",
      "authorName": "Usuaria Maia",
      "authorRole": "Mae no puerperio",
      "avatarInitials": "UM",
      "category": "apoio",
      "categoryLabel": "Apoio",
      "title": "Hoje precisei conversar",
      "message": "Foi um dia cansativo e eu queria ouvir outras experiencias.",
      "tags": ["acolhimento", "rede"],
      "supportCount": 3,
      "repliesCount": 1,
      "isAnonymous": true,
      "status": "published",
      "createdAt": "2026-06-08T12:00:00.000Z",
      "updatedAt": "2026-06-08T12:00:00.000Z"
    }
  ],
  "nextCursor": null
}
```

### POST `/api/community/posts/`

Status: planejado.

Cria post da comunidade.

Request:

```json
{
  "category": "apoio",
  "title": "Hoje precisei conversar",
  "message": "Foi um dia cansativo e eu queria ouvir outras experiencias.",
  "tags": ["acolhimento", "rede"],
  "isAnonymous": true
}
```

### GET `/api/community/posts/{postId}/`

Status: planejado.

Retorna post e comentarios.

Response `200`:

```json
{
  "post": {},
  "comments": []
}
```

### POST `/api/community/posts/{postId}/comments/`

Status: planejado.

Cria comentario.

Request:

```json
{
  "message": "Voce nao precisa passar por isso sozinha.",
  "isAnonymous": false
}
```

### POST `/api/community/posts/{postId}/support/`

Status: planejado.

Registra ou remove apoio do usuario autenticado.

Request:

```json
{
  "supported": true
}
```

Response `200`:

```json
{
  "supported": true,
  "supportCount": 4
}
```

### POST `/api/community/comments/{commentId}/feedback/`

Status: planejado.

Registra feedback util/nao util em comentario.

Request:

```json
{
  "vote": "helpful"
}
```

## 9. Notificacoes

### GET `/api/notifications/preferences/`

Status: planejado.

Retorna preferencias do usuario autenticado.

### PUT `/api/notifications/preferences/`

Status: planejado.

Request:

```json
{
  "dailyCheckInEnabled": true,
  "pushEnabled": true,
  "timezone": "America/Fortaleza",
  "dailyCheckInTime": "20:00"
}
```

### POST `/api/notifications/subscriptions/`

Status: planejado.

Salva inscricao push da PWA.

Request:

```json
{
  "endpoint": "https://push.example/subscription",
  "keys": {
    "p256dh": "key",
    "auth": "auth"
  }
}
```

## 10. Admin

Todas as rotas desta secao exigem papel `ADM`.

### GET `/api/admin/metrics/`

Status: planejado.

Response `200`:

```json
{
  "items": [
    {
      "id": "users",
      "label": "Usuarios ativos",
      "value": 120,
      "description": "Contas ativas no Maia."
    }
  ]
}
```

### GET `/api/admin/professional-verifications/`

Status: planejado.

Lista validacoes profissionais.

Response `200`:

```json
{
  "items": [
    {
      "id": "verification-001",
      "userId": "user-pro-001",
      "fullName": "Profissional Maia",
      "email": "profissional@example.com",
      "phone": "(85) 99999-9999",
      "registrationNumber": "123456",
      "council": "CRM",
      "state": "CE",
      "specialty": "Obstetricia",
      "status": "pending",
      "submittedAt": "2026-06-08T12:00:00.000Z",
      "reviewedAt": null,
      "reviewedBy": null,
      "rejectionReason": null,
      "evidenceStoragePaths": []
    }
  ],
  "nextCursor": null
}
```

### PATCH `/api/admin/professional-verifications/{verificationId}/`

Status: planejado.

Request:

```json
{
  "action": "approve",
  "reason": ""
}
```

Valores de `action`:

- `approve`
- `reject`
- `return-to-review`

Response `200`:

```json
{
  "message": "Validacao profissional atualizada.",
  "verification": {}
}
```

### GET `/api/admin/community/posts/`

Status: planejado.

Lista posts para moderacao.

### PATCH `/api/admin/community/posts/{postId}/`

Status: planejado.

Request:

```json
{
  "status": "hidden",
  "reason": "Conteudo fora das diretrizes da comunidade."
}
```

## 11. Privacidade e dados

### GET `/api/privacy/export/`

Status: planejado.

Retorna dados exportaveis do usuario autenticado.

### POST `/api/privacy/delete-request/`

Status: planejado.

Marca conta para exclusao. Deve reutilizar a regra de `pending-deletion`.

Request:

```json
{
  "reason": "Opcional"
}
```

## 12. Colecoes Firestore esperadas

Colecoes principais:

- `users/{userId}`
- `checkIns/{checkInId}`
- `contents/{contentId}`
- `recommendations/{recommendationId}` ou recomendacoes calculadas sob demanda
- `communityPosts/{postId}`
- `communityComments/{commentId}`
- `communitySupports/{supportId}`
- `professionalVerifications/{verificationId}`
- `notificationSubscriptions/{subscriptionId}`
- `adminActions/{actionId}`

Regras:

- Documentos devem conter `userId` ou `authorId` quando pertencerem a usuario.
- Dados privados devem ser consultados sempre com filtro por UID.
- Dados de comunidade podem expor nome protegido conforme `isAnonymous`.
- Dados administrativos exigem `ADM`.

## 13. Ordem de implementacao recomendada

1. Completar `PUT /api/usuario/{uid}/` conforme contrato de perfil.
2. Implementar check-ins.
3. Implementar resumo de check-ins.
4. Implementar conteudos.
5. Implementar recomendacoes.
6. Implementar comunidade.
7. Implementar validacao profissional e admin.
8. Implementar notificacoes.
9. Implementar exportacao/exclusao de dados.

