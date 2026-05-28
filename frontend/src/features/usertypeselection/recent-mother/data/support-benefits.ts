import { BookOpen, Heart, UsersRound } from "lucide-react";
import type { RecentMotherSupportBenefit } from "../types";

export const supportBenefits: RecentMotherSupportBenefit[] = [
  {
    description: "Estamos prontos para te escutar e ajudar",
    icon: Heart,
    title: "Apoio emocional",
  },
  {
    description: "Com base no seu caso",
    icon: BookOpen,
    title: "Conteúdos exclusivos",
  },
  {
    description: "Conecte-se com outras mães e profissionais capacitados",
    icon: UsersRound,
    title: "Comunidade acolhedora",
  },
];
