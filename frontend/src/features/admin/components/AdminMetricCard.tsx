import type { AdminMetric } from "@/features/admin/types";

type AdminMetricCardProps = {
  metric: AdminMetric;
};

export function AdminMetricCard({ metric }: AdminMetricCardProps) {
  return (
    <article className="rounded-[1.8rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
      <p className="text-sm font-bold text-text">{metric.label}</p>
      <strong className="mt-3 block font-title text-[2.4rem] font-extrabold leading-none text-title">
        {metric.value}
      </strong>
      <p className="mt-3 text-sm leading-6 text-text">{metric.description}</p>
    </article>
  );
}
