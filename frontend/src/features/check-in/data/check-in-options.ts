import {
  BatteryLow,
  CloudRain,
  Heart,
  HelpCircle,
  Smile,
  Sparkles,
  Waves,
  Wind,
  Zap,
  type LucideIcon,
} from "lucide-react";
import type { CheckInOption } from "@/features/check-in/types";

export type CheckInEmotionOption = CheckInOption & {
  icon: LucideIcon;
};

export const checkInEmotionOptions: CheckInEmotionOption[] = [
  {
    id: "happy",
    label: "Feliz",
    description: "Um momento mais leve.",
    icon: Smile,
  },
  {
    id: "calm",
    label: "Calma",
    description: "Respiração mais tranquila.",
    icon: Waves,
  },
  {
    id: "tired",
    label: "Cansada",
    description: "Energia mais baixa.",
    icon: BatteryLow,
  },
  {
    id: "overloaded",
    label: "Sobrecarregada",
    description: "Muita coisa ao mesmo tempo.",
    icon: Zap,
  },
  {
    id: "melancholic",
    label: "Melancólica",
    description: "Dia mais sensível.",
    icon: CloudRain,
  },
  {
    id: "anxious",
    label: "Pensativa",
    description: "Mente mais acelerada.",
    icon: Wind,
  },
  {
    id: "hopeful",
    label: "Esperançosa",
    description: "Confiança em pequenos passos.",
    icon: Sparkles,
  },
  {
    id: "curious",
    label: "Curiosa",
    description: "Vontade de aprender.",
    icon: HelpCircle,
  },
  {
    id: "sensitive",
    label: "Sensível",
    description: "Sentindo tudo com mais intensidade.",
    icon: Heart,
  },
];

export const checkInIntensityOptions = [
  { value: 1, label: "1", description: "Bem leve" },
  { value: 2, label: "2", description: "Leve" },
  { value: 3, label: "3", description: "Moderada" },
  { value: 4, label: "4", description: "Forte" },
  { value: 5, label: "5", description: "Muito forte" },
] as const;

export const secondaryEmotionOptions: CheckInOption[] = [
  { id: "grateful", label: "Grata" },
  { id: "lonely", label: "Sozinha" },
  { id: "worried", label: "Preocupada" },
  { id: "irritated", label: "Irritada" },
  { id: "welcomed", label: "Acolhida" },
  { id: "confused", label: "Confusa" },
];

export const sleepQualityOptions: CheckInOption[] = [
  { id: "low", label: "Pouco sono" },
  { id: "medium", label: "Sono interrompido" },
  { id: "good", label: "Consegui descansar" },
];

export const supportOptions: CheckInOption[] = [
  { id: "yes", label: "Sim" },
  { id: "partly", label: "Um pouco" },
  { id: "no", label: "Ainda não" },
];

export function isCheckInEmotionId(value?: string) {
  return checkInEmotionOptions.some((option) => option.id === value);
}

export function getCheckInEmotionLabel(emotionId: string) {
  return checkInEmotionOptions.find((option) => option.id === emotionId)?.label ?? "Emoção";
}
