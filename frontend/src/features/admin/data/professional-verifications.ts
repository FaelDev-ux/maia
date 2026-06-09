import type { AdminMetric, ProfessionalVerification, ProfessionalVerificationReviewStatus } from "@/features/admin/types";

export const professionalVerificationStatusLabels = {
  pending: "Em analise",
  rejected: "Rejeitada",
  verified: "Verificada",
} satisfies Record<ProfessionalVerificationReviewStatus, string>;

export const professionalVerificationStatusDescriptions = {
  pending: "Aguardando revisao de registro profissional.",
  rejected: "A solicitacao precisa de correcao ou nova comprovacao.",
  verified: "Profissional liberada para recursos de especialista.",
} satisfies Record<ProfessionalVerificationReviewStatus, string>;

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
      label: "Em analise",
      value: pendingCount,
      description: "Solicitacoes aguardando conferencia manual.",
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
      description: "Registros que precisam de correcao ou nova evidencia.",
    },
  ];
}
