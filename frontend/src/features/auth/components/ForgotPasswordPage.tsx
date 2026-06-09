"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "@/schemas/auth.schema";
import { AuthInput } from "./AuthInput";

export function ForgotPasswordPage() {
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setFeedback("");
    setSubmitError("");

    const response = await fetch("/api/auth/forgot-password", {
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });
    const result = (await response.json().catch(() => ({}))) as {
      erro?: string;
      mensagem?: string;
    };

    if (!response.ok) {
      setSubmitError(result.erro ?? "Nao foi possivel enviar as instrucoes agora.");
      return;
    }

    setFeedback(
      result.mensagem ??
        "Se este e-mail estiver cadastrado, enviaremos instrucoes para recuperar a senha."
    );
  }

  const recoveryForm = (
    <section className="w-full max-w-[calc(100vw-3rem)] min-w-0 sm:max-w-94">
      <form
        className="w-full min-w-0 rounded-[1.75rem] bg-white/90 px-4 py-6 backdrop-blur sm:px-6"
        onSubmit={handleSubmit(onSubmit)}
      >
        <AuthInput
          error={errors.email}
          icon={<Mail size={16} strokeWidth={2.2} />}
          id="email"
          label="E-mail"
          placeholder="nome@exemplo.com"
          registration={register("email")}
          type="email"
        />

        <button
          className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Enviando..." : "Enviar instrucoes"}
        </button>

        {feedback ? (
          <p className="mt-4 rounded-[1.15rem] bg-success/[0.12] px-4 py-3 text-sm font-semibold leading-6 text-emerald-700">
            {feedback}
          </p>
        ) : null}

        {submitError ? (
          <p className="mt-4 rounded-[1.15rem] bg-primary/10 px-4 py-3 text-sm font-semibold leading-6 text-primary">
            {submitError}
          </p>
        ) : null}
      </form>

      <Link
        className="mt-5 block text-center text-sm font-semibold text-primary"
        href="/auth?mode=login"
      >
        Voltar para login
      </Link>
    </section>
  );

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-none flex-col justify-center overflow-x-hidden px-6 py-8 md:max-w-[78rem] md:flex-row md:items-center md:gap-16 md:px-10 md:py-10 lg:gap-24">
        <ForgotPasswordCopy />

        <div className="mt-7 flex w-full min-w-0 justify-center md:mt-0 md:max-w-[25rem]">
          {recoveryForm}
        </div>
      </div>
    </main>
  );
}

function ForgotPasswordCopy() {
  return (
    <section className="w-full max-w-[28rem]">
      <header className="mb-7 flex items-center gap-4 md:mb-6">
        <MaiaBrand imageClassName="size-12" imageSize={48} textClassName="text-3xl font-bold" />
      </header>

      <h1 className="font-title text-[2rem] font-extrabold leading-tight text-title md:text-5xl">
        Recupere o acesso do <span className="text-primary">seu espaco.</span>
      </h1>

      <p className="mt-4 max-w-96 text-sm leading-6 text-text md:text-base">
        Informe seu e-mail para iniciarmos a recuperacao da sua conta.
      </p>
    </section>
  );
}
