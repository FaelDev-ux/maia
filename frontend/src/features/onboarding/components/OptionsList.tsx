import OptionCard from "@/features/onboarding/components/OptionCard";

export type UserTypeOption =
  | "recent-mother"
  | "future-mother"
  | "experienced-mother"
  | "health-professional";

type OptionsListProps = {
  selected: UserTypeOption;
  onSelect: (option: UserTypeOption) => void;
};

export default function OptionsList({ selected, onSelect }: OptionsListProps) {
  return (
    <div className="flex w-full flex-col justify-center gap-4 sm:gap-5">
      <OptionCard
        icon="baby"
        color="#F48CA5"
        title="Sou mãe recente"
        text="Nos primeiros dias"
        selected={selected === "recent-mother"}
        onClick={() => onSelect("recent-mother")}
      />
      <OptionCard
        icon="heart"
        color="#704CA8"
        title="Desejo ser mãe"
        text="Tentando ou planejando"
        selected={selected === "future-mother"}
        onClick={() => onSelect("future-mother")}
      />
      <OptionCard
        icon="userStar"
        color="#894686"
        title="Já sou mãe a mais tempo"
        text="Quero ajudar outras mães"
        selected={selected === "experienced-mother"}
        onClick={() => onSelect("experienced-mother")}
      />
      <OptionCard
        icon="medic"
        color="#00B62E"
        title="Sou profissional da saúde"
        text="Trabalho com saúde materna"
        selected={selected === "health-professional"}
        onClick={() => onSelect("health-professional")}
      />
    </div>
  );
}
