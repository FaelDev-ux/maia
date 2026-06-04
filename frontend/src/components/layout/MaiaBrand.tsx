import Image from "next/image";
import logoMaia from "@/../public/images/logo-maia.png";
import cn from "@/lib/utils";

type MaiaBrandProps = {
  className?: string;
  imageClassName?: string;
  imageSize?: number;
  priority?: boolean;
  textClassName?: string;
};

export function MaiaBrand({
  className,
  imageClassName,
  imageSize = 58,
  priority = true,
  textClassName,
}: MaiaBrandProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <Image
        alt=""
        className={cn("size-14 object-contain", imageClassName)}
        height={imageSize}
        priority={priority}
        src={logoMaia}
        width={imageSize}
      />
      <span className={cn("maia-brand-text font-title text-3xl font-extrabold", textClassName)}>
        Maia
      </span>
    </span>
  );
}
