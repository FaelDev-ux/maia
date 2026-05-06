import { ArrowLeft } from "lucide-react";
import ProgressBar from "@/components/ui/ProgressBar";

type HeaderOnboardingProps = {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
};

export default function HeaderOnboarding({
  currentStep,
  totalSteps,
  onBack,
}: HeaderOnboardingProps) {
  return (
    <header className="w-full flex items-center gap-4">
      <button
        type="button"
        className="bg-surface/20 size-10 rounded-full flex items-center justify-center transition hover:bg-primary/10"
        onClick={onBack}
      >
        <ArrowLeft size={20} className="text-primary" />
      </button>
      <ProgressBar className="flex-1" value={currentStep} max={totalSteps} />
    </header>
  );
}
