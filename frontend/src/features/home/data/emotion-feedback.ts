import type { EmotionFeedback } from "@/features/home/components/EmotionFeedbackCard";
import type { EmotionOption } from "@/features/home/types";

const emotionFeedbackById: Record<string, EmotionFeedback> = {
  happy: {
    title: "Que bom te ver assim.",
    message:
      "Seu momento foi registrado. Aproveite essa energia para guardar uma pequena lembrança do dia ou compartilhar algo leve com sua rede de apoio.",
  },
  tired: {
    title: "Seu cansaço foi acolhido.",
    message:
      "Registro salvo. Se for possível, escolha uma pausa curta e simples: água, respiração tranquila ou alguns minutos longe das tarefas.",
  },
  overloaded: {
    title: "Você não precisa dar conta de tudo.",
    message:
      "Registro salvo. Tente escolher uma única tarefa para pedir ajuda ou adiar sem culpa. Pequenos respiros também contam como cuidado.",
  },
  calm: {
    title: "Esse respiro importa.",
    message:
      "Registro salvo. Observe o que ajudou você a chegar nesse estado e, se fizer sentido, repita esse gesto em outro momento do dia.",
  },
  melancholic: {
    title: "Obrigada por nomear isso.",
    message:
      "Registro salvo. Acolha esse sentimento com gentileza e considere conversar com alguém de confiança se ele continuar aparecendo.",
  },
  hopeful: {
    title: "Sua esperança foi registrada.",
    message:
      "Guarde esse sentimento como um ponto de apoio. Você pode anotar uma dúvida, uma expectativa ou algo que deseja cuidar com calma.",
  },
  anxious: {
    title: "Pensamentos também pedem pausa.",
    message:
      "Registro salvo. Tente voltar ao corpo por um minuto: inspire com calma, solte o ar devagar e escolha apenas o próximo passo.",
  },
  curious: {
    title: "Sua curiosidade é bem-vinda.",
    message:
      "Registro salvo. Transforme uma pergunta em busca leve: anote o que quer entender e leve isso para uma fonte ou profissional de confiança.",
  },
  sensitive: {
    title: "Sua sensibilidade foi acolhida.",
    message:
      "Registro salvo. Procure um gesto de cuidado que não exija muito: silêncio, banho, descanso ou uma conversa segura.",
  },
};

const defaultEmotionFeedback: EmotionFeedback = {
  title: "Sentimento registrado.",
  message:
    "Obrigada por fazer esse check-in. Reconhecer como você está hoje já é um passo importante de cuidado.",
};

export function getEmotionFeedback(emotion: EmotionOption) {
  return emotionFeedbackById[emotion.id] ?? defaultEmotionFeedback;
}
