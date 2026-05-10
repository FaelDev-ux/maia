import cn from "@/lib/utils";

type ProgressBarProps = {
  className?: string;
  value: number;
  max?: number;
};

export default function ProgressBar({ value = 0, className, max = 100 }: ProgressBarProps) {
  const percentage = (Math.min(Math.max(value, 0), max) / max) * 100;
  return (
    <div
      aria-valuemax={max}
      aria-valuemin={0}
      aria-valuenow={value}
      className={cn("relative h-2 w-full overflow-hidden rounded-full bg-neutral", className)}
      role="progressbar"
    >
      <div
        className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}
