import { Baby, Heart, UserStar, BriefcaseMedical } from "lucide-react";
import cn from "@/lib/utils";

type OptionCardProps = {
  icon: "baby" | "heart" | "userStar" | "medic";
  color: string;
  title: string;
  text: string;
  selected?: boolean;
  onClick: () => void;
};

const icons = {
  baby: <Baby size={25} />,
  heart: <Heart size={25} />,
  userStar: <UserStar size={25} />,
  medic: <BriefcaseMedical size={25} />,
};

export default function OptionCard({
  icon,
  color,
  title,
  text,
  selected = false,
  onClick,
}: OptionCardProps) {
  return (
    <button
      className={cn(
        "group flex min-h-23 w-full cursor-pointer items-center justify-between rounded-[2rem] border-2 bg-white px-4 py-4 text-left shadow-[0_18px_48px_rgba(140,64,84,0.08)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_56px_rgba(140,64,84,0.12)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:min-h-25 sm:px-5",
        selected ? "border-primary/55 bg-primary/[0.03]" : "border-white"
      )}
      onClick={onClick}
      type="button"
    >
      <div
        className="flex size-13 shrink-0 items-center justify-center rounded-full transition group-hover:scale-105 sm:size-14"
        style={{ backgroundColor: color + "44", color: color }}
      >
        {icons[icon]}
      </div>

      <div className="ml-4 flex min-w-0 flex-1 flex-col items-start pr-3 sm:ml-5">
        <h2 className="font-title text-base font-extrabold leading-5 text-title sm:text-lg">
          {title}
        </h2>
        <p className="mt-1 text-sm leading-5 text-text">{text}</p>
      </div>

      <div
        className={cn(
          "ml-2 grid size-7 shrink-0 place-items-center rounded-full border-2 border-surface bg-white transition",
          selected && "border-primary"
        )}
      >
        <div
          className={cn("size-4 shrink-0 rounded-full border-2 border-white transition", {
            "bg-primary": selected,
          })}
        />
      </div>
    </button>
  );
}
