import { mockAuthenticatedUser } from "@/data/authenticated-user";
import type {
  CommunityPreview,
  EmotionOption,
  HomeContent,
  HomeProfile,
  HelpRequest,
  Recommendation,
  WeeklyInsight,
} from "@/features/home/types";

const mockUserAvatarUrl = mockAuthenticatedUser.avatarUrl;

export const homeEmotions: EmotionOption[] = [
  { id: "happy", emoji: "😊", label: "Feliz" },
  { id: "tired", emoji: "😴", label: "Cansada" },
  { id: "overloaded", emoji: "🌀", label: "Sobrecarregada" },
  { id: "calm", emoji: "😌", label: "Calma" },
  { id: "melancholic", emoji: "☁️", label: "Melancólica" },
];

export const weeklyInsight: WeeklyInsight = {
  eyebrow: "Insight da semana",
  message:
    "Percebemos que você tem se sentido cansada nos últimos dias. Que tal priorizar 15 minutos de descanso hoje?",
};

export const homeRecommendations: Recommendation[] = [
  {
    id: "emotions",
    title: "Navegando nas emoções",
    description: "Práticas de autocompaixão",
    duration: "10 min",
    imageUrl:
      "https://images.unsplash.com/photo-1543342384-1f1350e27861?auto=format&fit=crop&w=760&q=80",
  },
  {
    id: "stretching",
    title: "Alongamento leve",
    description: "Libere a tensão nas costas e ombros.",
    duration: "15 min",
    imageUrl:
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=760&q=80",
  },
];

export const communityPreview: CommunityPreview = {
  title: "Comunidade: Círculo das Mães",
  topic: 'Conversa atual: "Como conciliar o sono do bebê com o trabalho?".',
  activeMothers: 42,
  avatars: [
    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80",
    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
  ],
};

export const futureMotherEmotions: EmotionOption[] = [
  { id: "hopeful", emoji: "🌷", label: "Esperançosa" },
  { id: "anxious", emoji: "💭", label: "Pensativa" },
  { id: "calm", emoji: "😌", label: "Calma" },
  { id: "curious", emoji: "✨", label: "Curiosa" },
  { id: "sensitive", emoji: "🤍", label: "Sensível" },
];

export const futureMotherInsight: WeeklyInsight = {
  eyebrow: "Insight da semana",
  message:
    "Percebemos que o planejamento tem ocupado bastante espaço nos seus dias. Que tal reservar um momento leve só para cuidar de você hoje?",
};

export const futureMotherRecommendations: Recommendation[] = [
  {
    id: "planning",
    title: "Preparando sua jornada",
    description: "Conteúdos para uma espera mais leve",
    duration: "8 min",
    imageUrl:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=760&q=80",
  },
  {
    id: "breathing",
    title: "Respiração para ansiedade",
    description: "Um exercício simples para desacelerar.",
    duration: "12 min",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=760&q=80",
  },
];

export const futureMotherCommunityPreview: CommunityPreview = {
  title: "Comunidade: Futuras Mães",
  topic: 'Conversa atual: "Como lidar com a ansiedade durante o planejamento?".',
  activeMothers: 31,
  avatars: communityPreview.avatars,
};

export const experiencedMotherHelpRequests: HelpRequest[] = [
  {
    id: "emotional-support",
    title: "Apoio Emocional",
    timeAgo: "Há 10 minutos",
    category: "Mãe de primeira viagem",
    message:
      '"Estou me sentindo muito sobrecarregada hoje e não consigo parar de chorar. Alguém pode conversar comigo?"',
    urgent: true,
  },
  {
    id: "breastfeeding",
    title: "Amamentação",
    timeAgo: "Há 45 minutos",
    category: "Bebê de 2 semanas",
    message:
      '"Meu bebê não está conseguindo pegar o peito direito e sinto muita dor. Preciso de dicas práticas, por favor."',
  },
];

export const experiencedMotherCommunityPreview: CommunityPreview = {
  title: "Comunidade: Círculo das Mães",
  topic: 'Conversa atual: "Como conciliar o sono do bebê com o trabalho?".',
  activeMothers: 42,
  avatars: communityPreview.avatars,
};

export const homeContentByProfile: Record<HomeProfile, HomeContent> = {
  "health-professional": {
    variant: "mentor",
    firstName: "Maria",
    displayName: "Dra. Maria",
    avatarLabel: "Perfil de Dra. Maria",
    avatarUrl: mockUserAvatarUrl,
    titleSuffix: "",
    intro: "Seu conhecimento está fazendo diferença na jornada de muitas mães.",
    badge: "Especialista verificada",
    secondaryLabel: "Pediatra",
    impact: {
      label: "Seu Impacto",
      value: 47,
      description: "Este mês você contribuiu ativamente em 12 discussões críticas.",
    },
    helpRequests: experiencedMotherHelpRequests,
    community: experiencedMotherCommunityPreview,
  },
  "experienced-mother": {
    variant: "mentor",
    firstName: "Maria",
    avatarLabel: "Perfil de Maria",
    avatarUrl: mockUserAvatarUrl,
    titleSuffix: "",
    intro: "Sua experiência está fazendo diferença na jornada de muitas mães.",
    badge: "Mentora da comunidade",
    secondaryLabel: "Mãe experiente",
    impact: {
      label: "Seu Impacto",
      value: 47,
      description: "Este mês você contribuiu ativamente em 12 discussões críticas.",
    },
    helpRequests: experiencedMotherHelpRequests,
    community: experiencedMotherCommunityPreview,
  },
  "future-mother": {
    variant: "wellbeing",
    firstName: "Maria",
    avatarLabel: "Perfil de Maria",
    avatarUrl: mockUserAvatarUrl,
    titleSuffix: "Como você está hoje?",
    intro: "Tire um momento para respirar e reconhecer seus sentimentos agora.",
    emotions: futureMotherEmotions,
    insight: futureMotherInsight,
    recommendations: futureMotherRecommendations,
    community: futureMotherCommunityPreview,
  },
  "recent-mother": {
    variant: "wellbeing",
    firstName: "Maria",
    avatarLabel: "Perfil de Maria",
    avatarUrl: mockUserAvatarUrl,
    titleSuffix: "Como você está hoje?",
    intro: "Tire um momento para respirar e reconhecer seus sentimentos agora.",
    emotions: homeEmotions,
    insight: weeklyInsight,
    recommendations: homeRecommendations,
    community: communityPreview,
  },
};
