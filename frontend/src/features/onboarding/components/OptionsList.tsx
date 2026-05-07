import OptionCard from "@/features/onboarding/components/OptionCard";
import { useState } from "react";

export default function OptionsList() {
  const [selected, setSelected] = useState(1);

  return (
    <main className="flex flex-col justify-center gap-5">
      <OptionCard
        icon="baby"
        color="#F48CA5"
        title="Sou mãe recente"
        text="Nos primeiros dias"
        selected={selected === 1}
        onClick={() => setSelected(1)}
      />
      <OptionCard
        icon="heart"
        color="#704CA8"
        title="Desejo ser mãe"
        text="Tentando ou planejando"
        selected={selected === 2}
        onClick={() => setSelected(2)}
      />
      <OptionCard
        icon="userStar"
        color="#894686"
        title="Já sou mãe a mais tempo"
        text="Quero ajudar outras mães"
        selected={selected === 3}
        onClick={() => setSelected(3)}
      />
      <OptionCard
        icon="medic"
        color="#00B62E"
        title="Sou profissional da saúde"
        text="Trabalho com saúde materna"
        selected={selected === 4}
        onClick={() => setSelected(4)}
      />
    </main>

    
  );
}
