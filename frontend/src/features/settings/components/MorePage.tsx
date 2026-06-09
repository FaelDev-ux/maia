"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegisterReturn } from "react-hook-form";
import { BellRing, ChevronRight, HelpCircle, LockKeyhole, LogOut, ShieldCheck } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import type { HomeProfile } from "@/features/home/types";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";
import { changePasswordSchema, type ChangePasswordFormData } from "@/schemas/auth.schema";

type MorePageProps = {
  profile: HomeProfile;
};

const moreItems = [
  {
    href: "/privacidade-e-dados",
    icon: ShieldCheck,
    title: "Privacidade e dados",
    description: "Controle informacoes, privacidade e seguranca.",
  },
  {
    href: "/ajuda-e-suporte",
    icon: HelpCircle,
    title: "Ajuda e suporte",
    description: "Encontre respostas e caminhos de acolhimento.",
  },
  {
    href: "/perfil",
    icon: BellRing,
    title: "Notificacoes",
    description: "Configure lembretes do check-in diario.",
  },
] as const;

export function MorePage({ profile }: MorePageProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/auth?mode=login");
    router.refresh();
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[48rem] md:overflow-visible md:px-8 md:pb-32">
        <SettingsHeader backHref="/home" profile={profile} />

        <div className="px-8 pb-8 pt-9 md:px-0 md:pt-10">
          <section aria-labelledby="more-title">
            <p className="inline-flex rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              Configuracoes
            </p>
            <h1
              className="mt-5 font-title text-[2.55rem] font-extrabold leading-[1.05] text-title"
              id="more-title"
            >
              Mais
            </h1>
            <p className="mt-6 max-w-[22rem] text-[1.06rem] leading-8 text-text md:max-w-[30rem] md:text-lg">
              Acesse preferencias, privacidade e suporte para cuidar da sua experiencia no Maia.
            </p>
          </section>

          <section className="mt-8 grid gap-4" aria-label="Opcoes adicionais">
            {moreItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  className="flex items-center gap-4 rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:-translate-y-0.5 hover:shadow-card focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
                  href={getProfileScopedHref(item.href, profile)}
                  key={item.title}
                >
                  <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon aria-hidden size={22} strokeWidth={2.3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-title text-lg font-extrabold text-title">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-6 text-text">{item.description}</span>
                  </span>
                  <ChevronRight aria-hidden className="text-text/60" size={20} strokeWidth={2.4} />
                </Link>
              );
            })}

            <ChangePasswordCard />

            <button
              className="flex items-center gap-4 rounded-[1.75rem] bg-white px-5 py-5 text-left shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65 transition hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
              disabled={isLoggingOut}
              onClick={handleLogout}
              type="button"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-surface text-text">
                <LogOut aria-hidden size={22} strokeWidth={2.3} />
              </span>
              <span>
                <span className="block font-title text-lg font-extrabold text-title">
                  {isLoggingOut ? "Saindo..." : "Sair"}
                </span>
                <span className="mt-1 block text-sm leading-6 text-text">
                  Encerrar sessao neste dispositivo.
                </span>
              </span>
            </button>
          </section>
        </div>
      </div>
      <BottomNavigation profile={profile} />
    </main>
  );
}

function ChangePasswordCard() {
  const [feedback, setFeedback] = useState("");
  const [submitError, setSubmitError] = useState("");
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      confirmNewPassword: "",
      currentPassword: "",
      newPassword: "",
    },
  });

  async function onSubmit(data: ChangePasswordFormData) {
    setFeedback("");
    setSubmitError("");

    const response = await fetch("/api/auth/change-password", {
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
      setSubmitError(result.erro ?? "Nao foi possivel alterar sua senha agora.");
      return;
    }

    reset();
    setFeedback(result.mensagem ?? "Senha atualizada com sucesso.");
  }

  return (
    <article className="rounded-[1.75rem] bg-white px-5 py-5 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <LockKeyhole aria-hidden size={22} strokeWidth={2.3} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-title text-lg font-extrabold text-title">Conta e seguranca</h2>
          <p className="mt-1 text-sm leading-6 text-text">
            Altere sua senha sem expor tokens ou usar armazenamento local.
          </p>
        </div>
      </div>

      <form className="mt-5 grid gap-3" onSubmit={handleSubmit(onSubmit)}>
        <PasswordField
          error={errors.currentPassword?.message}
          label="Senha atual"
          registration={register("currentPassword")}
        />
        <PasswordField
          error={errors.newPassword?.message}
          label="Nova senha"
          registration={register("newPassword")}
        />
        <PasswordField
          error={errors.confirmNewPassword?.message}
          label="Confirmar nova senha"
          registration={register("confirmNewPassword")}
        />

        <button
          className="mt-1 h-12 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Salvando..." : "Alterar senha"}
        </button>
      </form>

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
    </article>
  );
}

function PasswordField({
  error,
  label,
  registration,
}: {
  error?: string;
  label: string;
  registration: UseFormRegisterReturn;
}) {
  return (
    <label className="block">
      <span className="text-xs font-extrabold uppercase tracking-[0.08em] text-text/80">
        {label}
      </span>
      <input
        className="mt-2 h-12 w-full rounded-full border border-border bg-background px-4 text-sm font-semibold text-title outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15"
        type="password"
        {...registration}
      />
      {error ? <span className="mt-1 block text-xs font-bold text-primary">{error}</span> : null}
    </label>
  );
}
