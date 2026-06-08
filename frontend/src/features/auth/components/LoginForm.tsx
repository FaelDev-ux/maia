"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { loginSchema, type LoginFormData } from "@/schemas/auth.schema";
import { AuthInput } from "./AuthInput";

type LoginFormProps = {
  onRegisterClick?: () => void;
};

export function LoginForm({ onRegisterClick }: LoginFormProps) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState("");
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

  async function onSubmit(data: LoginFormData) {
    setSubmitError("");

    const response = await fetch("/api/auth/login", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      const result = (await response.json().catch(() => ({}))) as { erro?: string };
      setSubmitError(result.erro ?? "Nao foi possivel entrar. Confira seus dados.");
      return;
    }

    router.replace("/home");
    router.refresh();
  }

  return (
    <form
      className="mx-auto w-full max-w-[calc(100vw-3rem)] min-w-0 rounded-[2rem] bg-white/80 px-4 py-7 backdrop-blur sm:max-w-94 sm:px-6"
      onSubmit={handleSubmit(onSubmit)}
    >
      <div className="min-w-0 space-y-4">
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
          className="text-xs font-bold text-primary transition hover:text-primary-hover"
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

      {submitError ? (
        <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-center text-xs font-semibold leading-5 text-primary">
          {submitError}
        </p>
      ) : null}

      <p className="mt-7 text-center text-xs text-text">
        Ainda não tem uma conta?{" "}
        {onRegisterClick ? (
          <button
            className="font-bold text-primary hover:text-primary-hover"
            onClick={onRegisterClick}
            type="button"
          >
            Cadastre-se
          </button>
        ) : (
          <Link
            className="font-bold text-primary hover:text-primary-hover"
            href="/auth?mode=register"
          >
            Cadastre-se
          </Link>
        )}
      </p>
    </form>
  );
}
