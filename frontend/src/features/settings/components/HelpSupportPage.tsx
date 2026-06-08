"use client";

import { HelpCircle, LifeBuoy, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import type { HomeProfile } from "@/features/home/types";
import { SettingsHeader } from "@/features/settings/components/SettingsHeader";

type HelpSupportPageProps = {
  profile: HomeProfile;
};

const motherSupportItems = [
  {
    icon: MessageCircle,
    title: "Dúvidas sobre o app",
    description:
      "Use a comunidade para trocar experiências e encontrar orientações simples sobre os recursos do Maia.",
  },
  {
    icon: LifeBuoy,
    title: "Suporte do protótipo",
    description:
      "Se algo não funcionar, registre o caminho usado e a ação esperada para facilitar a correção.",
  },
  {
    icon: Mail,
    title: "Contato",
    description: "Canal mockado: suporte@maia.app. Na versão real, este contato deve ir para atendimento.",
  },
  {
    icon: ShieldAlert,
    title: "Quando buscar ajuda",
    description:
      "Se sentimentos difíceis persistirem ou houver risco imediato, procure uma pessoa de confiança, serviço de saúde ou emergência local.",
  },
] as const;

const professionalSupportItems = [
  {
    icon: MessageCircle,
    title: "Atuação na comunidade",
    description:
      "Publique orientações gerais e responda dúvidas com linguagem acolhedora, evitando diagnóstico ou conduta individualizada.",
  },
  {
    icon: ShieldAlert,
    title: "Limites da orientação",
    description:
      "Quando houver sinais de risco ou necessidade de avaliação, oriente a busca por atendimento presencial ou serviço de saúde adequado.",
  },
  {
    icon: LifeBuoy,
    title: "Suporte do protótipo",
    description:
      "Se algo não funcionar, registre o caminho usado, o perfil profissional e a ação esperada para facilitar a correção.",
  },
  {
    icon: Mail,
    title: "Contato",
    description: "Canal mockado: suporte@maia.app. Na versão real, este contato deve ir para atendimento.",
  },
] as const;

export function HelpSupportPage({ profile }: HelpSupportPageProps) {
  const isHealthProfessional = profile === "health-professional";
  const supportItems = isHealthProfessional ? professionalSupportItems : motherSupportItems;

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[48rem] md:overflow-visible md:px-8 md:pb-32">
        <SettingsHeader profile={profile} />

        <div className="px-8 pb-8 pt-9 md:px-0 md:pt-10">
          <section aria-labelledby="support-title">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              <HelpCircle aria-hidden size={14} strokeWidth={2.4} />
              Suporte
            </p>
            <h1
              className="mt-5 font-title text-[2.35rem] font-extrabold leading-[1.08] text-title md:text-[2.8rem]"
              id="support-title"
            >
              Ajuda e <span className="text-primary">suporte</span>
            </h1>
            <p className="mt-6 max-w-[22rem] text-[1.06rem] leading-8 text-text md:max-w-[32rem] md:text-lg">
              {isHealthProfessional
                ? "Encontre orientações rápidas para testar o fluxo profissional e participar da comunidade com segurança."
                : "Encontre respostas rápidas e caminhos de apoio para usar o Maia com mais tranquilidade."}
            </p>
          </section>

          <section className="mt-8 grid gap-4" aria-label="Opções de suporte">
            {supportItems.map((item) => {
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
