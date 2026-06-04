import type {
  ProfessionalVerification,
  ProfessionalVerificationReviewStatus,
} from "@/features/admin/types";

export function formatAdminDateTime(value?: string) {
  if (!value) {
    return "Ainda não revisado";
  }

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function normalizeAdminSearch(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function getStatusTone(status: ProfessionalVerificationReviewStatus) {
  if (status === "verified") {
    return {
      className: "bg-success/[0.12] text-emerald-700 ring-success/25",
      dotClassName: "bg-success",
    };
  }

  if (status === "rejected") {
    return {
      className: "bg-danger/[0.12] text-red-700 ring-danger/25",
      dotClassName: "bg-danger",
    };
  }

  return {
    className: "bg-warning/[0.15] text-amber-700 ring-warning/30",
    dotClassName: "bg-warning",
  };
}

export function getVerificationSearchText(verification: ProfessionalVerification) {
  return normalizeAdminSearch(
    [
      verification.fullName,
      verification.email,
      verification.phone,
      verification.registrationNumber,
      verification.council,
      verification.state,
      verification.specialty,
      verification.status,
    ].join(" ")
  );
}
