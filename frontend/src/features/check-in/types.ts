export type DailyCheckInRecord = {
  id: string;
  createdAt: string;
  emotionId: string;
  intensity: number;
  secondaryEmotionIds: string[];
  sleepQuality: "low" | "medium" | "good";
  receivedSupport: "yes" | "partly" | "no";
  note?: string;
};

export type CheckInOption = {
  id: string;
  label: string;
  description?: string;
};
