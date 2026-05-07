import cn from "@/lib/utils";
import { Baby, Heart, UserStar, BriefcaseMedical } from "lucide-react";

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
    <div
      className="w-full cursor-pointer bg-white flex items-center justify-between rounded-[40px] px-4 py-4 border-2 border-gray-50 shadow-primary"
      onClick={onClick}
    >
      <div
        className="size-14 shrink-0 rounded-full flex items-center justify-center"
        style={{ backgroundColor: color + "44", color: color }}
      >
        {icons[icon]}
      </div>

      <div className="flex flex-col w-full items-left ml-6">
        <h2 className="font-title text-title text-lg text-left">{title}</h2>
        <p className="font-text text-text text-sm">{text}</p>
      </div>

      <div
        className={cn("border-surface border-2 rounded-full", {
          "border-primary": selected,
        })}
      >
        <div
          className={cn("size-5 rounded-full shrink-0 border-2 border-white", {
            "bg-primary": selected,
          })}
        />
      </div>
    </div>
  );
}
