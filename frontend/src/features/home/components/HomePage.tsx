"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import { HandHeart, Heart } from "lucide-react";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import { useStoredDailyCheckIns } from "@/features/check-in/hooks/useStoredDailyCheckIns";
import { communityPosts } from "@/features/community/data/community-posts";
import {
  COMMUNITY_CREATED_POSTS_UPDATED_EVENT,
  COMMUNITY_CREATED_POSTS_STORAGE_KEY,
  COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY,
  COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT,
} from "@/features/community/data/community-storage";
import { CommunityPreviewCard } from "@/features/home/components/CommunityPreviewCard";
import { EmotionChip } from "@/features/home/components/EmotionChip";
import { HelpRequestCard } from "@/features/home/components/HelpRequestCard";
import { HomeSectionHeader } from "@/features/home/components/HomeSectionHeader";
import { MentorImpactCard } from "@/features/home/components/MentorImpactCard";
import { MentorProfileBadge } from "@/features/home/components/MentorProfileBadge";
import { RecommendationCard } from "@/features/home/components/RecommendationCard";
import { WeeklyEmotionChartCard } from "@/features/home/components/WeeklyEmotionChartCard";
import { WeeklyInsightCard } from "@/features/home/components/WeeklyInsightCard";
import { getDailyRecommendationsForProfile } from "@/features/home/data/daily-recommendations";
import { homeContentByProfile } from "@/features/home/data/home-content";
import {
  buildProfessionalDashboardData,
  parseCreatedCommunityPosts,
  parseSupportedPostIds,
} from "@/features/home/data/professional-dashboard";
import { getWeeklyInsightFromCheckIns } from "@/features/home/data/weekly-insights";
import type { HomeProfile } from "@/features/home/types";
import { DailyCheckInNotificationModal } from "@/features/notifications/components/DailyCheckInNotificationModal";
import {
  getTodayNotificationPromptDate,
  markNotificationPromptSeenToday,
  requestDailyCheckInNotifications,
} from "@/features/notifications/data/notification-preferences";
import { useNotificationPreferences } from "@/features/notifications/hooks/useNotificationPreferences";
import {
  useStoredProfileValues,
  useStoredUserProfile,
} from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import { useRouter } from "next/navigation";

type HomePageProps = {
  profile?: HomeProfile;
};

function subscribeToCommunityActivityChanges(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);
  window.addEventListener(COMMUNITY_CREATED_POSTS_UPDATED_EVENT, onStoreChange);
  window.addEventListener(COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT, onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener(COMMUNITY_CREATED_POSTS_UPDATED_EVENT, onStoreChange);
    window.removeEventListener(COMMUNITY_SUPPORTED_POSTS_UPDATED_EVENT, onStoreChange);
  };
}

function getCreatedCommunityPostsSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(COMMUNITY_CREATED_POSTS_STORAGE_KEY) ?? "[]";
}

function getSupportedCommunityPostsSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(COMMUNITY_SUPPORTED_POSTS_STORAGE_KEY) ?? "[]";
}

function getCommunityStorageServerSnapshot() {
  return "[]";
}

function subscribeToDailyRecommendationDate(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const intervalId = window.setInterval(onStoreChange, 60 * 1000);
  window.addEventListener("focus", onStoreChange);

  return () => {
    window.clearInterval(intervalId);
    window.removeEventListener("focus", onStoreChange);
  };
}

function getDailyRecommendationDateSnapshot() {
  if (typeof window === "undefined") {
    return "1970-01-01";
  }

  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getDailyRecommendationDateServerSnapshot() {
  return "1970-01-01";
}

export function HomePage({ profile = "recent-mother" }: HomePageProps) {
  const content = homeContentByProfile[profile];
  const canUseCheckInRoutes = profile === "recent-mother";
  const storedProfile = useStoredProfileValues(profile);
  const storedUser = useStoredUserProfile(profile);
  const dailyCheckIns = useStoredDailyCheckIns();
  const { permission, preferences } = useNotificationPreferences();
  const isNotificationPromptOpen =
    canUseCheckInRoutes &&
    permission !== "unsupported" &&
    permission !== "denied" &&
    !preferences.dailyCheckInEnabled &&
    preferences.lastPromptDate !== getTodayNotificationPromptDate();
  const isHealthProfessionalDashboard = profile === "health-professional";
  const storedFirstName = storedProfile.fullName.trim().split(" ")[0] || content.firstName;
  const displayName = isHealthProfessionalDashboard ? `Dra. ${storedFirstName}` : storedFirstName;
  const weeklyInsight =
    content.variant === "wellbeing"
      ? getWeeklyInsightFromCheckIns(profile, content.insight, dailyCheckIns)
      : null;
  const createdCommunityPostsSnapshot = useSyncExternalStore(
    subscribeToCommunityActivityChanges,
    getCreatedCommunityPostsSnapshot,
    getCommunityStorageServerSnapshot
  );
  const supportedCommunityPostsSnapshot = useSyncExternalStore(
    subscribeToCommunityActivityChanges,
    getSupportedCommunityPostsSnapshot,
    getCommunityStorageServerSnapshot
  );
  const dailyRecommendationDateKey = useSyncExternalStore(
    subscribeToDailyRecommendationDate,
    getDailyRecommendationDateSnapshot,
    getDailyRecommendationDateServerSnapshot
  );
  const createdCommunityPosts = useMemo(
    () => parseCreatedCommunityPosts(createdCommunityPostsSnapshot),
    [createdCommunityPostsSnapshot]
  );
  const supportedPostIds = useMemo(
    () => parseSupportedPostIds(supportedCommunityPostsSnapshot),
    [supportedCommunityPostsSnapshot]
  );
  const communityFeedPosts = useMemo(
    () => [...createdCommunityPosts, ...communityPosts],
    [createdCommunityPosts]
  );
  const professionalDashboardData = useMemo(
    () =>
      buildProfessionalDashboardData({
        avatars: content.community.avatars,
        displayName,
        fallbackDisplayName: content.displayName,
        posts: communityFeedPosts,
        specialty: storedProfile.specialty,
        status: storedUser.professionalVerificationStatus,
        supportedPostIds,
      }),
    [
      communityFeedPosts,
      content,
      displayName,
      storedProfile.specialty,
      storedUser.professionalVerificationStatus,
      supportedPostIds,
    ]
  );
  const dailyRecommendations = useMemo(
    () =>
      content.variant === "wellbeing"
        ? getDailyRecommendationsForProfile(profile, dailyRecommendationDateKey)
        : [],
    [content.variant, dailyRecommendationDateKey, profile]
  );
  const professionalActivityHref = professionalDashboardData.recentPostId
    ? getProfileScopedHref(`/comunidade/${professionalDashboardData.recentPostId}`, profile)
    : getProfileScopedHref("/comunidade", profile);

  const router = useRouter();

  function onRedirectCommunity() {
    router.push(getProfileScopedHref("/comunidade", profile));
  }

  function onRedirectProfessionalActivity() {
    router.push(professionalActivityHref);
  }

  async function handleAllowNotifications() {
    await requestDailyCheckInNotifications();
  }

  function handleDismissNotifications() {
    markNotificationPromptSeenToday();
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-8 md:mt-6 md:h-20 md:rounded-[2rem] md:px-10 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <MaiaBrand imageClassName="size-14" imageSize={58} />
          <Link
            aria-label={`Perfil de ${storedProfile.fullName}`}
            className="size-[3.25rem] rounded-full border-[3px] border-primary bg-cover bg-center shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            href={getProfileScopedHref("/perfil", profile)}
            title={`Perfil de ${storedProfile.fullName}`}
            style={{
              backgroundImage: `url(${storedProfile.avatarUrl || content.avatarUrl})`,
            }}
          />
        </header>

        {content.variant === "mentor" ? (
          <div className="px-8 pb-8 pt-9 md:grid md:grid-cols-[minmax(0,25rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
            <div>
              <section aria-labelledby="home-title">
                <MentorProfileBadge
                  badge={
                    isHealthProfessionalDashboard ? professionalDashboardData.badge : content.badge
                  }
                  secondaryLabel={
                    isHealthProfessionalDashboard
                      ? professionalDashboardData.specialtyLabel
                      : content.secondaryLabel
                  }
                />

                <h1
                  className="mt-5 max-w-[22rem] font-title text-[2.12rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
                  id="home-title"
                >
                  Olá,{" "}
                  <span className="text-primary">{displayName}!</span>
                </h1>
                <p className="mt-7 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                  {content.intro}
                </p>
              </section>

              <section className="mt-8 md:mt-9">
                <MentorImpactCard
                  description={
                    isHealthProfessionalDashboard
                      ? `${professionalDashboardData.receivedSupportCount} ${
                          professionalDashboardData.receivedSupportCount === 1
                            ? "apoio recebido"
                            : "apoios recebidos"
                        } nos posts que você publicou.`
                      : content.impact.description
                  }
                  emptyMessage={
                    isHealthProfessionalDashboard
                      ? "Uma resposta cuidadosa já pode ajudar uma mãe hoje."
                      : undefined
                  }
                  label={isHealthProfessionalDashboard ? "Seu impacto" : content.impact.label}
                  secondaryLabel={
                    isHealthProfessionalDashboard ? "discussões em posts de mães" : undefined
                  }
                  secondaryValue={
                    isHealthProfessionalDashboard
                      ? professionalDashboardData.discussionCount
                      : undefined
                  }
                  value={
                    isHealthProfessionalDashboard
                      ? professionalDashboardData.participatedPostsCount
                      : content.impact.value
                  }
                  valueLabel={isHealthProfessionalDashboard ? "participações" : undefined}
                />
              </section>
            </div>

            <div className="md:min-w-0">
              <section className="mt-8 md:mt-0" aria-labelledby="help-requests-heading">
                <div id="help-requests-heading">
                  <HomeSectionHeader
                    title={isHealthProfessionalDashboard ? "Pedidos de ajuda" : "Pedidos de ajuda urgentes"}
                    actionLabel="Ver todos"
                    actionHref={getProfileScopedHref("/comunidade", profile)}
                  />
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2 lg:grid-cols-1">
                  {(isHealthProfessionalDashboard
                    ? professionalDashboardData.helpRequests
                    : content.helpRequests
                  ).map((request) => (
                    <HelpRequestCard
                      href={
                        isHealthProfessionalDashboard
                          ? getProfileScopedHref(`/comunidade/${request.id}`, profile)
                          : undefined
                      }
                      key={request.id}
                      request={request}
                    />
                  ))}
                </div>
              </section>

              <section className="relative mt-7 md:mt-8">
                <CommunityPreviewCard
                  onClick={
                    isHealthProfessionalDashboard
                      ? onRedirectProfessionalActivity
                      : onRedirectCommunity
                  }
                  community={
                    isHealthProfessionalDashboard
                      ? professionalDashboardData.community
                      : content.community
                  }
                />
                <Link
                  aria-label="Oferecer apoio"
                  className="fixed bottom-30 right-6 z-30 grid size-16 place-items-center rounded-full bg-primary text-white shadow-[0_18px_38px_rgb(216_116_140_/_0.34)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:right-6"
                  href={getProfileScopedHref("/comunidade", profile)}
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
                  Olá, <span className="text-primary">{storedFirstName}!</span>{" "}
                  {content.titleSuffix}
                </h1>
                <p className="mt-6 max-w-[20rem] text-[1.06rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                  {content.intro}
                </p>
              </section>

              {canUseCheckInRoutes ? (
              <section
                className="mt-7 flex flex-wrap gap-4 md:mt-8"
                aria-label="Check-in emocional rápido"
              >
                {content.emotions.map((emotion) => (
                  <EmotionChip emotion={emotion} key={emotion.id} />
                ))}
              </section>
              ) : null}

              {content.variant === "wellbeing" && canUseCheckInRoutes ? (
                <section className="mt-7 md:mt-8" aria-label="Gráfico emocional da semana">
                  <WeeklyEmotionChartCard records={dailyCheckIns} />
                </section>
              ) : null}

              <section className="mt-10 md:mt-9">
                <WeeklyInsightCard insight={weeklyInsight ?? content.insight} />
              </section>
            </div>

            <div className="md:min-w-0">
              <section className="mt-8 md:mt-0" aria-labelledby="recommendations-heading">
                <div id="recommendations-heading">
                  <HomeSectionHeader
                    title="Recomendações para você"
                    actionLabel="Ver tudo"
                    actionHref={getProfileScopedHref("/conteudos", profile)}
                  />
                </div>

                <div className="-mx-8 mt-7 flex gap-6 overflow-x-auto px-8 pb-3 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-2 md:overflow-visible md:px-0 md:pb-0 [&::-webkit-scrollbar]:hidden">
                  {dailyRecommendations.map((recommendation) => (
                    <RecommendationCard
                      key={recommendation.id}
                      profile={profile}
                      recommendation={recommendation}
                    />
                  ))}
                </div>
              </section>

              <section className="relative mt-5 md:mt-8">
                <CommunityPreviewCard onClick={onRedirectCommunity} community={content.community} />
                {canUseCheckInRoutes ? (
                  <Link
                    aria-label="Registrar sentimentos"
                    className="fixed bottom-30 right-6 z-30 grid size-16 place-items-center rounded-full bg-primary text-white shadow-[0_18px_38px_rgb(216_116_140_/_0.34)] transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary md:right-6"
                    href="/check-in"
                  >
                    <Heart aria-hidden className="fill-white" size={31} strokeWidth={0} />
                  </Link>
                ) : null}
              </section>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation profile={profile} />
      {isNotificationPromptOpen ? (
        <DailyCheckInNotificationModal
          onAllow={handleAllowNotifications}
          onDismiss={handleDismissNotifications}
        />
      ) : null}
    </main>
  );
}
