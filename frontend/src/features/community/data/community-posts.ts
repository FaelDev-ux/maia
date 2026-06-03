import type { CommunityFilter, CommunityPost } from "@/features/community/types";

export const communityFilters: CommunityFilter[] = [
  {
    id: "all",
    label: "Todos",
    active: true,
  },
  {
    id: "support",
    label: "Preciso de apoio",
  },
  {
    id: "sleep",
    label: "Sono",
  },
  {
    id: "network",
    label: "Rede de apoio",
  },
];

export const communityPosts: CommunityPost[] = [
  {
    id: "post-sono-madrugada",
    authorName: "Ana Paula",
    authorRole: "Mãe no puerpério",
    avatarInitials: "AP",
    timeAgo: "há 12 min",
    category: "sono",
    categoryLabel: "Sono e rotina",
    title: "As madrugadas têm sido mais difíceis por aqui",
    message:
      "Hoje senti que cheguei no meu limite de cansaço. Meu bebê acordou muitas vezes e eu só queria ouvir de outras mães o que ajuda vocês a atravessar essas noites.",
    tags: ["sono", "acolhimento", "rotina"],
    supportCount: 24,
    repliesCount: 8,
    highlightedReply: {
      authorName: "Marina",
      authorRole: "Mentora Maia",
      message:
        "Você não precisa dar conta de tudo sozinha. Se possível, combine pequenos turnos de descanso com alguém da sua rede hoje.",
    },
  },
  {
    id: "post-rede-apoio",
    authorName: "Mãe da Lia",
    authorRole: "Publicação protegida",
    avatarInitials: "ML",
    timeAgo: "há 38 min",
    category: "rede",
    categoryLabel: "Rede de apoio",
    title: "Como pedir ajuda sem me sentir culpada?",
    message:
      "Tenho pessoas por perto, mas travo na hora de pedir ajuda. Queria ideias de pedidos simples, como preparar uma refeição ou ficar com o bebê por alguns minutos.",
    tags: ["apoio", "culpa", "família"],
    supportCount: 31,
    repliesCount: 12,
    isAnonymous: true,
  },
  {
    id: "post-respirar",
    authorName: "Dra. Camila Reis",
    authorRole: "Psicóloga verificada",
    avatarInitials: "CR",
    timeAgo: "há 1 h",
    category: "profissional",
    categoryLabel: "Orientação cuidadosa",
    title: "Uma pausa de 2 minutos para dias intensos",
    message:
      "Quando a rotina parecer grande demais, experimente apoiar os pés no chão, soltar os ombros e respirar contando quatro tempos. É um cuidado breve, não uma cobrança.",
    tags: ["respiração", "autocuidado", "orientação"],
    supportCount: 46,
    repliesCount: 15,
  },
];
