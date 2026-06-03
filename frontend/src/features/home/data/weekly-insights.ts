import type { DailyCheckInRecord } from "@/features/check-in/types";
import type { HomeProfile, WeeklyInsight } from "@/features/home/types";

type WeeklyInsightRule = WeeklyInsight & {
  emotionIds: string[];
};

const oneWeekInMs = 7 * 24 * 60 * 60 * 1000;
const oneDayInMs = 24 * 60 * 60 * 1000;

const recentMotherInsights: WeeklyInsightRule[] = [
  {
    emotionIds: ["happy"],
    eyebrow: "Insight da semana",
    message:
      "A felicidade apareceu no seu registro. Guarde esse ponto de leveza e repare no que ajudou esse momento a acontecer.",
  },
  {
    emotionIds: ["calm"],
    eyebrow: "Insight da semana",
    message:
      "Você registrou mais calma. Pode ser um bom dia para repetir uma pausa simples que já funcionou para o seu corpo.",
  },
  {
    emotionIds: ["tired"],
    eyebrow: "Insight da semana",
    message:
      "O cansaço apareceu no seu check-in. Se for possível, escolha uma tarefa para adiar e proteja alguns minutos de descanso.",
  },
  {
    emotionIds: ["overloaded"],
    eyebrow: "Insight da semana",
    message:
      "A sobrecarga apareceu com força. Pense em um pedido pequeno e concreto para alguém da sua rede hoje.",
  },
  {
    emotionIds: ["melancholic"],
    eyebrow: "Insight da semana",
    message:
      "Seu registro trouxe um dia mais sensível. Acolha esse ritmo e considere conversar com alguém de confiança se isso persistir.",
  },
  {
    emotionIds: ["anxious"],
    eyebrow: "Insight da semana",
    message:
      "Sua mente parece ter ficado mais acelerada. Uma respiração curta, com os pés no chão, pode ajudar a atravessar este momento.",
  },
];

const futureMotherInsights: WeeklyInsightRule[] = [
  {
    emotionIds: ["hopeful"],
    eyebrow: "Insight da semana",
    message:
      "A esperança apareceu no seu check-in. Transforme esse impulso em um pequeno cuidado possível para a sua jornada.",
  },
  {
    emotionIds: ["curious"],
    eyebrow: "Insight da semana",
    message:
      "A curiosidade tem espaço por aqui. Escolha um conteúdo curto e uma pergunta para levar com calma nos próximos dias.",
  },
  {
    emotionIds: ["sensitive"],
    eyebrow: "Insight da semana",
    message:
      "Seu registro mostra mais sensibilidade. Diminua o ritmo quando puder e trate suas emoções com gentileza.",
  },
  {
    emotionIds: ["anxious"],
    eyebrow: "Insight da semana",
    message:
      "O planejamento pode deixar tudo mais intenso. Uma lista pequena, com só o próximo passo, pode aliviar a sensação de excesso.",
  },
  {
    emotionIds: ["calm"],
    eyebrow: "Insight da semana",
    message:
      "Você registrou calma. Observe quais escolhas ajudaram esse estado e mantenha uma delas por perto nesta semana.",
  },
];

const sleepInsight: WeeklyInsight = {
  eyebrow: "Insight da semana",
  message:
    "Seu sono apareceu como um ponto de atenção. Uma janela curta de descanso ou apoio combinado pode fazer diferença hoje.",
};

const supportInsight: WeeklyInsight = {
  eyebrow: "Insight da semana",
  message:
    "Seu check-in indica pouco apoio recebido. Um pedido simples e direto pode abrir espaço para cuidado sem precisar explicar tudo.",
};

function getRecentWeeklyRecords(records: DailyCheckInRecord[]) {
  const now = Date.now();

  return records
    .filter((record) => {
      const createdAtTime = new Date(record.createdAt).getTime();

      return Number.isFinite(createdAtTime) && now - createdAtTime <= oneWeekInMs;
    })
    .sort((firstRecord, secondRecord) => {
      return new Date(secondRecord.createdAt).getTime() - new Date(firstRecord.createdAt).getTime();
    });
}

function getDominantEmotionId(records: DailyCheckInRecord[]) {
  const emotionCounts = records.reduce<Record<string, number>>((counts, record) => {
    counts[record.emotionId] = (counts[record.emotionId] ?? 0) + 1;

    return counts;
  }, {});

  return records.reduce((selectedRecord, record) => {
    const currentCount = emotionCounts[record.emotionId] ?? 0;
    const selectedCount = emotionCounts[selectedRecord.emotionId] ?? 0;

    if (currentCount > selectedCount) {
      return record;
    }

    if (currentCount === selectedCount && record.intensity > selectedRecord.intensity) {
      return record;
    }

    return selectedRecord;
  }, records[0]).emotionId;
}

function getInsightEmotionId(records: DailyCheckInRecord[]) {
  const mostRecentRecord = records[0];
  const mostRecentRecordTime = new Date(mostRecentRecord.createdAt).getTime();

  if (Number.isFinite(mostRecentRecordTime) && Date.now() - mostRecentRecordTime <= oneDayInMs) {
    return mostRecentRecord.emotionId;
  }

  return getDominantEmotionId(records);
}

function getInsightRules(profile: HomeProfile) {
  return profile === "future-mother" ? futureMotherInsights : recentMotherInsights;
}

export function getWeeklyInsightFromCheckIns(
  profile: HomeProfile,
  fallbackInsight: WeeklyInsight,
  records: DailyCheckInRecord[]
) {
  const weeklyRecords = getRecentWeeklyRecords(records);

  if (weeklyRecords.length === 0) {
    return fallbackInsight;
  }

  const highSleepAttentionCount = weeklyRecords.filter(
    (record) => record.sleepQuality === "low"
  ).length;
  const lowSupportCount = weeklyRecords.filter((record) => record.receivedSupport === "no").length;

  if (highSleepAttentionCount >= 2) {
    return sleepInsight;
  }

  if (lowSupportCount >= 2) {
    return supportInsight;
  }

  const insightEmotionId = getInsightEmotionId(weeklyRecords);
  const matchedInsight = getInsightRules(profile).find((insight) =>
    insight.emotionIds.includes(insightEmotionId)
  );

  return matchedInsight ?? fallbackInsight;
}
