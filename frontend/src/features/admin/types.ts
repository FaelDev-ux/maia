import type { ProfessionalCouncil } from "@/types/user";

export type ProfessionalVerificationReviewStatus = "pending" | "verified" | "rejected";

export type ProfessionalVerification = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  registrationNumber: string;
  council: ProfessionalCouncil;
  state: string;
  specialty: string;
  status: ProfessionalVerificationReviewStatus;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
  evidenceStoragePaths?: string[];
};

export type ProfessionalVerificationAction = {
  id: string;
  verificationId: string;
  userId: string;
  adminId: string;
  action: "approve" | "reject" | "return-to-review";
  previousStatus: ProfessionalVerificationReviewStatus;
  nextStatus: ProfessionalVerificationReviewStatus;
  reason?: string;
  createdAt: string;
};

export type ProfessionalVerificationFilter = "all" | ProfessionalVerificationReviewStatus;

export type AdminMetric = {
  id: string;
  label: string;
  value: number;
  description: string;
};
