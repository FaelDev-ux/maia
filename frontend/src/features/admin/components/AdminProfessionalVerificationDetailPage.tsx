"use client";

import { useMemo, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import Link from "next/link";
import cn from "@/lib/utils";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ProfessionalStatusBadge } from "@/features/admin/components/ProfessionalStatusBadge";
import {
  professionalVerificationStatusLabels,
  professionalVerificationStatusDescriptions,
  updateProfessionalVerificationStatus,
} from "@/features/admin/data/professional-verifications";
import { useProfessionalVerifications } from "@/features/admin/hooks/useProfessionalVerifications";
import type {
  ProfessionalVerification,
  ProfessionalVerificationReviewStatus,
} from "@/features/admin/types";
import { formatAdminDateTime } from "@/features/admin/utils";

type AdminProfessionalVerificationDetailPageProps = {
  verificationId: string;
};

type FeedbackState = {
  tone: "success" | "warning" | "danger";
  message: string;
};

const statusOptions = [
  {
    id: "pending",
    label: professionalVerificationStatusLabels.pending,
  },
  {
    id: "verified",
    label: professionalVerificationStatusLabels.verified,
  },
  {
    id: "rejected",
    label: professionalVerificationStatusLabels.rejected,
  },
] as const satisfies Array<{
  id: ProfessionalVerificationReviewStatus;
  label: string;
}>;

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Mail;
  label: string;
  value: string;
}) {
  return (
    <div className="flex gap-3 rounded-[1.35rem] bg-background px-4 py-4 ring-1 ring-border/70">
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        <Icon aria-hidden size={18} strokeWidth={2.3} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs font-extrabold uppercase tracking-[0.12em] text-text/70">
          {label}
        </dt>
        <dd className="mt-1 break-words text-sm font-bold leading-6 text-title">{value}</dd>
      </div>
    </div>
  );
}

function getFeedbackClassName(tone: FeedbackState["tone"]) {
  if (tone === "success") {
    return "bg-success/[0.12] text-emerald-800 ring-success/25";
  }

  if (tone === "danger") {
    return "bg-danger/[0.12] text-red-800 ring-danger/25";
  }

  return "bg-warning/[0.15] text-amber-800 ring-warning/30";
}

function NotFoundState() {
  return (
    <AdminShell
      description="A solicitação pode ter sido removida do armazenamento local ou ainda não foi criada."
      eyebrow="Verificação profissional"
      title="Solicitação não encontrada"
    >
      <div className="rounded-[2rem] bg-white px-6 py-8 text-center shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
        <div className="mx-auto grid size-14 place-items-center rounded-full bg-primary/10 text-primary">
          <FileText aria-hidden size={25} strokeWidth={2.3} />
        </div>
        <h2 className="mt-4 font-title text-xl font-extrabold text-title">
          Não encontramos essa análise
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text">
          Volte para a lista de profissionais para selecionar uma solicitação disponível.
        </p>
        <Link
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          href="/admin/profissionais"
        >
          <ArrowLeft aria-hidden size={18} strokeWidth={2.4} />
          Voltar para profissionais
        </Link>
      </div>
    </AdminShell>
  );
}

export function AdminProfessionalVerificationDetailPage({
  verificationId,
}: AdminProfessionalVerificationDetailPageProps) {
  const verifications = useProfessionalVerifications();
  const verification = useMemo<ProfessionalVerification | undefined>(
    () => verifications.find((currentVerification) => currentVerification.id === verificationId),
    [verificationId, verifications]
  );

  if (!verification) {
    return <NotFoundState />;
  }

  return (
    <AdminShell
      description="Confira os dados enviados e registre uma decisão de validação para liberar ou devolver a solicitação."
      eyebrow="Análise profissional"
      title={verification.fullName}
    >
      <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]" aria-label="Detalhes da solicitação">
        <article className="rounded-[2rem] bg-white px-5 py-6 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 md:px-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-extrabold text-primary">Status atual</p>
              <h2 className="mt-2 font-title text-[1.55rem] font-extrabold text-title">
                {verification.specialty}
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-6 text-text">
                {professionalVerificationStatusDescriptions[verification.status]}
              </p>
            </div>
            <ProfessionalStatusBadge status={verification.status} />
          </div>

          <dl className="mt-6 grid gap-3 md:grid-cols-2">
            <DetailRow icon={Mail} label="E-mail" value={verification.email} />
            <DetailRow icon={Phone} label="Telefone" value={verification.phone} />
            <DetailRow
              icon={Stethoscope}
              label="Registro"
              value={`${verification.council} · ${verification.registrationNumber}`}
            />
            <DetailRow
              icon={MapPin}
              label="Estado"
              value={`${verification.state} · ${verification.specialty}`}
            />
            <DetailRow
              icon={FileText}
              label="Enviado em"
              value={formatAdminDateTime(verification.submittedAt)}
            />
            <DetailRow
              icon={ShieldCheck}
              label="Revisado em"
              value={formatAdminDateTime(verification.reviewedAt)}
            />
          </dl>

          {verification.rejectionReason ? (
            <div className="mt-6 rounded-[1.55rem] bg-danger/[0.12] px-4 py-4 text-red-800 ring-1 ring-danger/25">
              <h3 className="font-title text-base font-extrabold">Motivo da rejeição</h3>
              <p className="mt-2 text-sm leading-6">{verification.rejectionReason}</p>
            </div>
          ) : null}
        </article>

        <ProfessionalVerificationDecisionPanel
          key={verification.id}
          verification={verification}
          verificationId={verificationId}
        />
      </section>
    </AdminShell>
  );
}

function ProfessionalVerificationDecisionPanel({
  verification,
  verificationId,
}: {
  verification: ProfessionalVerification;
  verificationId: string;
}) {
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<ProfessionalVerificationReviewStatus>(
    verification.status
  );
  const [rejectionReason, setRejectionReason] = useState(verification.rejectionReason ?? "");

  function updateVerification() {
    if (selectedStatus === "rejected" && rejectionReason.trim().length < 8) {
      setFeedback({
        tone: "danger",
        message: "Informe uma justificativa com pelo menos 8 caracteres para rejeitar.",
      });
      return;
    }

    const updatedVerification = updateProfessionalVerificationStatus({
      rejectionReason: selectedStatus === "rejected" ? rejectionReason : undefined,
      status: selectedStatus,
      verificationId,
    });

    if (!updatedVerification) {
      setFeedback({
        tone: "danger",
        message: "Não foi possível atualizar essa solicitação localmente.",
      });
      return;
    }

    if (selectedStatus === "verified") {
      setFeedback({
        tone: "success",
        message: "Profissional verificada. O status do usuário local foi atualizado quando aplicável.",
      });
      return;
    }

    if (selectedStatus === "rejected") {
      setFeedback({
        tone: "danger",
        message: "Solicitação rejeitada e registrada no histórico local.",
      });
      return;
    }

    setFeedback({
      tone: "warning",
      message: "Solicitação devolvida para análise.",
    });
  }

  function selectVerificationStatus(nextStatus: ProfessionalVerificationReviewStatus) {
    setSelectedStatus(nextStatus);
    setFeedback(null);

    if (nextStatus !== "rejected") {
      setRejectionReason("");
    }
  }

  return (
    <aside className="rounded-[2rem] bg-white px-5 py-6 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 md:px-6">
          <h2 className="font-title text-xl font-extrabold text-title">Decisão</h2>
          <p className="mt-2 text-sm leading-6 text-text">
            A decisão atualiza o status da profissional e mantém um histórico administrativo.
          </p>

          {feedback ? (
            <div
              className={`mt-5 rounded-[1.35rem] px-4 py-4 text-sm font-bold leading-6 ring-1 ${getFeedbackClassName(
                feedback.tone
              )}`}
            >
              {feedback.message}
            </div>
          ) : null}

          <div className="mt-6">
            <p className="text-sm font-extrabold text-title">Alterar status do profissional</p>
            <div className="mt-3 grid gap-2">
              {statusOptions.map((statusOption) => {
                const isActive = selectedStatus === statusOption.id;

                return (
                  <button
                    className={cn(
                      "min-h-12 rounded-full px-4 py-3 text-sm font-extrabold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isActive
                        ? "bg-primary/[0.12] text-primary ring-primary/35"
                        : "bg-background text-text ring-border/80 hover:bg-primary/10 hover:text-primary"
                    )}
                    key={statusOption.id}
                    onClick={() => selectVerificationStatus(statusOption.id)}
                    type="button"
                  >
                    {statusOption.label}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedStatus === "rejected" ? (
            <div className="mt-6">
              <label className="text-sm font-extrabold text-title" htmlFor="rejection-reason">
                Justificativa para rejeição
              </label>
              <textarea
                className="mt-3 min-h-[7.5rem] w-full resize-none rounded-[1.35rem] bg-background px-4 py-4 text-sm leading-6 text-title outline-none ring-1 ring-border/80 transition placeholder:text-text/55 focus:ring-2 focus:ring-primary"
                id="rejection-reason"
                maxLength={220}
                onChange={(event) => setRejectionReason(event.target.value)}
                placeholder="Ex.: registro informado não confere com a evidência enviada."
                value={rejectionReason}
              />
              <span className="mt-3 block text-xs font-bold text-text/70">
                {rejectionReason.length}/220
              </span>
            </div>
          ) : null}

          <button
            className="mt-6 inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
            disabled={
              selectedStatus === verification.status &&
              (selectedStatus !== "rejected" ||
                rejectionReason.trim() === (verification.rejectionReason ?? ""))
            }
            onClick={updateVerification}
            type="button"
          >
            <RefreshCw aria-hidden size={19} strokeWidth={2.4} />
            Atualizar
          </button>
    </aside>
  );
}
