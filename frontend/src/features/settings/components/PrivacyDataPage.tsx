"use client";

import { Database, Download, EyeOff, ShieldCheck, Trash2 } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import type { HomeProfile } from "@/features/home/types";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";

type PrivacyDataPageProps = {
  profile: HomeProfile;
};

const motherPrivacyItems = [
  {
    icon: Database,
    title: "Dados armazenados localmente",
    description:
      "Cadastro, preferências, perfil, check-ins e publicações mockadas ficam salvos neste navegador durante o protótipo.",
  },
  {
    icon: EyeOff,
    title: "Privacidade emocional",
    description:
      "Os registros emocionais são sensíveis. O Maia usa linguagem acolhedora e não faz diagnóstico médico ou psicológico.",
  },
  {
    icon: Download,
    title: "Exportação futura",
    description:
      "A exportação do histórico emocional é uma funcionalidade prevista para evolução do produto.",
  },
  {
    icon: Trash2,
    title: "Remoção de dados",
    description:
      "Quando houver backend, a remoção definitiva deverá seguir LGPD e confirmação segura de identidade.",
  },
] as const;

const professionalPrivacyItems = [
  {
    icon: Database,
    title: "Dados profissionais locais",
    description:
      "Nome, contato, conselho, registro, UF, especialidade e publicações mockadas ficam salvos neste navegador durante o protótipo.",
  },
  {
    icon: ShieldCheck,
    title: "Status de verificação",
    description:
      "Enquanto o backend não estiver conectado, a análise do registro é simulada localmente e aparece como uma flag na comunidade.",
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
      "Na versão com backend, alterações, remoção e auditoria de dados profissionais deverão seguir LGPD e regras administrativas.",
  },
] as const;

export function PrivacyDataPage({ profile }: PrivacyDataPageProps) {
  const isHealthProfessional = profile === "health-professional";
  const privacyItems = isHealthProfessional ? professionalPrivacyItems : motherPrivacyItems;

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
        </div>
      </div>
      <BottomNavigation profile={profile} />
    </main>
  );
}
