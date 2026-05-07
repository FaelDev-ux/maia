"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { AuthInput } from "./AuthInput";

type LoginFormProps = {
  onRegisterClick?: () => void;
};

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(_data: LoginFormData) {
    await Promise.resolve();
  }

  return (
    <form
      className="mx-auto w-full max-w-94 rounded-[2rem] bg-white/80 px-6 py-7 backdrop-blur"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="space-y-4">
        <AuthInput
          error={errors.email}
          icon={<Mail size={16} strokeWidth={2.2} />}
          id="email"
          label="E-mail"
          placeholder="nome@exemplo.com"
          registration={register("email")}
          type="email"
        />

        <AuthInput
          error={errors.password}
          icon={<Lock size={16} strokeWidth={2.2} />}
          id="password"
          label="Senha"
          placeholder="••••••••"
          registration={register("password")}
          type="password"
        />  
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          className="text-xs font-bold text-primary transition hover:text-buttons"
          href="/auth/forgot-password"
        >
          Esqueci minha senha
        </Link>
      </div>

      <button
        className="mt-7 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? "Entrando..." : "Entrar"}
      </button>

      <p className="mt-7 text-center text-xs text-text">
        Ainda não tem uma conta?{" "}
        {onRegisterClick ? (
          <button
            className="font-bold text-primary hover:text-buttons"
            onClick={onRegisterClick}
            type="button"
          >
            Cadastre-se
          </button>
        ) : (
          <Link className="font-bold text-primary hover:text-buttons" href="/auth?mode=register">
            Cadastre-se
          </Link>
        )}
      </p>
    </form>
  );
}
