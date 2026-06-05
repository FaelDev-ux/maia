import type { CommunityPostCategory } from "@/features/community/types";
import type { HomeProfile } from "@/features/home/types";

export type CommunityComposerCopy = {
  buttonLabel: string;
  defaultCategory: CommunityPostCategory;
  description: string;
  eyebrow: string;
  messagePlaceholder: string;
  pageEyebrow: string;
  submitLabel: string;
  title: string;
  titlePlaceholder: string;
};

export function getCommunityComposerCopy(profile: HomeProfile): CommunityComposerCopy {
  if (profile === "health-professional") {
    return {
      buttonLabel: "Compartilhar orientação",
      defaultCategory: "profissional",
      description:
        "Publique uma orientação geral, segura e acolhedora para ajudar mães e famílias sem substituir atendimento individual.",
      eyebrow: "Oriente com cuidado",
      messagePlaceholder:
        "Compartilhe uma orientação geral e cuidadosa. Evite diagnósticos e incentive busca de atendimento quando fizer sentido.",
      pageEyebrow: "Orientação profissional",
      submitLabel: "Publicar orientação",
      title: "Tem uma orientação que pode apoiar alguém?",
      titlePlaceholder: "Qual orientação pode ajudar a comunidade?",
    };
  }

  if (profile === "experienced-mother") {
    return {
      buttonLabel: "Compartilhar apoio",
      defaultCategory: "rede",
      description:
        "Compartilhe uma vivência, uma ideia simples ou uma palavra de acolhimento para quem está atravessando uma fase parecida.",
      eyebrow: "Apoie com experiência",
      messagePlaceholder:
        "Conte uma experiência, uma frase de acolhimento ou um cuidado simples que pode ajudar outra mãe.",
      pageEyebrow: "Apoio da mentora",
      submitLabel: "Publicar apoio",
      title: "Pensou em algo que pode acolher alguém?",
      titlePlaceholder: "Que apoio você quer compartilhar?",
    };
  }

  return {
    buttonLabel: "Criar publicação",
    defaultCategory: "apoio",
    description:
      "Publique uma dúvida, pedido de apoio ou experiência. Você pode preservar sua identidade quando preferir.",
    eyebrow: "Compartilhe com cuidado",
    messagePlaceholder:
      "Escreva com calma. Você pode pedir apoio, dividir uma experiência ou abrir uma conversa.",
    pageEyebrow: "Nova publicação",
    submitLabel: "Publicar",
    title: "Quer dividir o que está vivendo hoje?",
    titlePlaceholder: "O que você quer compartilhar?",
  };
}

export function getCommunityAuthorRole(profile: HomeProfile) {
  if (profile === "health-professional") {
    return "Profissional de saúde";
  }

  if (profile === "experienced-mother") {
    return "Mãe mentora";
  }

  if (profile === "future-mother") {
    return "Futura mãe";
  }

  return "Mãe no puerpério";
}
