"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { HandHeart, Heart } from "lucide-react";
import logoMaia from "@/../public/images/logo-maia.png";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { CommunityPreviewCard } from "@/features/home/components/CommunityPreviewCard";
import { EmotionChip } from "@/features/home/components/EmotionChip";
import { EmotionFeedbackCard } from "@/features/home/components/EmotionFeedbackCard";
import { HelpRequestCard } from "@/features/home/components/HelpRequestCard";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { MentorImpactCard } from "@/features/home/components/MentorImpactCard";
import { MentorProfileBadge } from "@/features/home/components/MentorProfileBadge";
import { RecommendationCard } from "@/features/home/components/RecommendationCard";
import { WeeklyInsightCard } from "@/features/home/components/WeeklyInsightCard";
import { getEmotionFeedback } from "@/features/home/data/emotion-feedback";
import { homeContentByProfile } from "@/features/home/data/home-content";
import type { EmotionOption, HomeProfile } from "@/features/home/types";
import { useRouter } from "next/navigation";

type HomePageProps = {
  profile?: HomeProfile;
};

type EmotionSelection = {
  profile: HomeProfile;
  emotion: EmotionOption;
};

export function HomePage({ profile = "recent-mother" }: HomePageProps) {
  const content = homeContentByProfile[profile];
  const [emotionSelection, setEmotionSelection] = useState<EmotionSelection | null>(null);
  const selectedEmotion = emotionSelection?.profile === profile ? emotionSelection.emotion : null;

  const router = useRouter();

  function onRedirectCommunity() {
    router.push("/comunidade");
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <Image
            src={logoMaia}
            alt="Maia"
            width={58}
            height={58}
            className="size-14 object-contain"
            priority
          />
          <div
            aria-label={content.avatarLabel}
            className="size-[3.25rem] rounded-full border-[3px] border-primary bg-cover bg-center shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            role="img"
            style={{
              backgroundImage: `url(${content.avatarUrl})`,
            }}
          />
        </header>

        {content.variant === "mentor" ? (
          <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
            <div>
              <section aria-labelledby="home-title">
                <MentorProfileBadge badge={content.badge} secondaryLabel={content.secondaryLabel} />

                <h1
                  className="mt-5 max-w-[22rem] font-title text-[2.12rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
                  id="home-title"
                >
                  Olá,{" "}
                  <span className="text-primary">{content.displayName ?? content.firstName}!</span>
                </h1>
                <p className="mt-7 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                  {content.intro}
                </p>
              </section>

              <section className="mt-8 md:mt-9">
                <MentorImpactCard
                  description={content.impact.description}
                  label={content.impact.label}
                  value={content.impact.value}
                />
              </section>
            </div>

            <div className="md:min-w-0">
              <section className="mt-8 md:mt-0" aria-labelledby="help-requests-heading">
                <div id="help-requests-heading">
                  <HomeSectionHeader title="Pedidos de ajuda urgentes" actionLabel="Ver todos" />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {content.helpRequests.map((request) => (
                    <HelpRequestCard key={request.id} request={request} />
                  ))}
                </div>
              </section>

              <section className="relative mt-7 md:mt-8">
                <CommunityPreviewCard onClick={onRedirectCommunity} community={content.community} />
                <Link
                  aria-label="Oferecer apoio"
                  className="fixed bottom-24 right-6 z-30 grid size-16 place-items-center rounded-full bg-primary text-white shadow-[0_18px_38px_rgb(216_116_140_/_0.34)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:right-10"
                  href="/check-in"
                >
                  <HandHeart aria-hidden size={31} strokeWidth={2.2} />
                </Link>
              </section>
            </div>
          </div>
        ) : (
          <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
            <div>
              <section aria-labelledby="home-title">
                <h1
                  className="max-w-[22rem] font-title text-[2.12rem] font-extrabold leading-[1.28] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.18]"
                  id="home-title"
                >
                  Olá, <span className="text-primary">{content.firstName}!</span>{" "}
                  {content.titleSuffix}
                </h1>
                <p className="mt-6 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                  {content.intro}
                </p>
              </section>

              <section
                className="mt-7 flex flex-wrap gap-4 md:mt-8"
                aria-label="Check-in emocional rápido"
              >
                {selectedEmotion ? (
                  <EmotionFeedbackCard
                    emotion={selectedEmotion}
                    feedback={getEmotionFeedback(selectedEmotion)}
                  />
                ) : (
                  content.emotions.map((emotion) => (
                    <EmotionChip
                      emotion={emotion}
                      key={emotion.id}
                      onSelect={(selectedEmotionOption) =>
                        setEmotionSelection({
                          profile,
                          emotion: selectedEmotionOption,
                        })
                      }
                    />
                  ))
                )}
              </section>

              <section className="mt-10 md:mt-9">
                <WeeklyInsightCard insight={content.insight} />
              </section>
            </div>

            <div className="md:min-w-0">
              <section className="mt-8 md:mt-0" aria-labelledby="recommendations-heading">
                <div id="recommendations-heading">
                  <HomeSectionHeader
                    title="Recomendações para você"
                    actionLabel="Ver tudo"
                    actionHref="/conteudos"
                  />
                </div>

                <div className="-mx-8 mt-7 flex gap-6 overflow-x-auto px-8 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
                  {content.recommendations.map((recommendation) => (
                    <RecommendationCard recommendation={recommendation} key={recommendation.id} />
                  ))}
                </div>
              </section>

              <section className="relative mt-5 md:mt-8">
                <CommunityPreviewCard onClick={onRedirectCommunity} community={content.community} />
                <Link
                  aria-label="Registrar sentimentos"
                  className="fixed bottom-24 right-6 z-30 grid size-16 place-items-center rounded-full bg-primary text-white shadow-[0_18px_38px_rgb(216_116_140_/_0.34)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:right-10"
                  href="/check-in"
                >
                  <Heart aria-hidden className="fill-white" size={31} strokeWidth={0} />
                </Link>
              </section>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </main>
  );
}
