type SlideIndicatorsProps = {
  activeIndex: number;
  total: number;
  onChange: (index: number) => void;
};

export function SlideIndicators({ activeIndex, total, onChange }: SlideIndicatorsProps) {
  return (
    <div className="flex items-center justify-center gap-2" aria-label="Slides do onboarding">
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === activeIndex;

        return (
          <button
            aria-current={isActive ? "step" : undefined}
            aria-label={`Ir para o slide ${index + 1} de ${total}`}
            className={`h-2 rounded-full transition-all duration-300 ${
              isActive ? "w-7 bg-primary" : "w-2 bg-neutral hover:bg-primary/40"
            }`}
            key={index}
            onClick={() => onChange(index)}
            type="button"
          />
        );
      })}
    </div>
  );
}