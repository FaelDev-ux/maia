import { apiFetch } from "@/services/api/client";
import type { CheckInFormData } from "@/schemas/check-in.schema";
import type { DailyCheckInRecord } from "@/features/check-in/types";

type ApiCheckIn = Partial<DailyCheckInRecord> & {
  emotion?: string;
  energy?: number;
  recordedAt?: string;
  tags?: string[];
};

type CheckInsResponse = {
  checkIns?: ApiCheckIn[];
  items?: ApiCheckIn[];
};

type CheckInResponse = {
  checkIn?: ApiCheckIn;
};

function isSleepQuality(value: unknown): value is DailyCheckInRecord["sleepQuality"] {
  return value === "low" || value === "medium" || value === "good";
}

function isReceivedSupport(value: unknown): value is DailyCheckInRecord["receivedSupport"] {
  return value === "yes" || value === "partly" || value === "no";
}

function toStringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

export function normalizeCheckIn(checkIn: ApiCheckIn): DailyCheckInRecord {
  const createdAt = checkIn.recordedAt ?? checkIn.createdAt ?? new Date().toISOString();
  const emotionId = checkIn.emotionId ?? checkIn.emotion ?? "";

  return {
    id: checkIn.id ?? `check-in-${createdAt}`,
    createdAt,
    emotionId,
    intensity: Number(checkIn.intensity ?? checkIn.energy ?? 3),
    receivedSupport: isReceivedSupport(checkIn.receivedSupport)
      ? checkIn.receivedSupport
      : "partly",
    secondaryEmotionIds: toStringList(checkIn.secondaryEmotionIds ?? checkIn.tags),
    sleepQuality: isSleepQuality(checkIn.sleepQuality) ? checkIn.sleepQuality : "medium",
    note: checkIn.note?.trim() || undefined,
  };
}

function buildCheckInPayload(data: CheckInFormData) {
  return {
    emotionId: data.emotionId,
    intensity: data.intensity,
    note: data.note?.trim() || "",
    receivedSupport: data.receivedSupport,
    secondaryEmotionIds: data.secondaryEmotionIds,
    sleepQuality: data.sleepQuality,
    tags: data.secondaryEmotionIds,
  };
}

export async function fetchDailyCheckIns() {
  const data = await apiFetch<CheckInsResponse>(
    "/api/check-ins",
    undefined,
    "Nao foi possivel carregar seus check-ins."
  );
  const items = data.checkIns ?? data.items ?? [];

  return items.map(normalizeCheckIn);
}

export async function createDailyCheckIn(data: CheckInFormData) {
  const response = await apiFetch<CheckInResponse>(
    "/api/check-ins",
    {
      body: JSON.stringify(buildCheckInPayload(data)),
      method: "POST",
    },
    "Nao foi possivel salvar seu check-in agora."
  );

  return response.checkIn ? normalizeCheckIn(response.checkIn) : null;
}

export async function updateDailyCheckInRecord(recordId: string, data: CheckInFormData) {
  const response = await apiFetch<CheckInResponse>(
    `/api/check-ins/${recordId}`,
    {
      body: JSON.stringify(buildCheckInPayload(data)),
      method: "PATCH",
    },
    "Nao foi possivel atualizar seu check-in agora."
  );

  return response.checkIn ? normalizeCheckIn(response.checkIn) : null;
}
