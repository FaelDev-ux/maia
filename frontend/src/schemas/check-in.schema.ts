import { z } from "zod";

export const checkInSchema = z.object({
  emotionId: z.string().min(1, "Escolha como você está se sentindo agora."),
  intensity: z
    .number()
    .min(1, "Escolha uma intensidade de 1 a 5.")
    .max(5, "Escolha uma intensidade de 1 a 5."),
  secondaryEmotionIds: z.array(z.string()).max(4, "Escolha até 4 sentimentos de apoio."),
  sleepQuality: z.enum(["low", "medium", "good"]),
  receivedSupport: z.enum(["yes", "partly", "no"]),
  note: z.string().trim().max(280, "Use até 280 caracteres.").optional(),
});

export type CheckInFormData = z.infer<typeof checkInSchema>;
