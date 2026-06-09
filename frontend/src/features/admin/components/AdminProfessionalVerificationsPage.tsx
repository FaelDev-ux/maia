"use client";

import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import cn from "@/lib/utils";
import { AdminShell } from "@/features/admin/components/AdminShell";
import { ProfessionalVerificationCard } from "@/features/admin/components/ProfessionalVerificationCard";
import {
  professionalVerificationStatusLabels,
} from "@/features/admin/data/professional-verifications";
import { useProfessionalVerifications } from "@/features/admin/hooks/useProfessionalVerifications";
import type { ProfessionalVerificationFilter } from "@/features/admin/types";
import {
  getVerificationSearchText,
  normalizeAdminSearch,
} from "@/features/admin/utils";

const verificationFilters = [
  {
    id: "all",
    label: "Todas",
  },
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
  id: ProfessionalVerificationFilter;
  label: string;
}>;

export function AdminProfessionalVerificationsPage() {
  const [activeFilter, setActiveFilter] = useState<ProfessionalVerificationFilter>("all");
  const [search, setSearch] = useState("");
  const { error, isLoading, verifications } = useProfessionalVerifications();
  const normalizedSearch = normalizeAdminSearch(search);
  const filteredVerifications = useMemo(
    () =>
      verifications.filter((verification) => {
        const matchesStatus = activeFilter === "all" || verification.status === activeFilter;
        const matchesSearch =
          normalizedSearch.length === 0 ||
          getVerificationSearchText(verification).includes(normalizedSearch);

        return matchesStatus && matchesSearch;
      }),
    [activeFilter, normalizedSearch, verifications]
  );

  return (
    <AdminShell
      description="Revise dados de registro, evidências e status das profissionais antes de liberar a participação como especialista verificada."
      eyebrow="Verificação profissional"
      title="Profissionais"
    >
      <section aria-label="Filtros de profissionais">
        <div className="rounded-[2rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
          <label className="block text-sm font-extrabold text-title" htmlFor="admin-search">
            Buscar profissional
          </label>
          <div className="mt-3 flex h-14 items-center gap-3 rounded-full bg-background px-4 ring-1 ring-border/80 focus-within:ring-2 focus-within:ring-primary">
            <Search aria-hidden className="shrink-0 text-primary" size={20} strokeWidth={2.3} />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-title outline-none placeholder:text-text/55"
              id="admin-search"
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Nome, UF, registro ou especialidade"
              type="search"
              value={search}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-center gap-2 text-sm font-extrabold text-title">
              <SlidersHorizontal aria-hidden size={18} strokeWidth={2.3} />
              Status
            </div>
            <div className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 py-2">
              {verificationFilters.map((filter) => {
                const isActive = activeFilter === filter.id;

                return (
                  <button
                    className={cn(
                      "h-11 shrink-0 rounded-full px-4 text-sm font-extrabold ring-1 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isActive
                        ? "bg-primary text-white ring-primary hover:bg-primary-hover"
                        : "bg-background text-text ring-border/80 hover:bg-primary/10 hover:text-primary"
                    )}
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    type="button"
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-7" aria-labelledby="professional-verifications-title">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2
              className="font-title text-[1.45rem] font-extrabold text-title"
              id="professional-verifications-title"
            >
              Solicitações
            </h2>
            <p className="mt-1 text-sm leading-6 text-text">
              {filteredVerifications.length} resultado
              {filteredVerifications.length === 1 ? "" : "s"} encontrado
              {filteredVerifications.length === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-4">
          {isLoading ? (
            <div className="rounded-[1.9rem] bg-white px-6 py-8 text-center shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
              <h3 className="font-title text-lg font-extrabold text-title">
                Carregando solicitações
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text">
                Buscando profissionais pendentes no backend.
              </p>
            </div>
          ) : error ? (
            <div className="rounded-[1.9rem] bg-primary/10 px-6 py-6 text-sm font-bold leading-6 text-primary">
              {error}
            </div>
          ) : filteredVerifications.length > 0 ? (
            filteredVerifications.map((verification) => (
              <ProfessionalVerificationCard key={verification.id} verification={verification} />
            ))
          ) : (
            <div className="rounded-[1.9rem] bg-white px-6 py-8 text-center shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
              <h3 className="font-title text-lg font-extrabold text-title">
                Nenhuma solicitação encontrada
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-text">
                Ajuste a busca ou altere o filtro de status para ver outras profissionais.
              </p>
            </div>
          )}
        </div>
      </section>
    </AdminShell>
  );
}
