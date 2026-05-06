import { z } from "zod";

export const AUTH_PASSWORD_MIN_LENGTH = 8;
export const AUTH_PASSWORD_MAX_LENGTH = 72;
export const AUTH_NAME_MIN_LENGTH = 5;
export const AUTH_NAME_MAX_LENGTH = 80;

const nameSchema = z
  .string()
  .trim()
  .min(1, "Informe seu nome completo.")
  .min(AUTH_NAME_MIN_LENGTH, `O nome precisa ter pelo menos ${AUTH_NAME_MIN_LENGTH} caracteres.`)
  .max(AUTH_NAME_MAX_LENGTH, `O nome pode ter no máximo ${AUTH_NAME_MAX_LENGTH} caracteres.`);

const emailSchema = z.email({ message: "Informe um e-mail válido." });

const passwordSchema = z
  .string()
  .min(1, "Informe sua senha.")
  .min(
    AUTH_PASSWORD_MIN_LENGTH,
    `A senha precisa ter pelo menos ${AUTH_PASSWORD_MIN_LENGTH} caracteres.`
  )
  .max(
    AUTH_PASSWORD_MAX_LENGTH,
    `A senha pode ter no máximo ${AUTH_PASSWORD_MAX_LENGTH} caracteres.`
  );

const birthDateSchema = z.string().min(1, "Informe sua data de nascimento.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(AUTH_PASSWORD_MIN_LENGTH, "Informe sua senha."),
});

export const registerSchema = z
  .object({
    name: nameSchema,
    email: emailSchema,
    birthDate: birthDateSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(AUTH_PASSWORD_MIN_LENGTH, "Confirme sua senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(AUTH_PASSWORD_MIN_LENGTH, "Confirme sua nova senha."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmPassword"],
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(AUTH_PASSWORD_MIN_LENGTH, "Informe sua senha atual."),
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(AUTH_PASSWORD_MIN_LENGTH, "Confirme sua nova senha."),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "As senhas não coincidem.",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha precisa ser diferente da senha atual.",
    path: ["newPassword"],
  });

// export const updateProfileSchema = z.object({}); add quando backend tiver pronto e com o obj definido

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
// export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
