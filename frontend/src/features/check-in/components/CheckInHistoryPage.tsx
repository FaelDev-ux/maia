"use client";

import Link from "next/link";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  ClipboardEdit,
  Save,
  Sparkles,
} from "lucide-react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import {
  checkInEmotionOptions,
  checkInIntensityOptions,
  getCheckInEmotionLabel,
  secondaryEmotionOptions,
  sleepQualityOptions,
  supportOptions,
} from "@/features/check-in/data/check-in-options";
import {
  getDailyCheckInDateKey,
  getTodayDateKey,
  updateDailyCheckIn,
} from "@/features/check-in/data/check-in-storage";
import { useStoredDailyCheckIns } from "@/features/check-in/hooks/useStoredDailyCheckIns";
import type { DailyCheckInRecord } from "@/features/check-in/types";
import type { HomeProfile } from "@/features/home/types";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import { checkInSchema, type CheckInFormData } from "@/schemas/check-in.schema";
import cn from "@/lib/utils";

type CalendarDay = {
  date: Date;
  dateKey: string;
  dayNumber: number;
  isCurrentMonth: boolean;
};

type CheckInEditFormProps = {
  onCancel: () => void;
  onSave: (record: DailyCheckInRecord) => void;
  record: DailyCheckInRecord;
};

type CheckInHistoryPageProps = {
  profile: HomeProfile;
};

const selectedPillClasses =
  "bg-primary text-white ring-primary hover:bg-white hover:text-primary hover:ring-primary";

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getInitialMonthDate() {
  const today = new Date();

  return new Date(today.getFullYear(), today.getMonth(), 1);
}

function getMonthLabel(monthDate: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    month: "long",
    year: "numeric",
  }).format(monthDate);
}

function getReadableDate(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);

  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, day));
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDate = new Date(firstDay);
  startDate.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index): CalendarDay => {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + index);

    return {
      date,
      dateKey: formatDateKey(date),
      dayNumber: date.getDate(),
      isCurrentMonth: date.getMonth() === month,
    };
  });
}

function getRecordMap(records: DailyCheckInRecord[]) {
  return new Map(records.map((record) => [getDailyCheckInDateKey(record.createdAt), record]));
}

function getSleepQualityLabel(value: DailyCheckInRecord["sleepQuality"]) {
  return sleepQualityOptions.find((option) => option.id === value)?.label ?? "Sono";
}

function getSupportLabel(value: DailyCheckInRecord["receivedSupport"]) {
  return supportOptions.find((option) => option.id === value)?.label ?? "Apoio";
}

function getSecondaryEmotionLabels(ids: string[]) {
  return ids
    .map((id) => secondaryEmotionOptions.find((option) => option.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

function CheckInEditForm({ onCancel, onSave, record }: CheckInEditFormProps) {
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    setValue,
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      emotionId: record.emotionId,
      intensity: record.intensity,
      secondaryEmotionIds: record.secondaryEmotionIds,
      sleepQuality: record.sleepQuality,
      receivedSupport: record.receivedSupport,
      note: record.note ?? "",
    },
  });
  const selectedEmotionId = useWatch({ control, name: "emotionId" });
  const selectedSecondaryEmotionIds = useWatch({ control, name: "secondaryEmotionIds" }) ?? [];
  const selectedSleepQuality = useWatch({ control, name: "sleepQuality" });
  const selectedSupport = useWatch({ control, name: "receivedSupport" });

  function toggleSecondaryEmotion(optionId: string) {
    const hasOption = selectedSecondaryEmotionIds.includes(optionId);
    const nextOptions = hasOption
      ? selectedSecondaryEmotionIds.filter((currentId) => currentId !== optionId)
      : [...selectedSecondaryEmotionIds, optionId].slice(0, 4);

    setValue("secondaryEmotionIds", nextOptions, { shouldDirty: true, shouldValidate: true });
  }

  function handleSave(data: CheckInFormData) {
    onSave({
      ...record,
      emotionId: data.emotionId,
      intensity: data.intensity,
      secondaryEmotionIds: data.secondaryEmotionIds,
      sleepQuality: data.sleepQuality,
      receivedSupport: data.receivedSupport,
      note: data.note?.trim() || undefined,
    });
  }

  return (
    <form
      className="mt-6 rounded-[1.7rem] bg-background px-4 py-5"
      onSubmit={handleSubmit(handleSave)}
    >
      <input type="hidden" {...register("emotionId")} />
      <input type="hidden" {...register("sleepQuality")} />
      <input type="hidden" {...register("receivedSupport")} />

      <fieldset>
        <legend className="text-sm font-extrabold text-title">Emoção principal</legend>
        <div className="mt-3 grid grid-cols-2 gap-2">
          {checkInEmotionOptions.map((option) => {
            const Icon = option.icon;
            const isSelected = selectedEmotionId === option.id;

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  "group min-h-20 rounded-[1.15rem] bg-white px-3 py-3 text-left text-sm font-extrabold text-title ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isSelected && "bg-primary/10 ring-primary/45"
                )}
                key={option.id}
                onClick={() =>
                  setValue("emotionId", option.id, { shouldDirty: true, shouldValidate: true })
                }
                type="button"
              >
                <span
                  className={cn(
                    "grid size-8 place-items-center rounded-full bg-background text-primary",
                    isSelected &&
                      "bg-primary text-white group-hover:bg-white group-hover:text-primary group-hover:ring-1 group-hover:ring-primary"
                  )}
                >
                  <Icon aria-hidden size={16} strokeWidth={2.4} />
                </span>
                <span className="mt-2 block">{option.label}</span>
              </button>
            );
          })}
        </div>
        {errors.emotionId ? (
          <p className="mt-2 text-xs font-semibold text-danger">{errors.emotionId.message}</p>
        ) : null}
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-extrabold text-title">Intensidade</legend>
        <Controller
          control={control}
          name="intensity"
          render={({ field }) => (
            <div className="mt-3 grid grid-cols-5 gap-2">
              {checkInIntensityOptions.map((option) => {
                const isSelected = field.value === option.value;

                return (
                  <button
                    aria-label={`Intensidade ${option.label}: ${option.description}`}
                    aria-pressed={isSelected}
                    className={cn(
                      "grid aspect-square place-items-center rounded-full bg-white font-title text-base font-extrabold text-title ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                      isSelected && selectedPillClasses
                    )}
                    key={option.value}
                    onClick={() => field.onChange(option.value)}
                    type="button"
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          )}
        />
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-sm font-extrabold text-title">Sentimentos de apoio</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {secondaryEmotionOptions.map((option) => {
            const isSelected = selectedSecondaryEmotionIds.includes(option.id);

            return (
              <button
                aria-pressed={isSelected}
                className={cn(
                  "h-10 rounded-full bg-white px-4 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  isSelected && selectedPillClasses
                )}
                key={option.id}
                onClick={() => toggleSecondaryEmotion(option.id)}
                type="button"
              >
                {option.label}
              </button>
            );
          })}
        </div>
      </fieldset>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <fieldset>
          <legend className="text-sm font-extrabold text-title">Sono</legend>
          <div className="mt-3 grid gap-2">
            {sleepQualityOptions.map((option) => (
              <button
                aria-pressed={selectedSleepQuality === option.id}
                className={cn(
                  "h-10 rounded-full bg-white px-3 text-xs font-extrabold text-text ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  selectedSleepQuality === option.id && selectedPillClasses
                )}
                key={option.id}
                onClick={() =>
                  setValue("sleepQuality", option.id as CheckInFormData["sleepQuality"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend className="text-sm font-extrabold text-title">Apoio</legend>
          <div className="mt-3 grid gap-2">
            {supportOptions.map((option) => (
              <button
                aria-pressed={selectedSupport === option.id}
                className={cn(
                  "h-10 rounded-full bg-white px-3 text-xs font-extrabold text-text ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                  selectedSupport === option.id && selectedPillClasses
                )}
                key={option.id}
                onClick={() =>
                  setValue("receivedSupport", option.id as CheckInFormData["receivedSupport"], {
                    shouldDirty: true,
                    shouldValidate: true,
                  })
                }
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>
      </div>

      <label className="mt-5 block">
        <span className="text-sm font-extrabold text-title">Observação</span>
        <textarea
          className="mt-2 min-h-24 w-full resize-none rounded-[1.2rem] border border-border bg-white px-4 py-3 text-sm leading-6 text-title outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
          maxLength={280}
          placeholder="Atualize este registro de hoje, se quiser."
          {...register("note")}
        />
      </label>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button
          className="inline-flex min-h-[3.2rem] items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
          disabled={isSubmitting}
          type="submit"
        >
          <Save aria-hidden size={16} strokeWidth={2.4} />
          Salvar edição
        </button>
        <button
          className="inline-flex min-h-[3.2rem] items-center justify-center rounded-full bg-white px-5 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={onCancel}
          type="button"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}

export function CheckInHistoryPage({ profile }: CheckInHistoryPageProps) {
  const storedProfile = useStoredProfileValues(profile);
  const [todayKey] = useState(getTodayDateKey);
  const records = useStoredDailyCheckIns();
  const [monthDate, setMonthDate] = useState(getInitialMonthDate);
  const [selectedDateKey, setSelectedDateKey] = useState(todayKey);
  const [isEditing, setIsEditing] = useState(false);
  const [lockedNotice, setLockedNotice] = useState(false);
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = storedProfile.avatarUrl;
  const recordMap = getRecordMap(records);
  const selectedRecord = recordMap.get(selectedDateKey);
  const selectedDayIsToday = selectedDateKey === todayKey;
  const calendarDays = getCalendarDays(monthDate);
  const secondaryLabels = selectedRecord
    ? getSecondaryEmotionLabels(selectedRecord.secondaryEmotionIds)
    : [];

  function handleSelectDay(dateKey: string) {
    setSelectedDateKey(dateKey);
    setIsEditing(false);
    setLockedNotice(false);
  }

  function handleChangeMonth(direction: "previous" | "next") {
    setMonthDate((currentMonthDate) => {
      const nextMonthDate = new Date(currentMonthDate);
      nextMonthDate.setMonth(currentMonthDate.getMonth() + (direction === "next" ? 1 : -1));

      return nextMonthDate;
    });
    setIsEditing(false);
    setLockedNotice(false);
  }

  function handleRequestEdit() {
    if (selectedDayIsToday) {
      setIsEditing(true);
      setLockedNotice(false);
      return;
    }

    setLockedNotice(true);
  }

  function handleSaveEdit(record: DailyCheckInRecord) {
    updateDailyCheckIn(record);
    setIsEditing(false);
    setLockedNotice(false);
  }

  return (
    <main className="min-h-dvh bg-background text-text">
      <div className="mx-auto min-h-dvh w-full max-w-[26rem] overflow-hidden pb-[7.5rem] md:max-w-[72rem] md:overflow-visible md:px-8 md:pb-32 lg:px-10">
        <header className="flex h-[4.4rem] items-center justify-between bg-white px-6 md:mt-6 md:h-20 md:rounded-[2rem] md:px-8 md:shadow-[0_12px_36px_rgb(140_64_84_/_0.08)]">
          <Link
            aria-label="Voltar para home"
            className="grid size-11 place-items-center rounded-full bg-primary/10 text-primary transition hover:bg-primary/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            href={getProfileScopedHref("/home", profile)}
          >
            <ArrowLeft aria-hidden size={21} strokeWidth={2.4} />
          </Link>

          <MaiaBrand imageClassName="size-13" imageSize={54} textClassName="text-2xl" />

          <div
            aria-label={`Perfil de ${firstName}`}
            className="grid size-11 place-items-center rounded-full border-[3px] border-primary bg-primary/10 bg-cover bg-center font-title text-base font-extrabold text-primary shadow-[0_8px_20px_rgb(140_64_84_/_0.14)]"
            role="img"
            style={avatarUrl ? { backgroundImage: `url(${avatarUrl})` } : undefined}
          >
            {avatarUrl ? null : avatarInitial}
          </div>
        </header>

        <div className="px-6 pb-8 pt-7 md:grid md:grid-cols-[minmax(0,24rem)_minmax(0,1fr)] md:items-start md:gap-10 md:px-0 md:pt-10 lg:gap-12">
          <div>
            <section aria-labelledby="history-title">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                <CalendarDays aria-hidden size={14} strokeWidth={2.4} />
                Histórico
              </p>
              <h1
                className="mt-5 max-w-[22rem] font-title text-[2.15rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
                id="history-title"
              >
                Sua jornada emocional
              </h1>
              <p className="mt-5 max-w-[21rem] text-[1.02rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                Toque em um dia para rever como você se sentiu naquele momento.
              </p>
            </section>

            <section className="mt-7 rounded-[2rem] bg-white px-5 py-5 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:mt-9">
              <div className="flex items-center justify-between gap-3">
                <button
                  aria-label="Mês anterior"
                  className="grid size-10 place-items-center rounded-full bg-background text-text ring-1 ring-border transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => handleChangeMonth("previous")}
                  type="button"
                >
                  <ChevronLeft aria-hidden size={18} strokeWidth={2.4} />
                </button>
                <h2 className="text-center font-title text-lg font-extrabold capitalize text-title">
                  {getMonthLabel(monthDate)}
                </h2>
                <button
                  aria-label="Próximo mês"
                  className="grid size-10 place-items-center rounded-full bg-background text-text ring-1 ring-border transition hover:bg-primary/10 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                  onClick={() => handleChangeMonth("next")}
                  type="button"
                >
                  <ChevronRight aria-hidden size={18} strokeWidth={2.4} />
                </button>
              </div>

              <div className="mt-5 grid grid-cols-7 gap-2 text-center text-[0.68rem] font-extrabold uppercase tracking-[0.08em] text-text/60">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((weekday, index) => (
                  <span key={`${weekday}-${index}`}>{weekday}</span>
                ))}
              </div>

              <div className="mt-3 grid grid-cols-7 gap-2">
                {calendarDays.map((day) => {
                  const record = recordMap.get(day.dateKey);
                  const isSelected = selectedDateKey === day.dateKey;
                  const isToday = todayKey === day.dateKey;

                  return (
                    <button
                      aria-label={`${day.dayNumber} de ${getMonthLabel(day.date)}${
                        record ? ", com check-in" : ""
                      }`}
                      aria-pressed={isSelected}
                      className={cn(
                        "relative grid aspect-square place-items-center rounded-[1rem] bg-background text-sm font-extrabold text-title ring-1 ring-transparent transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        !day.isCurrentMonth && "text-text/35",
                        isSelected &&
                          "bg-primary text-white ring-primary hover:bg-white hover:text-primary",
                        isToday && !isSelected && "ring-primary/35"
                      )}
                      key={day.dateKey}
                      onClick={() => handleSelectDay(day.dateKey)}
                      type="button"
                    >
                      {day.dayNumber}
                      {record ? (
                        <span
                          aria-hidden
                          className={cn(
                            "absolute bottom-1.5 size-1.5 rounded-full bg-primary",
                            isSelected && "bg-white"
                          )}
                        />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </section>
          </div>

          <section className="mt-7 rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:mt-0 md:px-7">
            <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
              {getReadableDate(selectedDateKey)}
            </p>

            {selectedRecord ? (
              <>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="font-title text-2xl font-extrabold leading-tight text-title">
                      {getCheckInEmotionLabel(selectedRecord.emotionId)}
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-text">
                      Intensidade {selectedRecord.intensity}/5
                    </p>
                  </div>
                  <span className="grid size-14 shrink-0 place-items-center rounded-full bg-primary/10 font-title text-xl font-extrabold text-primary ring-1 ring-primary/20">
                    {selectedRecord.intensity}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.35rem] bg-background px-4 py-4">
                    <p className="text-xs font-bold text-text/70">Sono</p>
                    <p className="mt-1 text-sm font-extrabold text-title">
                      {getSleepQualityLabel(selectedRecord.sleepQuality)}
                    </p>
                  </div>
                  <div className="rounded-[1.35rem] bg-background px-4 py-4">
                    <p className="text-xs font-bold text-text/70">Apoio recebido</p>
                    <p className="mt-1 text-sm font-extrabold text-title">
                      {getSupportLabel(selectedRecord.receivedSupport)}
                    </p>
                  </div>
                </div>

                {secondaryLabels.length > 0 ? (
                  <div className="mt-5">
                    <p className="text-xs font-extrabold uppercase tracking-[0.1em] text-primary">
                      Também apareceu
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {secondaryLabels.map((label) => (
                        <span
                          className="rounded-full bg-primary/10 px-3 py-1.5 text-xs font-extrabold text-primary"
                          key={label}
                        >
                          {label}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {selectedRecord.note ? (
                  <p className="mt-5 rounded-[1.35rem] bg-background px-4 py-4 text-sm leading-6 text-text">
                    {selectedRecord.note}
                  </p>
                ) : null}

                {lockedNotice ? (
                  <div className="mt-5 rounded-[1.35rem] bg-tertiary/10 px-4 py-4 text-sm font-semibold leading-6 text-text ring-1 ring-tertiary/15">
                    Esse registro foi preservado para representar como você estava naquele momento
                    💜
                  </div>
                ) : null}

                {isEditing ? (
                  <CheckInEditForm
                    key={selectedRecord.id}
                    onCancel={() => setIsEditing(false)}
                    onSave={handleSaveEdit}
                    record={selectedRecord}
                  />
                ) : (
                  <button
                    className="mt-6 inline-flex min-h-[3.5rem] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    onClick={handleRequestEdit}
                    type="button"
                  >
                    <ClipboardEdit aria-hidden size={17} strokeWidth={2.3} />
                    Editar registro
                  </button>
                )}
              </>
            ) : (
              <div className="mt-5 rounded-[1.7rem] bg-background px-5 py-6 text-center">
                <Sparkles
                  aria-hidden
                  className="mx-auto text-primary"
                  size={28}
                  strokeWidth={2.2}
                />
                <h2 className="mt-4 font-title text-xl font-extrabold text-title">
                  Sem check-in neste dia
                </h2>
                <p className="mt-3 text-sm leading-6 text-text">
                  Quando você registrar um momento, ele aparecerá aqui no calendário.
                </p>
                {selectedDayIsToday ? (
                  <Link
                    className="mt-5 inline-flex min-h-[3.25rem] items-center justify-center rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                    href={getProfileScopedHref("/check-in", profile)}
                  >
                    Registrar hoje
                  </Link>
                ) : null}
              </div>
            )}
          </section>
        </div>
      </div>

      <BottomNavigation profile={profile} />
    </main>
  );
}
