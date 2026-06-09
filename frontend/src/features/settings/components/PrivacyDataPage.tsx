"use client";

import { useState } from "react";
import { Database, Download, EyeOff, ShieldCheck, Trash2 } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import type { HomeProfile } from "@/features/home/types";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";
import { fetchPrivacyExport, requestPrivacyDelete } from "@/features/settings/services";

type PrivacyDataPageProps = {
  profile: HomeProfile;
};

const motherPrivacyItems = [
  {
    icon: Database,
    title: "Dados sincronizados com segurança",
    description:
      "Cadastro, preferências, perfil, check-ins e publicações são sincronizados pelo backend do Maia.",
  },
  {
    icon: EyeOff,
    title: "Privacidade emocional",
    description:
      "Os registros emocionais são sensíveis. O Maia usa linguagem acolhedora e não faz diagnóstico médico ou psicológico.",
  },
  {
    icon: Download,
    title: "Exportação de dados",
    description:
      "A exportação dos dados da conta é atendida pelo endpoint de privacidade do Maia.",
  },
  {
    icon: Trash2,
    title: "Remoção de dados",
    description:
      "Solicitações de remoção seguem o fluxo de privacidade e LGPD do backend.",
  },
] as const;

const professionalPrivacyItems = [
  {
    icon: Database,
    title: "Dados profissionais locais",
    description:
      "Nome, contato, conselho, registro, UF, especialidade e publicações são sincronizados pelo backend.",
  },
  {
    icon: ShieldCheck,
    title: "Status de verificação",
    description:
      "A análise do registro é registrada no backend e exibida como status no perfil e na comunidade.",
  },
  {
    icon: EyeOff,
    title: "Orientações responsáveis",
    description:
      "Posts profissionais devem ser gerais, cuidadosos e sem diagnóstico individual. Dados sensíveis de mães devem ser preservados.",
  },
  {
    icon: Trash2,
    title: "Remoção de dados",
    description:
      "Alterações, remoção e auditoria de dados profissionais seguem LGPD e regras administrativas.",
  },
] as const;

export function PrivacyDataPage({ profile }: PrivacyDataPageProps) {
  const isHealthProfessional = profile === "health-professional";
  const privacyItems = isHealthProfessional ? professionalPrivacyItems : motherPrivacyItems;
  const [statusMessage, setStatusMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isExporting, setIsExporting] = useState(false);
  const [isRequestingDelete, setIsRequestingDelete] = useState(false);

  async function handleExportData() {
    setIsExporting(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      const data = await fetchPrivacyExport();
      const blob = new Blob([JSON.stringify(data.export ?? data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `maia-dados-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatusMessage("Exportacao preparada com sucesso.");
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel exportar dados.");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleRequestDelete() {
    setIsRequestingDelete(true);
    setStatusMessage("");
    setErrorMessage("");

    try {
      await requestPrivacyDelete();
      setStatusMessage("Solicitacao de exclusao registrada com seguranca.");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Nao foi possivel solicitar exclusao agora."
      );
    } finally {
      setIsRequestingDelete(false);
    }
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[48rem] md:overflow-visible md:px-8 md:pb-32">
        <SettingsHeader profile={profile} />

        <div className="px-8 pb-8 pt-9 md:px-0 md:pt-10">
          <section aria-labelledby="privacy-title">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              <ShieldCheck aria-hidden size={14} strokeWidth={2.4} />
              Segurança e LGPD
            </p>
            <h1
              className="mt-5 font-title text-[2.35rem] font-extrabold leading-[1.08] text-title md:text-[2.8rem]"
              id="privacy-title"
            >
              Privacidade e <span className="text-primary">dados</span>
            </h1>
            <p className="mt-6 max-w-[22rem] text-[1.06rem] leading-8 text-text md:max-w-[32rem] md:text-lg">
              {isHealthProfessional
                ? "Entenda como seus dados profissionais e sua participação na comunidade são tratados neste protótipo."
                : "Entenda como suas informações são tratadas neste protótipo e quais cuidados devem existir na versão com backend."}
            </p>
          </section>

          <section className="mt-8 grid gap-4" aria-label="Informações de privacidade">
            {privacyItems.map((item) => {
              const Icon = item.icon;

              return (
                <article
                  className="rounded-[1.75rem] bg-white px-6 py-6 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65"
                  key={item.title}
                >
                  <span className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary">
                    <Icon aria-hidden size={22} strokeWidth={2.3} />
                  </span>
                  <h2 className="mt-4 font-title text-xl font-extrabold leading-tight text-title">
                    {item.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-text">{item.description}</p>
                </article>
              );
            })}
          </section>
          <section className="mt-8 rounded-[1.75rem] bg-white px-6 py-6 shadow-[0_14px_38px_rgb(140_64_84_/_0.08)] ring-1 ring-border/65">
            <h2 className="font-title text-xl font-extrabold leading-tight text-title">
              Gerenciar meus dados
            </h2>
            <p className="mt-3 text-sm leading-7 text-text">
              Use estas acoes para exportar seus dados ou registrar uma solicitacao de exclusao.
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
                disabled={isExporting}
                onClick={handleExportData}
                type="button"
              >
                <Download aria-hidden size={17} strokeWidth={2.4} />
                {isExporting ? "Exportando..." : "Exportar dados"}
              </button>
              <button
                className="inline-flex min-h-[3.25rem] items-center justify-center gap-2 rounded-full bg-danger px-5 text-sm font-extrabold text-white shadow-[0_10px_22px_rgb(248_113_113_/_0.22)] transition hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
                disabled={isRequestingDelete}
                onClick={handleRequestDelete}
                type="button"
              >
                <Trash2 aria-hidden size={17} strokeWidth={2.4} />
                {isRequestingDelete ? "Solicitando..." : "Solicitar exclusao"}
              </button>
            </div>
            {statusMessage ? (
              <p className="mt-4 rounded-2xl bg-success/10 px-4 py-3 text-sm font-bold leading-6 text-emerald-800">
                {statusMessage}
              </p>
            ) : null}
            {errorMessage ? (
              <p className="mt-4 rounded-2xl bg-primary/10 px-4 py-3 text-sm font-bold leading-6 text-primary">
                {errorMessage}
              </p>
            ) : null}
          </section>
        </div>
      </div>
      <BottomNavigation profile={profile} />
    </main>
  );
}
