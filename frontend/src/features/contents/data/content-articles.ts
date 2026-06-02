import type { ContentArticle } from "@/features/contents/types";

export const contentArticles: ContentArticle[] = [
  {
    id: "navegando-nas-emocoes",
    title: "Navegando nas emoções do puerpério.",
    highlightWord: "puerpério.",
    summary: "Práticas de autocompaixão para atravessar dias intensos com mais acolhimento.",
    category: "Autocuidado",
    tags: ["emoções", "puerpério", "autocompaixão"],
    readTime: "6 min de leitura",
    badge: "Destaque",
    imageUrl:
      "https://images.unsplash.com/photo-1543342384-1f1350e27861?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Mãe segurando seu bebê com expressão acolhedora.",
    quote:
      "O cuidado com o bebê começa pelo cuidado com a mãe. Você não precisa ser perfeita, você só precisa ser você.",
    sections: [
      {
        paragraphs: [
          "O período após o nascimento é uma das transformações mais profundas na vida de uma mulher. É um tempo de redescoberta, onde a vulnerabilidade pode conviver com uma força que talvez você ainda esteja aprendendo a reconhecer.",
          "Sentimentos intensos podem aparecer nesse caminho. Mais do que tentar controlar tudo, o primeiro passo é perceber o que está presente e acolher cada emoção com gentileza.",
        ],
      },
      {
        title: "Práticas de Autocompaixão",
        paragraphs: [
          "Permita-se momentos de pausa. O cansaço é real e a sobrecarga mental pode ser exaustiva. Aqui estão algumas sugestões para integrar ao seu dia a dia de forma suave:",
        ],
        items: [
          {
            title: "Aceite ajuda:",
            text: "Delegar tarefas não é um sinal de fraqueza, mas de sabedoria.",
          },
          {
            title: "Pequenos rituais:",
            text: "Um banho quente ou cinco minutos de respiração consciente podem restaurar sua energia.",
          },
        ],
      },
      {
        paragraphs: [
          "Lembre-se de que cada jornada é única. O que funciona para uma pessoa pode não ser o ideal para você, e está tudo bem. O importante é manter o canal de comunicação aberto com sua rede de apoio e buscar orientação profissional quando sentir necessidade.",
        ],
      },
    ],
  },
  {
    id: "alongamento-leve",
    title: "Alongamento leve para aliviar tensões.",
    highlightWord: "tensões.",
    summary: "Movimentos simples para relaxar costas, ombros e respiração.",
    category: "Bem-estar",
    tags: ["corpo", "alongamento", "respiração"],
    readTime: "15 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Pessoa em postura de alongamento sobre tapete.",
    quote:
      "Um corpo que recebe pequenas pausas ao longo do dia encontra mais espaço para respirar.",
    sections: [
      {
        paragraphs: [
          "Entre colo, sono interrompido e muitas tarefas, o corpo pode acumular tensão sem que você perceba. Alguns movimentos leves ajudam a criar pequenos respiros ao longo do dia.",
        ],
      },
      {
        title: "Comece devagar",
        paragraphs: [
          "Escolha um momento seguro, respeite seus limites e faça movimentos confortáveis. A proposta não é desempenho: é presença.",
        ],
        items: [
          {
            title: "Solte os ombros:",
            text: "Faça círculos lentos para trás e respire fundo a cada repetição.",
          },
          {
            title: "Alongue o pescoço:",
            text: "Incline a cabeça suavemente para os lados, sem forçar.",
          },
        ],
      },
    ],
  },
  {
    id: "preparando-sua-jornada",
    title: "Preparando sua jornada com leveza.",
    highlightWord: "leveza.",
    summary: "Conteúdos para uma espera mais tranquila e conectada com você.",
    category: "Preparação",
    tags: ["planejamento", "futura mãe", "acolhimento"],
    readTime: "8 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1492725764893-90b379c2b6e7?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Família em momento tranquilo de cuidado.",
    quote:
      "Planejar também pode ser um gesto de carinho consigo mesma, sem pressa e sem cobrança.",
    sections: [
      {
        paragraphs: [
          "Desejar ser mãe pode trazer alegria, expectativa e dúvidas. Criar espaço para conversar sobre esses sentimentos ajuda a tornar a jornada mais humana.",
        ],
      },
      {
        title: "Pequenos passos",
        items: [
          {
            title: "Organize informações:",
            text: "Guarde dúvidas para conversar com profissionais de confiança.",
          },
          {
            title: "Cuide da sua rede:",
            text: "Aproxime-se de pessoas que respeitam seu tempo e suas escolhas.",
          },
        ],
      },
    ],
  },
  {
    id: "respiracao-para-ansiedade",
    title: "Respiração para desacelerar pensamentos.",
    highlightWord: "pensamentos.",
    summary: "Um exercício simples para voltar ao corpo quando a mente acelera.",
    category: "Respiração",
    tags: ["ansiedade", "respiração", "pausa"],
    readTime: "12 min de leitura",
    imageUrl:
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=900&q=80",
    imageAlt: "Pessoa sentada em postura tranquila para respirar.",
    quote: "Respirar com atenção é uma forma simples de lembrar ao corpo que há uma pausa possível.",
    sections: [
      {
        paragraphs: [
          "Quando os pensamentos ficam acelerados, uma pausa curta pode ajudar a organizar o momento. Não precisa ser perfeito: alguns ciclos de respiração já podem trazer mais presença.",
        ],
      },
      {
        title: "Exercício de um minuto",
        items: [
          {
            title: "Inspire:",
            text: "Conte até quatro com calma.",
          },
          {
            title: "Expire:",
            text: "Solte o ar contando até seis, sem prender a respiração.",
          },
        ],
      },
    ],
  },
];

export function getContentArticleById(contentId: string) {
  return contentArticles.find((article) => article.id === contentId);
}
