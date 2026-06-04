import cn from "@/lib/utils";
import { professionalVerificationStatusLabels } from "@/features/admin/data/professional-verifications";
import type { ProfessionalVerificationReviewStatus } from "@/features/admin/types";
import { getStatusTone } from "@/features/admin/utils";

type ProfessionalStatusBadgeProps = {
  status: ProfessionalVerificationReviewStatus;
};

export function ProfessionalStatusBadge({ status }: ProfessionalStatusBadgeProps) {
  const tone = getStatusTone(status);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-extrabold ring-1",
        tone.className
      )}
    >
      <span className={cn("size-2 rounded-full", tone.dotClassName)} />
      {professionalVerificationStatusLabels[status]}
    </span>
  );
}
