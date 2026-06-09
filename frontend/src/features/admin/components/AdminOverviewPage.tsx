"use client";

import { ClipboardCheck, History, RotateCcw } from "lucide-react";
import { AdminMetricCard } from "@/features/admin/components/AdminMetricCard";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ProfessionalStatusBadge } from "@/features/admin/components/ProfessionalStatusBadge";
import { ProfessionalVerificationCard } from "@/features/admin/components/ProfessionalVerificationCard";
import {
  getProfessionalVerificationMetrics,
  professionalVerificationStatusLabels,
} from "@/features/admin/data/professional-verifications";
import {
  useProfessionalVerificationActions,
  useProfessionalVerifications,
} from "@/features/admin/hooks/useProfessionalVerifications";
import { useAdminCommunityPosts } from "@/features/admin/hooks/useAdminCommunityPosts";
import { formatAdminDateTime } from "@/features/admin/utils";

export function AdminOverviewPage() {
  const { error: verificationsError, verifications } = useProfessionalVerifications();
  const actions = useProfessionalVerificationActions();
  const { posts: communityPosts } = useAdminCommunityPosts();
  const metrics = getProfessionalVerificationMetrics(verifications);
  const overviewMetrics = [
    ...metrics,
    {
      id: "community-posts",
      label: "Posts ativos",
      value: communityPosts.length,
      description: "Publicações disponíveis para revisão no controle da comunidade.",
    },
  ];
  const pendingVerifications = verifications
    .filter((verification) => verification.status === "pending")
    .slice(0, 3);

  return (
    <AdminShell
      description="Acompanhe a fila de validação profissional, revise documentos e controle os posts da comunidade para manter uma experiência segura."
      title="Administração"
    >
      <section aria-label="Indicadores de verificação profissional">
        {verificationsError ? (
          <p className="mb-4 rounded-[1.35rem] bg-primary/10 px-4 py-3 text-sm font-bold leading-6 text-primary">
            {verificationsError}
          </p>
        ) : null}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {overviewMetrics.map((metric) => (
            <AdminMetricCard key={metric.id} metric={metric} />
          ))}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="pending-verifications-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              Fila principal
            </p>
            <h2
              className="mt-4 font-title text-[1.55rem] font-extrabold text-title"
              id="pending-verifications-title"
            >
              Verificações pendentes
            </h2>
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {pendingVerifications.length > 0 ? (
            pendingVerifications.map((verification) => (
              <ProfessionalVerificationCard key={verification.id} verification={verification} />
            ))
          ) : (
            <div className="rounded-[1.8rem] bg-white px-6 py-7 text-center shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 lg:col-span-3">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-success/[0.12] text-emerald-700">
                <ClipboardCheck aria-hidden size={24} strokeWidth={2.3} />
              </div>
              <h3 className="mt-4 font-title text-lg font-extrabold text-title">
                Nenhuma solicitação pendente
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text">
                A fila está em dia. Novas profissionais aparecerão aqui quando enviarem seus dados
                de registro.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-8" aria-labelledby="admin-activity-title">
        <div className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-full bg-secondary/10 text-secondary">
            <History aria-hidden size={21} strokeWidth={2.3} />
          </span>
          <div>
            <h2 className="font-title text-xl font-extrabold text-title" id="admin-activity-title">
              Atividade recente
            </h2>
            <p className="mt-1 text-sm leading-6 text-text">Últimas decisões administrativas.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-3">
          {actions.length > 0 ? (
            actions.slice(0, 4).map((action) => (
              <article
                className="flex items-start gap-4 rounded-[1.55rem] bg-white px-5 py-4 shadow-[0_12px_30px_rgb(140_64_84_/_0.07)] ring-1 ring-border/65"
                key={action.id}
              >
                <span className="mt-1 grid size-10 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                  <RotateCcw aria-hidden size={18} strokeWidth={2.3} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-title text-base font-extrabold text-title">
                      {professionalVerificationStatusLabels[action.previousStatus]} para{" "}
                      {professionalVerificationStatusLabels[action.nextStatus]}
                    </p>
                    <ProfessionalStatusBadge status={action.nextStatus} />
                  </div>
                  <p className="mt-1 text-sm leading-6 text-text">
                    {formatAdminDateTime(action.createdAt)}
                    {action.reason ? ` · ${action.reason}` : ""}
                  </p>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[1.7rem] bg-white px-6 py-7 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
              <h3 className="font-title text-lg font-extrabold text-title">
                Nenhuma decisão registrada
              </h3>
              <p className="mt-2 text-sm leading-6 text-text">
                Quando o backend expuser o histórico administrativo, ele aparecerá aqui.
              </p>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
