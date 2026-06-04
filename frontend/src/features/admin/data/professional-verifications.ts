import {
  getStoredUserProfile,
  PROFILE_STORAGE_KEY,
  saveUserProfile,
} from "@/features/profile/data/profile-storage";
import type {
  AdminMetric,
  ProfessionalVerification,
  ProfessionalVerificationAction,
  ProfessionalVerificationReviewStatus,
} from "@/features/admin/types";
import type { ProfessionalVerificationStatus, User } from "@/types/user";

export const PROFESSIONAL_VERIFICATIONS_STORAGE_KEY = "maia-professional-verifications";
export const PROFESSIONAL_VERIFICATION_ACTIONS_STORAGE_KEY =
  "maia-professional-verification-actions";
export const PROFESSIONAL_VERIFICATIONS_UPDATED_EVENT =
  "maia-professional-verifications-updated";

const MOCK_ADMIN_ID = "mock-admin-001";

export const professionalVerificationStatusLabels = {
  pending: "Em análise",
  rejected: "Rejeitada",
  verified: "Verificada",
} satisfies Record<ProfessionalVerificationReviewStatus, string>;

export const professionalVerificationStatusDescriptions = {
  pending: "Aguardando revisão de registro profissional.",
  rejected: "A solicitação precisa de correção ou nova comprovação.",
  verified: "Profissional liberada para recursos de especialista.",
} satisfies Record<ProfessionalVerificationReviewStatus, string>;

const mockProfessionalVerifications: ProfessionalVerification[] = [
  {
    id: "verification-mock-pro-001",
    userId: "mock-user-pro-001",
    fullName: "Dra. Marina Alencar",
    email: "marina.alencar@example.com",
    phone: "(85) 98888-1030",
    registrationNumber: "123456",
    council: "CRM",
    state: "CE",
    specialty: "Pediatria",
    status: "pending",
    submittedAt: "2026-06-03T09:15:00.000Z",
    evidenceStoragePaths: ["professional-verifications/mock-user-pro-001/registro.pdf"],
  },
  {
    id: "verification-nurse-002",
    userId: "mock-user-pro-002",
    fullName: "Enf. Camila Rocha",
    email: "camila.rocha@example.com",
    phone: "(11) 97777-2030",
    registrationNumber: "654321",
    council: "COREN",
    state: "SP",
    specialty: "Enfermagem obstétrica",
    status: "pending",
    submittedAt: "2026-06-02T18:20:00.000Z",
    evidenceStoragePaths: ["professional-verifications/mock-user-pro-002/coren.pdf"],
  },
  {
    id: "verification-neonatal-003",
    userId: "mock-user-pro-003",
    fullName: "Dra. Renata Figueiredo",
    email: "renata.figueiredo@example.com",
    phone: "(31) 96666-4012",
    registrationNumber: "887210",
    council: "CRM",
    state: "MG",
    specialty: "Neonatologia",
    status: "verified",
    submittedAt: "2026-05-31T10:40:00.000Z",
    reviewedAt: "2026-06-01T13:05:00.000Z",
    reviewedBy: MOCK_ADMIN_ID,
    evidenceStoragePaths: ["professional-verifications/mock-user-pro-003/crm.pdf"],
  },
  {
    id: "verification-family-004",
    userId: "mock-user-pro-004",
    fullName: "Dra. Juliana Moura",
    email: "juliana.moura@example.com",
    phone: "(41) 95555-7801",
    registrationNumber: "492120",
    council: "CRM",
    state: "PR",
    specialty: "Medicina de família e comunidade",
    status: "rejected",
    submittedAt: "2026-05-30T08:10:00.000Z",
    reviewedAt: "2026-05-31T11:30:00.000Z",
    reviewedBy: MOCK_ADMIN_ID,
    rejectionReason: "Número de registro incompleto para conferência local.",
    evidenceStoragePaths: ["professional-verifications/mock-user-pro-004/crm-parcial.pdf"],
  },
];

function emitProfessionalVerificationsUpdated() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(PROFESSIONAL_VERIFICATIONS_UPDATED_EVENT));
}

function getIsoTimestamp() {
  return new Date().toISOString();
}

function createLocalId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}`;
}

function isReviewStatus(value: unknown): value is ProfessionalVerificationReviewStatus {
  return value === "pending" || value === "verified" || value === "rejected";
}

function isProfessionalVerification(value: unknown): value is ProfessionalVerification {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "userId" in value &&
    "fullName" in value &&
    "registrationNumber" in value &&
    "council" in value &&
    "state" in value &&
    "specialty" in value &&
    "status" in value &&
    isReviewStatus((value as Partial<ProfessionalVerification>).status)
  );
}

function getStoredProfessionalUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    const parsedProfile = storedProfile ? (JSON.parse(storedProfile) as Partial<User>) : null;

    if (parsedProfile?.profileCode !== "PRO" || !parsedProfile.professional) {
      return null;
    }

    return getStoredUserProfile("health-professional");
  } catch {
    return null;
  }
}

function toReviewStatus(status: ProfessionalVerificationStatus): ProfessionalVerificationReviewStatus {
  if (status === "verified" || status === "rejected") {
    return status;
  }

  return "pending";
}

function buildVerificationFromProfessionalUser(user: User): ProfessionalVerification {
  const professional = user.professional;
  const submittedAt = user.createdAt || getIsoTimestamp();

  return {
    id: `verification-${user.id}`,
    userId: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    registrationNumber: professional?.registrationNumber ?? "",
    council: professional?.council ?? "OTHER",
    state: professional?.state ?? "",
    specialty: professional?.specialty ?? "Especialidade não informada",
    status: toReviewStatus(user.professionalVerificationStatus),
    submittedAt,
    reviewedAt: professional?.verifiedAt,
    reviewedBy: professional?.verifiedBy,
    evidenceStoragePaths: [`professional-verifications/${user.id}/registro-local.pdf`],
  };
}

function mergeStoredProfessionalVerification(
  verifications: ProfessionalVerification[]
): ProfessionalVerification[] {
  const storedProfessionalUser = getStoredProfessionalUser();

  if (!storedProfessionalUser) {
    return verifications;
  }

  const verificationFromUser = buildVerificationFromProfessionalUser(storedProfessionalUser);
  const existingVerification = verifications.find(
    (verification) => verification.userId === storedProfessionalUser.id
  );

  if (!existingVerification) {
    return [verificationFromUser, ...verifications];
  }

  return verifications.map((verification) =>
    verification.userId === storedProfessionalUser.id
      ? {
          ...verification,
          fullName: verificationFromUser.fullName,
          email: verificationFromUser.email,
          phone: verificationFromUser.phone,
          registrationNumber: verificationFromUser.registrationNumber,
          council: verificationFromUser.council,
          state: verificationFromUser.state,
          specialty: verificationFromUser.specialty,
        }
      : verification
  );
}

function parseProfessionalVerifications(snapshot: string | null) {
  if (!snapshot) {
    return null;
  }

  try {
    const parsedVerifications = JSON.parse(snapshot) as unknown;

    return Array.isArray(parsedVerifications)
      ? parsedVerifications.filter(isProfessionalVerification)
      : null;
  } catch {
    return null;
  }
}

function sortVerificationsByReviewPriority(verifications: ProfessionalVerification[]) {
  const statusWeight = {
    pending: 0,
    rejected: 1,
    verified: 2,
  } satisfies Record<ProfessionalVerificationReviewStatus, number>;

  return [...verifications].sort((firstVerification, secondVerification) => {
    const weightDifference =
      statusWeight[firstVerification.status] - statusWeight[secondVerification.status];

    if (weightDifference !== 0) {
      return weightDifference;
    }

    return (
      new Date(secondVerification.submittedAt).getTime() -
      new Date(firstVerification.submittedAt).getTime()
    );
  });
}

export function getProfessionalVerifications() {
  if (typeof window === "undefined") {
    return sortVerificationsByReviewPriority(mockProfessionalVerifications);
  }

  const storedVerifications = parseProfessionalVerifications(
    window.localStorage.getItem(PROFESSIONAL_VERIFICATIONS_STORAGE_KEY)
  );
  const verifications = mergeStoredProfessionalVerification(
    storedVerifications ?? mockProfessionalVerifications
  );
  const sortedVerifications = sortVerificationsByReviewPriority(verifications);

  return sortedVerifications;
}

export function getProfessionalVerificationsSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(sortVerificationsByReviewPriority(mockProfessionalVerifications));
  }

  return JSON.stringify(getProfessionalVerifications());
}

export function getProfessionalVerificationsServerSnapshot() {
  return JSON.stringify(sortVerificationsByReviewPriority(mockProfessionalVerifications));
}

function saveProfessionalVerifications(verifications: ProfessionalVerification[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(
    PROFESSIONAL_VERIFICATIONS_STORAGE_KEY,
    JSON.stringify(sortVerificationsByReviewPriority(verifications))
  );
  emitProfessionalVerificationsUpdated();
}

export function getProfessionalVerificationActions() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const storedActions = window.localStorage.getItem(PROFESSIONAL_VERIFICATION_ACTIONS_STORAGE_KEY);
    const parsedActions = storedActions ? (JSON.parse(storedActions) as unknown) : [];

    return Array.isArray(parsedActions)
      ? (parsedActions as ProfessionalVerificationAction[]).filter(
          (action) => typeof action.id === "string" && typeof action.verificationId === "string"
        )
      : [];
  } catch {
    window.localStorage.removeItem(PROFESSIONAL_VERIFICATION_ACTIONS_STORAGE_KEY);
    return [];
  }
}

function saveProfessionalVerificationAction(action: ProfessionalVerificationAction) {
  if (typeof window === "undefined") {
    return;
  }

  const actions = getProfessionalVerificationActions();

  window.localStorage.setItem(
    PROFESSIONAL_VERIFICATION_ACTIONS_STORAGE_KEY,
    JSON.stringify([action, ...actions].slice(0, 20))
  );
  emitProfessionalVerificationsUpdated();
}

function syncStoredProfessionalUser(verification: ProfessionalVerification) {
  const storedProfessionalUser = getStoredProfessionalUser();

  if (!storedProfessionalUser || storedProfessionalUser.id !== verification.userId) {
    return;
  }

  const nextUser: User = {
    ...storedProfessionalUser,
    fullName: verification.fullName,
    email: verification.email,
    phone: verification.phone,
    professionalVerificationStatus: verification.status,
    professional: {
      ...(storedProfessionalUser.professional ?? {
        council: verification.council,
        registrationNumber: verification.registrationNumber,
        state: verification.state,
        specialty: verification.specialty,
      }),
      council: verification.council,
      registrationNumber: verification.registrationNumber,
      state: verification.state,
      specialty: verification.specialty,
      verifiedAt: verification.status === "verified" ? verification.reviewedAt : undefined,
      verifiedBy: verification.status === "verified" ? verification.reviewedBy : undefined,
    },
    updatedAt: getIsoTimestamp(),
  };

  saveUserProfile(nextUser);
}

export function updateProfessionalVerificationStatus({
  rejectionReason,
  status,
  verificationId,
}: {
  rejectionReason?: string;
  status: ProfessionalVerificationReviewStatus;
  verificationId: string;
}) {
  const verifications = getProfessionalVerifications();
  const currentVerification = verifications.find(
    (verification) => verification.id === verificationId
  );

  if (!currentVerification) {
    return null;
  }

  const now = getIsoTimestamp();
  const trimmedRejectionReason = rejectionReason?.trim();
  const nextVerification: ProfessionalVerification = {
    ...currentVerification,
    status,
    reviewedAt: status === "pending" ? undefined : now,
    reviewedBy: status === "pending" ? undefined : MOCK_ADMIN_ID,
    rejectionReason: status === "rejected" ? trimmedRejectionReason : undefined,
  };
  const nextVerifications = verifications.map((verification) =>
    verification.id === verificationId ? nextVerification : verification
  );
  const action: ProfessionalVerificationAction = {
    id: createLocalId("professional-verification-action"),
    verificationId,
    userId: currentVerification.userId,
    adminId: MOCK_ADMIN_ID,
    action:
      status === "verified"
        ? "approve"
        : status === "rejected"
          ? "reject"
          : "return-to-review",
    previousStatus: currentVerification.status,
    nextStatus: status,
    reason: status === "rejected" ? trimmedRejectionReason : undefined,
    createdAt: now,
  };

  saveProfessionalVerifications(nextVerifications);
  saveProfessionalVerificationAction(action);
  syncStoredProfessionalUser(nextVerification);

  return nextVerification;
}

export function getProfessionalVerificationMetrics(
  verifications: ProfessionalVerification[]
): AdminMetric[] {
  const pendingCount = verifications.filter(
    (verification) => verification.status === "pending"
  ).length;
  const verifiedCount = verifications.filter(
    (verification) => verification.status === "verified"
  ).length;
  const rejectedCount = verifications.filter(
    (verification) => verification.status === "rejected"
  ).length;

  return [
    {
      id: "pending",
      label: "Em análise",
      value: pendingCount,
      description: "Solicitações aguardando conferência manual.",
    },
    {
      id: "verified",
      label: "Verificadas",
      value: verifiedCount,
      description: "Profissionais liberadas para atuar como especialistas.",
    },
    {
      id: "rejected",
      label: "Rejeitadas",
      value: rejectedCount,
      description: "Registros que precisam de correção ou nova evidência.",
    },
  ];
}

export function resetProfessionalVerificationMocks() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PROFESSIONAL_VERIFICATIONS_STORAGE_KEY);
  window.localStorage.removeItem(PROFESSIONAL_VERIFICATION_ACTIONS_STORAGE_KEY);
  emitProfessionalVerificationsUpdated();
}
