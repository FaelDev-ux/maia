"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import { resetPasswordSchema, type ResetPasswordFormData } from "@/schemas/auth.schema";
import { AuthInput } from "./AuthInput";

export function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const oobCode = searchParams.get("oobCode") ?? searchParams.get("code") ?? "";
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      confirmPassword: "",
      password: "",
    },
  });

  async function onSubmit(data: ResetPasswordFormData) {
    setFeedback("");
    setSubmitError("");

    if (!oobCode) {
      setSubmitError("Link de recuperacao invalido ou expirado.");
      return;
    }

    const response = await fetch("/api/auth/reset-password", {
      body: JSON.stringify({
        newPassword: data.password,
        oobCode,
      }),
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
      setSubmitError(result.erro ?? "Nao foi possivel redefinir sua senha agora.");
      return;
    }

    setFeedback(result.mensagem ?? "Senha redefinida com sucesso.");
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-none flex-col justify-center overflow-x-hidden px-6 py-8 md:max-w-[78rem] md:flex-row md:items-center md:gap-16 md:px-10 md:py-10 lg:gap-24">
        <section className="w-full max-w-[28rem]">
          <header className="mb-7 flex items-center gap-4 md:mb-6">
            <MaiaBrand imageClassName="size-12" imageSize={48} textClassName="text-3xl font-bold" />
          </header>

          <h1 className="font-title text-[2rem] font-extrabold leading-tight text-title md:text-5xl">
            Crie uma <span className="text-primary">nova senha.</span>
          </h1>

          <p className="mt-4 max-w-96 text-sm leading-6 text-text md:text-base">
            Use uma senha segura para voltar ao seu espaco Maia.
          </p>
        </section>

        <section className="mt-7 flex w-full min-w-0 justify-center md:mt-0 md:max-w-[25rem]">
          <div className="w-full max-w-[calc(100vw-3rem)] min-w-0 sm:max-w-94">
            <form
              className="w-full min-w-0 rounded-[1.75rem] bg-white/90 px-4 py-6 backdrop-blur sm:px-6"
              onSubmit={handleSubmit(onSubmit)}
            >
              <AuthInput
                error={errors.password}
                icon={<LockKeyhole size={16} strokeWidth={2.2} />}
                id="password"
                label="Nova senha"
                placeholder="••••••••"
                registration={register("password")}
                type="password"
              />

              <div className="mt-4">
                <AuthInput
                  error={errors.confirmPassword}
                  icon={<LockKeyhole size={16} strokeWidth={2.2} />}
                  id="confirmPassword"
                  label="Confirmar nova senha"
                  placeholder="••••••••"
                  registration={register("confirmPassword")}
                  type="password"
                />
              </div>

              <button
                className="mt-6 flex h-14 w-full items-center justify-center rounded-full bg-primary px-6 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitting}
                type="submit"
              >
                {isSubmitting ? "Salvando..." : "Salvar nova senha"}
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

            <Link className="mt-5 block text-center text-sm font-semibold text-primary" href="/auth?mode=login">
              Voltar para login
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
