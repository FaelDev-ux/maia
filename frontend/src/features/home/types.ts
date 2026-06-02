import type { ComponentType, SVGProps } from "react";

export type EmotionOption = {
  id: string;
  emoji: string;
  label: string;
};

export type WeeklyInsight = {
  eyebrow: string;
  message: string;
};

export type Recommendation = {
  id: string;
  contentId: string;
  title: string;
  description: string;
  duration: string;
  imageUrl: string;
};

export type CommunityPreview = {
  title: string;
  topic: string;
  activeMothers: number;
  avatars: string[];
};

export type HelpRequest = {
  id: string;
  title: string;
  timeAgo: string;
  category: string;
  message: string;
  urgent?: boolean;
};

type HomeBaseContent = {
  firstName: string;
  displayName?: string;
  avatarLabel: string;
  avatarUrl: string;
  titleSuffix: string;
  intro: string;
};

export type HomeProfile =
  | "recent-mother"
  | "future-mother"
  | "experienced-mother"
  | "health-professional";

export type HomeWellbeingContent = HomeBaseContent & {
  variant: "wellbeing";
  emotions: EmotionOption[];
  insight: WeeklyInsight;
  recommendations: Recommendation[];
  community: CommunityPreview;
};

export type HomeMentorContent = HomeBaseContent & {
  variant: "mentor";
  badge: string;
  secondaryLabel: string;
  impact: {
    label: string;
    value: number;
    description: string;
  };
  helpRequests: HelpRequest[];
  community: CommunityPreview;
};

export type HomeContent = HomeWellbeingContent | HomeMentorContent;

export type HomeNavigationItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};
