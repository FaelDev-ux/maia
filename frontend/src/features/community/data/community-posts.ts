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
    id: "post-apoio-choro-fim-dia",
    authorName: "Mãe da Nina",
    authorRole: "Publicação protegida",
    avatarInitials: "MN",
    timeAgo: "há 5 min",
    category: "apoio",
    categoryLabel: "Preciso de apoio",
    title: "Chorei muito no fim do dia e queria acolhimento",
    message:
      "Hoje senti que tudo ficou pesado de uma vez. Queria ouvir de outras mães como vocês atravessam esses momentos sem se cobrar tanto.",
    tags: ["acolhimento", "puerpério", "cansaço"],
    supportCount: 18,
    repliesCount: 6,
    isAnonymous: true,
  },
  {
    id: "post-apoio-amamentacao-dor",
    authorName: "Luiza",
    authorRole: "Mãe no puerpério",
    avatarInitials: "L",
    timeAgo: "há 16 min",
    category: "apoio",
    categoryLabel: "Preciso de apoio",
    title: "A amamentação está doendo e estou insegura",
    message:
      "Meu bebê mama, mas sinto dor e fico com medo de estar fazendo algo errado. Alguma orientação cuidadosa para observar antes de procurar atendimento?",
    tags: ["amamentação", "orientação", "bebê"],
    supportCount: 22,
    repliesCount: 9,
  },
  {
    id: "post-apoio-banhos-descanso",
    authorName: "Clara",
    authorRole: "Mãe de primeira viagem",
    avatarInitials: "C",
    timeAgo: "há 27 min",
    category: "apoio",
    categoryLabel: "Preciso de apoio",
    title: "Não consigo descansar nem por poucos minutos",
    message:
      "Parece que sempre tem algo para resolver. Queria ideias simples para pedir ajuda sem sentir que estou incomodando.",
    tags: ["descanso", "rede de apoio", "rotina"],
    supportCount: 15,
    repliesCount: 5,
  },
  {
    id: "post-apoio-madrugada-sozinha",
    authorName: "Usuária Maia",
    authorRole: "Publicação protegida",
    avatarInitials: "UM",
    timeAgo: "há 41 min",
    category: "apoio",
    categoryLabel: "Preciso de apoio",
    title: "As madrugadas sozinha têm mexido comigo",
    message:
      "Quando todos dormem, sinto uma solidão grande. Queria conversar com alguém que entenda essa fase.",
    tags: ["madrugada", "solidão", "apoio"],
    supportCount: 29,
    repliesCount: 11,
    isAnonymous: true,
  },
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
