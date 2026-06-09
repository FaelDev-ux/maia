import { apiFetch } from "@/services/api/client";
import { normalizeCommunityPost } from "@/features/community/services";
import type { CommunityPost } from "@/features/community/types";
import type { AdminMetric, ProfessionalVerification, ProfessionalVerificationAction } from "@/features/admin/types";
import type { ProfessionalProfile, User } from "@/types/user";

type AdminMetricsResponse = {
  metrics?: {
    checkInsCount?: number;
    communityPostsCount?: number;
    pendingProfessionalsCount?: number;
    usersCount?: number;
  };
};

type AdminActionsResponse = {
  actions?: unknown[];
};

type ProfessionalVerificationsResponse = {
  items?: unknown[];
  professionalVerifications?: unknown[];
};

type ProfessionalVerificationResponse = {
  user?: unknown;
  verification?: unknown;
};

type AdminCommunityPostsResponse = {
  items?: unknown[];
  posts?: unknown[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isUser(value: unknown): value is Partial<User> {
  return typeof value === "object" && value !== null;
}

function normalizeProfessionalVerification(value: unknown): ProfessionalVerification {
  const user = isUser(value) ? value : {};
  const professional = (user.professional ?? {}) as Partial<ProfessionalProfile>;
  const submittedAt = user.createdAt ?? new Date().toISOString();

  return {
    id: user.id ?? user.authUid ?? `verification-${submittedAt}`,
    userId: user.id ?? user.authUid ?? "",
    council: professional.council ?? "OTHER",
    email: user.email ?? "",
    evidenceStoragePaths: [],
    fullName: user.fullName ?? "Profissional Maia",
    phone: user.phone ?? "",
    registrationNumber: professional.registrationNumber ?? "",
    rejectionReason: undefined,
    reviewedAt: professional.verifiedAt,
    reviewedBy: professional.verifiedBy,
    specialty: professional.specialty ?? "Especialidade nao informada",
    state: professional.state ?? "",
    status:
      user.professionalVerificationStatus === "verified" ||
      user.professionalVerificationStatus === "rejected"
        ? user.professionalVerificationStatus
        : "pending",
    submittedAt,
  };
}

function normalizeAdminAction(value: unknown): ProfessionalVerificationAction {
  const action = isRecord(value) ? value : {};
  const previousStatus =
    action.previousStatus === "verified" || action.previousStatus === "rejected"
      ? action.previousStatus
      : "pending";
  const nextStatus =
    action.nextStatus === "verified" || action.nextStatus === "rejected"
      ? action.nextStatus
      : "pending";
  const actionName =
    nextStatus === "verified"
      ? "approve"
      : nextStatus === "rejected"
        ? "reject"
        : "return-to-review";

  return {
    id: String(action.id ?? `action-${action.createdAt ?? Date.now()}`),
    action: actionName,
    adminId: String(action.adminId ?? ""),
    createdAt: String(action.createdAt ?? new Date().toISOString()),
    nextStatus,
    previousStatus,
    reason: typeof action.reason === "string" ? action.reason : undefined,
    userId: String(action.targetId ?? ""),
    verificationId: String(action.targetId ?? ""),
  };
}

export function normalizeAdminMetrics(metrics: AdminMetricsResponse["metrics"] = {}): AdminMetric[] {
  return [
    {
      id: "users",
      label: "Usuarios",
      value: Number(metrics.usersCount ?? 0),
      description: "Contas cadastradas no Maia.",
    },
    {
      id: "pending-professionals",
      label: "Profissionais pendentes",
      value: Number(metrics.pendingProfessionalsCount ?? 0),
      description: "Validacoes profissionais aguardando decisao.",
    },
    {
      id: "community-posts",
      label: "Posts da comunidade",
      value: Number(metrics.communityPostsCount ?? 0),
      description: "Publicacoes registradas para moderacao.",
    },
    {
      id: "check-ins",
      label: "Check-ins",
      value: Number(metrics.checkInsCount ?? 0),
      description: "Registros emocionais salvos no backend.",
    },
  ];
}

export async function fetchAdminMetrics() {
  const data = await apiFetch<AdminMetricsResponse>(
    "/api/admin/metrics",
    undefined,
    "Nao foi possivel carregar metricas administrativas."
  );

  return normalizeAdminMetrics(data.metrics);
}

export async function fetchAdminActions() {
  const data = await apiFetch<AdminActionsResponse>(
    "/api/admin/actions",
    undefined,
    "Nao foi possivel carregar historico administrativo."
  );

  return (data.actions ?? []).map(normalizeAdminAction);
}

export async function fetchProfessionalVerifications() {
  const data = await apiFetch<ProfessionalVerificationsResponse>(
    "/api/admin/professional-verifications",
    undefined,
    "Nao foi possivel carregar validacoes profissionais."
  );

  return (data.professionalVerifications ?? data.items ?? []).map(normalizeProfessionalVerification);
}

export async function updateProfessionalVerificationStatusApi(
  verificationId: string,
  status: ProfessionalVerification["status"]
): Promise<ProfessionalVerification | null> {
  const data = await apiFetch<ProfessionalVerificationResponse>(
    `/api/admin/professional-verifications/${verificationId}`,
    {
      body: JSON.stringify({ status }),
      method: "PATCH",
    },
    "Nao foi possivel atualizar a validacao profissional."
  );
  const value = data.verification ?? data.user;

  return value ? normalizeProfessionalVerification(value) : null;
}

export async function fetchAdminCommunityPosts(): Promise<CommunityPost[]> {
  const data = await apiFetch<AdminCommunityPostsResponse>(
    "/api/admin/community/posts",
    undefined,
    "Nao foi possivel carregar posts para moderacao."
  );

  return (data.posts ?? data.items ?? []).map((post) =>
    normalizeCommunityPost(post as Parameters<typeof normalizeCommunityPost>[0])
  );
}

export async function moderateCommunityPost(postId: string, status: "hidden" | "removed") {
  await apiFetch(
    `/api/community/posts/${postId}`,
    {
      body: JSON.stringify({ status }),
      method: "PATCH",
    },
    "Nao foi possivel moderar esta publicacao."
  );
}
