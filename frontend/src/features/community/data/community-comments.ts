import type { CommunityComment } from "@/features/community/types";

export const communityComments: CommunityComment[] = [
  {
    id: "comment-sono-1",
    postId: "post-sono-madrugada",
    authorName: "Beatriz",
    authorRole: "Mãe mentora",
    avatarInitials: "B",
    message:
      "Aqui ajudou combinar uma pausa pequena pela manhã, mesmo que fosse só para tomar banho sem pressa.",
    timeAgo: "há 8 min",
    helpfulCount: 9,
    notHelpfulCount: 1,
  },
  {
    id: "comment-sono-2",
    postId: "post-sono-madrugada",
    authorName: "Julia",
    authorRole: "Mãe no puerpério",
    avatarInitials: "J",
    message:
      "Também estou nessa fase. Hoje pedi para deixarem uma garrafa de água e um lanche perto da cama.",
    timeAgo: "há 3 min",
    helpfulCount: 5,
    notHelpfulCount: 0,
  },
  {
    id: "comment-rede-1",
    postId: "post-rede-apoio",
    authorName: "Usuária",
    authorRole: "Publicação protegida",
    avatarInitials: "U",
    message:
      "Uma frase pronta me ajudou: você consegue ficar 20 minutos com o bebê enquanto eu descanso?",
    timeAgo: "há 15 min",
    helpfulCount: 3,
    notHelpfulCount: 5,
    isAnonymous: true,
  },
  {
    id: "comment-respirar-1",
    postId: "post-respirar",
    authorName: "Marina",
    authorRole: "Mentora Maia",
    avatarInitials: "M",
    message:
      "Gostei de pensar como uma pausa possível, sem transformar autocuidado em mais uma cobrança.",
    timeAgo: "há 22 min",
    helpfulCount: 7,
    notHelpfulCount: 0,
  },
];
