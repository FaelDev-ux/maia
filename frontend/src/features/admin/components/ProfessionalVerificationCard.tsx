import { CalendarClock, ChevronRight, FileCheck2, MapPin, Stethoscope } from "lucide-react";
import Link from "next/link";
import { ProfessionalStatusBadge } from "@/features/admin/components/ProfessionalStatusBadge";
import type { ProfessionalVerification } from "@/features/admin/types";
import { formatAdminDateTime } from "@/features/admin/utils";

type ProfessionalVerificationCardProps = {
  verification: ProfessionalVerification;
};

export function ProfessionalVerificationCard({ verification }: ProfessionalVerificationCardProps) {
  return (
    <Link
      className="group block rounded-[1.85rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
      href={`/admin/profissionais/${verification.id}`}
    >
      <article className="flex gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <FileCheck2 aria-hidden size={22} strokeWidth={2.3} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="truncate font-title text-lg font-extrabold text-title">
                {verification.fullName}
              </h2>
              <p className="mt-1 text-sm leading-6 text-text">{verification.email}</p>
            </div>
            <ProfessionalStatusBadge status={verification.status} />
          </div>

          <dl className="mt-4 grid gap-3 text-sm leading-6 text-text md:grid-cols-2">
            <div className="flex min-w-0 items-center gap-2">
              <Stethoscope aria-hidden className="shrink-0 text-primary" size={17} />
              <span className="truncate">
                {verification.council} · {verification.registrationNumber}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2">
              <MapPin aria-hidden className="shrink-0 text-primary" size={17} />
              <span className="truncate">
                {verification.state} · {verification.specialty}
              </span>
            </div>
            <div className="flex min-w-0 items-center gap-2 md:col-span-2">
              <CalendarClock aria-hidden className="shrink-0 text-primary" size={17} />
              <span className="truncate">Enviado em {formatAdminDateTime(verification.submittedAt)}</span>
            </div>
          </dl>
        </div>

        <ChevronRight
          aria-hidden
          className="mt-1 shrink-0 text-text/45 transition group-hover:translate-x-0.5 group-hover:text-primary"
          size={21}
          strokeWidth={2.4}
        />
      </article>
    </Link>
  );
}
