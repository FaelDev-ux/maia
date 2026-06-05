"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BarChart3, CalendarHeart } from "lucide-react";
import { checkInEmotionOptions } from "@/features/check-in/data/check-in-options";
import type { DailyCheckInRecord } from "@/features/check-in/types";
import cn from "@/lib/utils";

type WeeklyEmotionChartCardProps = {
  records: DailyCheckInRecord[];
};

const chartBarStyles = [
  "bg-primary",
  "bg-secondary",
  "bg-tertiary",
  "bg-primary-hover",
  "bg-info",
  "bg-success",
];

function getCurrentWeekRange() {
  const today = new Date();
  const weekStart = new Date(today);
  const daysSinceMonday = (today.getDay() + 6) % 7;

  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() - daysSinceMonday);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return { weekEnd, weekStart };
}

function getWeeklyEmotionSummary(records: DailyCheckInRecord[]) {
  const { weekEnd, weekStart } = getCurrentWeekRange();
  const countsByEmotion = new Map<string, number>();

  records.forEach((record) => {
    const createdAt = new Date(record.createdAt);

    if (Number.isNaN(createdAt.getTime()) || createdAt < weekStart || createdAt > weekEnd) {
      return;
    }

    countsByEmotion.set(record.emotionId, (countsByEmotion.get(record.emotionId) ?? 0) + 1);
  });

  return checkInEmotionOptions
    .map((emotion) => ({
      count: countsByEmotion.get(emotion.id) ?? 0,
      emotion,
    }))
    .filter((item) => item.count > 0)
    .sort((current, next) => next.count - current.count);
}

export function WeeklyEmotionChartCard({ records }: WeeklyEmotionChartCardProps) {
  const shouldReduceMotion = useReducedMotion();
  const summary = getWeeklyEmotionSummary(records);
  const maxCount = Math.max(...summary.map((item) => item.count), 1);
  const hasCheckInsThisWeek = summary.length > 0;

  return (
    <article
      aria-labelledby="weekly-emotion-chart-title"
      className="rounded-[2.35rem] bg-white px-6 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/60 md:px-8 md:py-8"
    >
      <div className="flex items-start gap-4">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
          <BarChart3 aria-hidden size={22} strokeWidth={2.4} />
        </span>

        <div className="min-w-0">
          <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-secondary">
            Semana emocional
          </p>
          <h2
            className="mt-1 font-title text-xl font-extrabold leading-tight text-title"
            id="weekly-emotion-chart-title"
          >
            Sentimentos registrados
          </h2>
          <p className="mt-2 text-sm leading-6 text-text">
            Veja quantas vezes cada emoção apareceu nos seus check-ins desta semana.
          </p>
        </div>
      </div>

      {hasCheckInsThisWeek ? (
        <div className="mt-6 space-y-4" role="list">
          {summary.map((item, index) => {
            const Icon = item.emotion.icon;
            const percentage = item.count / maxCount;

            return (
              <div className="grid gap-2" key={item.emotion.id} role="listitem">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-9 shrink-0 place-items-center rounded-full bg-surface text-secondary">
                      <Icon aria-hidden size={17} strokeWidth={2.3} />
                    </span>
                    <span className="truncate text-sm font-bold text-title">
                      {item.emotion.label}
                    </span>
                  </div>

                  <span className="shrink-0 rounded-full bg-primary/10 px-3 py-1 text-xs font-extrabold text-primary">
                    {item.count} {item.count === 1 ? "vez" : "vezes"}
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-surface/80">
                  <motion.div
                    aria-label={`${item.emotion.label}: ${item.count} ${
                      item.count === 1 ? "vez" : "vezes"
                    } nesta semana`}
                    className={cn(
                      "h-full rounded-full shadow-[0_8px_16px_rgb(216_116_140_/_0.2)]",
                      chartBarStyles[index % chartBarStyles.length]
                    )}
                    initial={shouldReduceMotion ? false : { scaleX: 0 }}
                    animate={{ scaleX: percentage }}
                    style={{ transformOrigin: "left center" }}
                    transition={{ delay: index * 0.08, duration: 0.55, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="mt-6 rounded-[1.6rem] bg-surface/75 px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-primary shadow-[0_10px_24px_rgb(140_64_84_/_0.08)]">
              <CalendarHeart aria-hidden size={20} strokeWidth={2.3} />
            </span>
            <div>
              <p className="font-title text-base font-extrabold leading-tight text-title">
                Ainda não há check-ins nesta semana
              </p>
              <p className="mt-2 text-sm leading-6 text-text">
                Quando você registrar seu primeiro check-in, o gráfico aparece aqui.
              </p>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
