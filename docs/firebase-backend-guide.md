# Guia de backend Firebase - Maia

Este documento orienta a implementacao do backend Firebase do Maia. Ele foi escrito a partir do estado atual do frontend, dos mocks locais, de `context.md` e das regras de produto do projeto.

Observacao importante: o `context.md` ainda registra Django REST como backend planejado originalmente. Este guia descreve Firebase porque essa foi a direcao solicitada para a tarefa atual. Se a decisao oficial do projeto mudar, atualize `context.md` e este documento juntos.

## 1. Escopo do backend

Backend recomendado no Firebase:

- Firebase Authentication para login, cadastro, reset de senha e provedores futuros.
- Cloud Firestore como banco principal.
- Firebase Storage para fotos de perfil, anexos de diario, audio e imagens futuras.
- Firebase Cloud Messaging para notificacoes push.
- Cloud Functions para contadores, agregacoes, moderacao, recomendacoes e lembretes.

O Maia lida com dados emocionais sensiveis. O backend nao deve gerar diagnosticos medicos ou psicologicos. Insights e recomendacoes devem usar linguagem de padrao, acolhimento e orientacao cuidadosa.

## 2. Convencoes gerais

- Use `auth.uid` como id do usuario em `users/{userId}`.
- Nao grave senha no Firestore. Senha pertence apenas ao Firebase Auth.
- Use `Timestamp` do Firestore para datas de auditoria (`createdAt`, `updatedAt`, `deletedAt`, `sentAt`).
- Use string `YYYY-MM-DD` para chaves de dia (`dateKey`, `birthDate`, `babyBirthDate`) quando a consulta por calendario for importante.
- Use `serverTimestamp()` no backend para campos de auditoria.
- Campos sensiveis devem ficar em documentos acessiveis apenas pela propria usuaria e administradores.
- Contadores publicos (`supportCount`, `repliesCount`, `helpfulCount`) devem ser atualizados por Cloud Functions ou transacoes, nao diretamente pelo cliente.
- Dados derivados de historico emocional devem ser recalculaveis a partir dos check-ins.

## 3. Mapa geral do Firestore

```txt
users/{userId}
users/{userId}/babies/{babyId}
users/{userId}/checkIns/{dateKey}
users/{userId}/journeyEntries/{entryId}
users/{userId}/emotionalSummaries/{summaryId}
users/{userId}/recommendations/{recommendationId}
users/{userId}/savedContents/{contentId}
users/{userId}/notificationPreferences/default
users/{userId}/devices/{deviceId}
users/{userId}/consents/{consentId}

communityPosts/{postId}
communityPosts/{postId}/replies/{replyId}
communityPosts/{postId}/supports/{userId}
communityPosts/{postId}/reports/{reportId}
communityPosts/{postId}/replies/{replyId}/votes/{userId}

contents/{contentId}
contentCategories/{categoryId}
professionalVerifications/{verificationId}
moderationReports/{reportId}
moderationActions/{actionId}
notifications/{notificationId}
dataRequests/{requestId}
appConfig/{configId}
```

## 4. Tipos base

```ts
type Timestamp = import("firebase/firestore").Timestamp;

type UserProfileCode = "PUE" | "MMT" | "DSM" | "PRO" | "ADM";

type UserProfileSlug =
  | "recent-mother"
  | "experienced-mother"
  | "future-mother"
  | "health-professional"
  | "administrator";

type UserStatus = "active" | "blocked" | "pending-deletion" | "deleted";

type ProfessionalVerificationStatus =
  | "not-required"
  | "pending"
  | "verified"
  | "rejected";
```

## 5. User

Documento: `users/{userId}`

Representa a conta principal do usuario autenticado. Deve conter dados de perfil e preferencias gerais, mas nao deve conter senha nem historico emocional detalhado.

```ts
type User = {
  id: string;
  authUid: string;

  fullName: string;
  normalizedName: string;
  firstName: string;
  email: string;
  emailVerified: boolean;
  phone: string;
  birthDate: string; // YYYY-MM-DD
  avatarUrl?: string;

  profileCode: UserProfileCode;
  profileSlug: UserProfileSlug;
  roles: UserProfileCode[];
  status: UserStatus;

  professionalVerificationStatus: ProfessionalVerificationStatus;
  professional?: ProfessionalProfile;
  recentMother?: RecentMotherProfile;
  futureMother?: FutureMotherProfile;
  mentor?: MentorProfile;

  privacy: UserPrivacySettings;
  notificationSummary: UserNotificationSummary;
  stats: UserStats;
  onboarding: UserOnboardingState;

  acceptedTermsVersion: string;
  acceptedPrivacyVersion: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastLoginAt?: Timestamp;
  deletedAt?: Timestamp;
};
```

### 5.1 Profile por tipo de usuario

```ts
type RecentMotherProfile = {
  babyIds: string[];
  bio?: string;
  supportNeeds?: string[];
};

type FutureMotherProfile = {
  journeyMoment?: string;
  interests?: string[];
  supportNeeds?: string[];
};

type MentorProfile = {
  motherhoodExperience?: string;
  mentorBio?: string;
  availableForSupport: boolean;
  supportTopics: string[];
};

type ProfessionalProfile = {
  registrationNumber: string;
  council: "CRM" | "CRP" | "COREN" | "CREFITO" | "CRN" | "OTHER";
  state: string; // UF, ex.: CE
  specialty: string;
  verifiedAt?: Timestamp;
  verifiedBy?: string;
  publicBio?: string;
};
```

### 5.2 Configuracoes do usuario

```ts
type UserPrivacySettings = {
  defaultAnonymousCommunityPost: boolean;
  showAvatarInCommunity: boolean;
  allowPersonalizedRecommendations: boolean;
  allowUsageAnalytics: boolean;
};

type UserNotificationSummary = {
  dailyCheckInEnabled: boolean;
  pushEnabled: boolean;
  timezone: string; // ex.: America/Sao_Paulo
};

type UserStats = {
  checkInsCount: number;
  postsCount: number;
  repliesCount: number;
  supportsGivenCount: number;
  supportsReceivedCount: number;
  lastCheckInAt?: Timestamp;
  lastCommunityActivityAt?: Timestamp;
};

type UserOnboardingState = {
  completed: boolean;
  selectedProfileAt?: Timestamp;
  completedAt?: Timestamp;
  completedSteps: string[];
};
```

## 6. Baby

Documento: `users/{userId}/babies/{babyId}`

Usado principalmente para perfil `PUE`.

```ts
type Baby = {
  id: string;
  userId: string;
  name: string;
  gender?: "girl" | "boy" | "not-informed";
  birthDate: string; // YYYY-MM-DD
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

## 7. Check-in diario

Documento: `users/{userId}/checkIns/{dateKey}`

O frontend atual usa estes campos no schema de check-in: `emotionId`, `intensity`, `secondaryEmotionIds`, `sleepQuality`, `receivedSupport`, `note`.

Use `dateKey` como id do documento para limitar a um check-in principal por dia. Se o produto decidir permitir varios registros por dia, use `checkIns/{autoId}` e mantenha `dateKey` como campo indexado.

```ts
type DailyCheckInRecord = {
  id: string; // preferencialmente igual a dateKey
  userId: string;
  dateKey: string; // YYYY-MM-DD
  timezone: string;

  emotionId:
    | "happy"
    | "calm"
    | "tired"
    | "overloaded"
    | "melancholic"
    | "anxious"
    | "hopeful"
    | "curious"
    | "sensitive";

  intensity: 1 | 2 | 3 | 4 | 5;
  secondaryEmotionIds: string[]; // maximo 4
  sleepQuality: "low" | "medium" | "good";
  receivedSupport: "yes" | "partly" | "no";
  note?: string; // maximo 280 caracteres

  source: "home-quick-check" | "full-check-in";
  attachments?: CheckInAttachment[];
  schemaVersion: number;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
};

type CheckInAttachment = {
  id: string;
  type: "image" | "audio";
  storagePath: string;
  downloadUrl?: string;
  durationSeconds?: number;
  createdAt: Timestamp;
};
```

Validacoes minimas:

- `emotionId` obrigatorio.
- `intensity` entre 1 e 5.
- `secondaryEmotionIds` com no maximo 4 itens.
- `sleepQuality` em `low`, `medium`, `good`.
- `receivedSupport` em `yes`, `partly`, `no`.
- `note` com no maximo 280 caracteres.
- Somente a propria usuaria pode ler ou escrever seus check-ins.

## 8. Historico emocional

O historico deve ser derivado dos check-ins, mas pode ter colecoes materializadas para dashboard e performance.

Documento: `users/{userId}/emotionalSummaries/{summaryId}`

`summaryId` recomendado:

- diario: `day_2026-06-03`
- semanal: `week_2026-W23`
- mensal: `month_2026-06`

```ts
type EmotionalSummary = {
  id: string;
  userId: string;
  periodType: "daily" | "weekly" | "monthly";
  periodStart: string; // YYYY-MM-DD
  periodEnd: string; // YYYY-MM-DD

  checkInsCount: number;
  dominantEmotionId?: string;
  emotionCounts: Record<string, number>;
  averageIntensity?: number;
  highIntensityCount: number;
  lowSleepCount: number;
  noSupportCount: number;
  partlySupportCount: number;
  secondaryEmotionCounts: Record<string, number>;

  insight?: {
    title: string;
    message: string;
    ruleId: string;
  };

  generatedAt: Timestamp;
  updatedAt: Timestamp;
};
```

Regras iniciais de insight:

- Se `lowSleepCount >= 2` na semana, sugerir descanso possivel ou rede de apoio.
- Se `noSupportCount >= 2` na semana, sugerir pedido pequeno e concreto de ajuda.
- Se uma emocao aparecer com maior frequencia, gerar mensagem acolhedora para esse padrao.
- Nao usar textos de diagnostico.

## 9. Diario multimidia e jornada

Documento: `users/{userId}/journeyEntries/{entryId}`

Funcionalidade desejavel para evolucao. Pode ser usada para diario livre, voz e foto.

```ts
type JourneyEntry = {
  id: string;
  userId: string;
  title?: string;
  text?: string;
  moodEmotionId?: string;
  tags: string[];
  attachments: JourneyAttachment[];
  visibility: "private";
  linkedCheckInId?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
};

type JourneyAttachment = {
  id: string;
  type: "image" | "audio";
  storagePath: string;
  downloadUrl?: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  durationSeconds?: number;
  createdAt: Timestamp;
};
```

## 10. Comunidade: Post

Documento: `communityPosts/{postId}`

O frontend atual usa categorias `apoio`, `sono`, `rede`, `profissional`, posts anonimos, tags, contador de apoios e contador de respostas.

```ts
type CommunityPostCategory = "apoio" | "sono" | "rede" | "profissional";

type CommunityPostStatus =
  | "published"
  | "under-review"
  | "hidden"
  | "removed";

type CommunityPost = {
  id: string;
  authorId: string;
  authorSnapshot: CommunityAuthorSnapshot;
  isAnonymous: boolean;

  category: CommunityPostCategory;
  categoryLabel: string;
  title: string;
  message: string;
  tags: string[];

  supportCount: number;
  repliesCount: number;
  reportsCount: number;
  highlightedReplyId?: string;
  highlightedReplySnapshot?: HighlightedReplySnapshot;

  status: CommunityPostStatus;
  moderation?: ModerationState;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  lastActivityAt: Timestamp;
  deletedAt?: Timestamp;
};

type CommunityAuthorSnapshot = {
  displayName: string;
  roleLabel: string;
  profileCode: UserProfileCode;
  profileSlug: UserProfileSlug;
  avatarUrl?: string;
  avatarInitials: string;
  professionalVerified: boolean;
};

type HighlightedReplySnapshot = {
  replyId: string;
  authorName: string;
  authorRole: string;
  message: string;
};

type ModerationState = {
  reason?: string;
  reviewedBy?: string;
  reviewedAt?: Timestamp;
  automatedFlags?: string[];
};
```

Validacoes minimas:

- `title` entre 6 e 90 caracteres.
- `message` entre 20 e 520 caracteres.
- `tags` com no maximo 4 itens no primeiro MVP.
- `isAnonymous = true` deve ocultar nome e avatar reais no snapshot publico.
- Posts de categoria `profissional` devem ser criados por `PRO` verificado ou por admin.
- O cliente nao pode alterar `supportCount`, `repliesCount` ou `reportsCount` diretamente.

## 11. Comunidade: Replies

Documento: `communityPosts/{postId}/replies/{replyId}`

No frontend atual isso aparece como `CommunityComment`, mas no backend use o nome `Reply` para diferenciar de comentarios internos de moderacao.

```ts
type CommunityReplyStatus =
  | "published"
  | "under-review"
  | "hidden"
  | "removed";

type CommunityReply = {
  id: string;
  postId: string;
  authorId: string;
  authorSnapshot: CommunityAuthorSnapshot;
  isAnonymous: boolean;

  message: string; // maximo recomendado: 360 caracteres
  helpfulCount: number;
  notHelpfulCount: number;
  reportsCount: number;

  status: CommunityReplyStatus;
  moderation?: ModerationState;

  createdAt: Timestamp;
  updatedAt: Timestamp;
  deletedAt?: Timestamp;
};
```

Subcolecao de votos:

```ts
type CommunityReplyVote = {
  userId: string;
  value: "helpful" | "not-helpful";
  createdAt: Timestamp;
  updatedAt: Timestamp;
};
```

Caminho: `communityPosts/{postId}/replies/{replyId}/votes/{userId}`

## 12. Apoios em posts

Documento: `communityPosts/{postId}/supports/{userId}`

```ts
type CommunityPostSupport = {
  userId: string;
  postId: string;
  createdAt: Timestamp;
};
```

Regras:

- O id do documento deve ser o `userId` para impedir apoio duplicado.
- Ao criar/remover apoio, Cloud Function atualiza `communityPosts/{postId}.supportCount`.
- Em linguagem de produto, usar "apoio" em vez de "curtida".

## 13. Reports e moderacao

Documento global: `moderationReports/{reportId}`

Tambem pode existir espelho em `communityPosts/{postId}/reports/{reportId}` para consulta do post.

```ts
type ModerationReport = {
  id: string;
  targetType: "post" | "reply" | "user" | "content";
  targetPath: string;
  targetId: string;
  reporterId: string;
  reason:
    | "spam"
    | "harassment"
    | "unsafe-advice"
    | "medical-diagnosis"
    | "personal-data"
    | "other";
  description?: string;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  createdAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
};

type ModerationAction = {
  id: string;
  reportId?: string;
  targetType: ModerationReport["targetType"];
  targetPath: string;
  action: "hide" | "remove" | "restore" | "warn-user" | "block-user";
  reason: string;
  adminId: string;
  createdAt: Timestamp;
};
```

## 14. Conteudos

Documento: `contents/{contentId}`

O frontend atual possui artigos com titulo, resumo, categoria, tags, tempo de leitura, imagem, quote e secoes.

```ts
type ContentStatus = "draft" | "published" | "archived";

type ContentArticle = {
  id: string;
  type: "article" | "video" | "audio";
  title: string;
  highlightWord?: string;
  summary: string;
  categoryId: string;
  categoryLabel: string;
  tags: string[];

  readTimeMinutes: number;
  badge?: string;
  imageUrl: string;
  imageAlt: string;
  quote?: string;
  sections: ContentSection[];

  authorId?: string;
  authorSnapshot?: {
    name: string;
    roleLabel: string;
    professionalVerified: boolean;
  };

  status: ContentStatus;
  publishedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

type ContentSection = {
  title?: string;
  paragraphs?: string[];
  items?: Array<{
    title: string;
    text: string;
  }>;
};
```

Documento: `contentCategories/{categoryId}`

```ts
type ContentCategory = {
  id: string;
  label: string;
  description?: string;
  order: number;
  active: boolean;
};
```

Regras:

- `PRO` verificado pode criar conteudo tecnico em `draft`.
- `ADM` revisa e publica.
- Conteudos publicados podem ser lidos por usuarios autenticados.
- Conteudos nao devem prometer cura, tratamento ou diagnostico.

## 15. Recomendacoes

Documento: `users/{userId}/recommendations/{recommendationId}`

```ts
type UserRecommendation = {
  id: string;
  userId: string;
  contentId: string;
  title: string;
  description: string;
  reasonTags: string[];
  source:
    | "latest-check-in"
    | "weekly-pattern"
    | "profile-onboarding"
    | "manual";
  sourceRecordIds: string[];
  priority: number;
  status: "active" | "opened" | "dismissed" | "expired";
  generatedAt: Timestamp;
  openedAt?: Timestamp;
  dismissedAt?: Timestamp;
  expiresAt?: Timestamp;
};
```

Exemplos de regras:

- `emotionId = anxious` recomenda conteudos com tags `respiracao`, `pausa`, `ansiedade`.
- `sleepQuality = low` recorrente recomenda tags `sono`, `descanso`, `rede de apoio`.
- `receivedSupport = no` recorrente recomenda tags `apoio`, `familia`, `pedido de ajuda`.

## 16. Notificacoes

Documento: `users/{userId}/notificationPreferences/default`

```ts
type NotificationPreferences = {
  dailyCheckInEnabled: boolean;
  dailyCheckInTime: string; // HH:mm
  timezone: string;
  lastPromptDate?: string; // YYYY-MM-DD
  communityRepliesEnabled: boolean;
  contentRecommendationsEnabled: boolean;
  updatedAt: Timestamp;
};
```

Documento: `users/{userId}/devices/{deviceId}`

```ts
type UserDevice = {
  id: string;
  userId: string;
  webPushSubscription: PushSubscriptionJSON;
  platform: "web";
  browser?: string;
  enabled: boolean;
  createdAt: Timestamp;
  lastSeenAt: Timestamp;
};
```

Documento: `notifications/{notificationId}`

```ts
type NotificationRecord = {
  id: string;
  userId: string;
  type:
    | "daily-check-in"
    | "community-reply"
    | "content-recommendation"
    | "moderation";
  title: string;
  body: string;
  data?: Record<string, string>;
  status: "scheduled" | "sent" | "failed" | "read";
  scheduledAt?: Timestamp;
  sentAt?: Timestamp;
  readAt?: Timestamp;
  createdAt: Timestamp;
  errorMessage?: string;
};
```

## 17. Verificacao profissional

Documento: `professionalVerifications/{verificationId}`

```ts
type ProfessionalVerification = {
  id: string;
  userId: string;
  fullName: string;
  registrationNumber: string;
  council: "CRM" | "CRP" | "COREN" | "CREFITO" | "CRN" | "OTHER";
  state: string;
  specialty: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: Timestamp;
  reviewedAt?: Timestamp;
  reviewedBy?: string;
  rejectionReason?: string;
  evidenceStoragePaths?: string[];
};
```

Ao aprovar, atualizar:

- `users/{userId}.professionalVerificationStatus = "verified"`
- `users/{userId}.professional.verifiedAt`
- claims customizadas, se usadas: `{ pro: true, verifiedProfessional: true }`

## 18. Consentimentos e LGPD

Documento: `users/{userId}/consents/{consentId}`

```ts
type UserConsent = {
  id: string;
  userId: string;
  type: "terms" | "privacy" | "recommendations" | "analytics";
  version: string;
  accepted: boolean;
  acceptedAt: Timestamp;
  revokedAt?: Timestamp;
};
```

Documento: `dataRequests/{requestId}`

```ts
type DataRequest = {
  id: string;
  userId: string;
  type: "export" | "delete";
  status: "requested" | "processing" | "completed" | "rejected";
  requestedAt: Timestamp;
  completedAt?: Timestamp;
  fileStoragePath?: string;
  reviewedBy?: string;
};
```

Regras de privacidade:

- Exportacao deve incluir perfil, check-ins, diario, posts, replies e preferencias.
- Exclusao deve anonimizar ou remover dados pessoais, preservando integridade da comunidade quando necessario.
- Posts anonimos nao devem expor `authorId` ao cliente publico, apenas em regras/admin/backend.
- Dados emocionais nao devem ser usados para publicidade.

## 19. Firebase Storage

Estrutura recomendada:

```txt
users/{userId}/avatar/{fileId}
users/{userId}/check-ins/{checkInId}/{fileId}
users/{userId}/journey/{entryId}/{fileId}
professional-verifications/{userId}/{fileId}
content/{contentId}/{fileId}
exports/{userId}/{requestId}.json
```

Regras:

- Avatar pode ser lido por usuarios autenticados se `showAvatarInCommunity` permitir uso publico.
- Anexos de check-in e diario sao privados por usuario.
- Evidencias profissionais sao privadas para usuario, admins e processo de verificacao.
- Exports LGPD devem ter URL temporaria, nao publica permanente.

## 20. Indices Firestore esperados

Criar indices compostos para:

- `communityPosts`: `status asc`, `createdAt desc`.
- `communityPosts`: `status asc`, `category asc`, `createdAt desc`.
- `communityPosts`: `status asc`, `lastActivityAt desc`.
- `communityPosts/{postId}/replies`: `status asc`, `createdAt asc`.
- `users/{userId}/checkIns`: `dateKey desc`.
- `users/{userId}/emotionalSummaries`: `periodType asc`, `periodStart desc`.
- `contents`: `status asc`, `categoryId asc`, `publishedAt desc`.
- `contents`: `status asc`, `tags array-contains`, `publishedAt desc`.
- `notifications`: `userId asc`, `status asc`, `scheduledAt asc`.
- `professionalVerifications`: `status asc`, `submittedAt asc`.
- `moderationReports`: `status asc`, `createdAt asc`.

## 21. Regras de seguranca

Diretriz de acesso:

- Usuario autenticado le e altera somente seus documentos privados.
- Posts publicados podem ser lidos por usuarios autenticados.
- Autor pode criar, editar e remover logicamente seus posts/replies enquanto publicados.
- Admin pode moderar qualquer post, reply, usuario, conteudo e verificacao.
- Profissional verificado pode criar conteudo tecnico em rascunho.
- Dados de check-in, diario e historico emocional sao privados.

Pseudo-regra:

```txt
users/{userId}
  read/update: request.auth.uid == userId || isAdmin()
  create: request.auth.uid == userId

users/{userId}/checkIns/{checkInId}
  read/write: request.auth.uid == userId || isAdmin()

communityPosts/{postId}
  read: authenticated && status == "published" || isAdmin()
  create: authenticated
  update/delete: authorId == request.auth.uid || isAdmin()

communityPosts/{postId}/replies/{replyId}
  read: authenticated && parent.status == "published"
  create: authenticated
  update/delete: authorId == request.auth.uid || isAdmin()

contents/{contentId}
  read: authenticated && status == "published" || isAdmin()
  create/update: isVerifiedProfessional() || isAdmin()
```

Implementar validacoes de shape nas rules quando viavel, especialmente enums, tamanho de texto e bloqueio de campos de contador.

## 22. Cloud Functions recomendadas

- `onAuthUserCreate`: cria `users/{uid}` com dados basicos e status inicial.
- `onUserProfileUpdate`: normaliza nome, atualiza `firstName`, `normalizedName` e claims se necessario.
- `onCheckInWrite`: atualiza `stats.lastCheckInAt`, `stats.checkInsCount`, summaries e recomendacoes.
- `onCommunitySupportWrite`: atualiza `supportCount`.
- `onCommunityReplyWrite`: atualiza `repliesCount` e `lastActivityAt` do post.
- `onReplyVoteWrite`: atualiza `helpfulCount` e `notHelpfulCount`.
- `onModerationReportCreate`: incrementa `reportsCount` e marca item como `under-review` se atingir limite.
- `scheduledDailyCheckInReminder`: envia push conforme preferencias e timezone.
- `onProfessionalVerificationUpdate`: aplica status em `users/{uid}` e custom claims.
- `onDataRequestCreate`: processa exportacao ou exclusao LGPD.

## 23. Migracao dos mocks atuais

Mapeamento do frontend atual para Firebase:

```txt
maia-profile-data
  -> users/{uid}

maia-daily-check-ins
  -> users/{uid}/checkIns/{dateKey}

maia-community-created-posts
  -> communityPosts/{postId}

communityComments mockados
  -> communityPosts/{postId}/replies/{replyId}

contentArticles mockados
  -> contents/{contentId}

maia-notification-preferences
  -> users/{uid}/notificationPreferences/default
```

Campos que existem no prototipo mas nao devem ir iguais para producao:

- `password` em `ProfileFormValues`: remover do Firestore, usar Firebase Auth.
- `timeAgo`: nao persistir, calcular no frontend a partir de `createdAt`.
- `categoryLabel` pode ser denormalizado no post, mas a fonte principal deve ser enum/categoria.
- Opcoes mockadas de estado/especialidade do profissional devem ser substituidas por UF real e lista real de especialidades.

## 24. Ordem sugerida de implementacao

1. Configurar Firebase Auth e criar `users/{uid}` no cadastro.
2. Migrar perfil e selecao de tipo de usuario.
3. Implementar check-in em `users/{uid}/checkIns`.
4. Criar summaries semanais simples por Cloud Function.
5. Implementar comunidade com posts, replies e apoios.
6. Implementar conteudos publicados e recomendacoes por tags.
7. Implementar notificacoes push e preferencias.
8. Implementar verificacao profissional e painel admin.
9. Implementar exportacao/remocao LGPD.

## 25. Checklist de Definition of Done do backend

- Firestore rules impedem leitura de check-ins por outro usuario.
- Senha nunca e gravada em documentos.
- Escritas em contadores publicos nao sao permitidas pelo cliente.
- Posts anonimos nao expoem nome real no payload publico.
- Conteudos profissionais exigem usuario verificado ou admin.
- Check-ins validam enums e limites do frontend.
- Historico emocional pode ser reconstruido a partir dos registros.
- Notificacoes respeitam preferencia do usuario e permissao do dispositivo.
- Exportacao e exclusao de dados possuem fluxo auditavel.
- Textos gerados por regras nao usam linguagem diagnostica.
