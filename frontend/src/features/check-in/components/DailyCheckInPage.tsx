"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, ClipboardList, History, Home, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import logoMaia from "@/../public/images/logo-maia.png";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import {
  checkInEmotionOptions,
  checkInIntensityOptions,
  getCheckInEmotionLabel,
  isCheckInEmotionId,
  secondaryEmotionOptions,
  sleepQualityOptions,
  supportOptions,
} from "@/features/check-in/data/check-in-options";
import {
  DAILY_CHECK_INS_STORAGE_KEY,
  getDailyCheckInDateKey,
  getTodayDateKey,
  saveDailyCheckIn,
} from "@/features/check-in/data/check-in-storage";
import type { DailyCheckInRecord } from "@/features/check-in/types";
import type { HomeProfile } from "@/features/home/types";
import { useStoredProfileValues } from "@/features/profile/hooks/useStoredProfileValues";
import { getProfileScopedHref } from "@/features/profile/utils/profile-routing";
import { checkInSchema, type CheckInFormData } from "@/schemas/check-in.schema";
import cn from "@/lib/utils";

type DailyCheckInPageProps = {
  initialEmotionId?: string;
  profile: HomeProfile;
};

function getDefaultEmotionId(initialEmotionId?: string) {
  return isCheckInEmotionId(initialEmotionId) ? initialEmotionId : "";
}

function createDailyCheckInRecord(data: CheckInFormData): DailyCheckInRecord {
  const createdAt = new Date().toISOString();

  return {
    id: `daily-check-in-${createdAt}`,
    createdAt,
    emotionId: data.emotionId,
    intensity: data.intensity,
    secondaryEmotionIds: data.secondaryEmotionIds,
    sleepQuality: data.sleepQuality,
    receivedSupport: data.receivedSupport,
    note: data.note?.trim() || undefined,
  };
}

const selectedPillClasses =
  "bg-primary text-white ring-primary hover:bg-white hover:text-primary hover:ring-primary";

function subscribeToStoredCheckIns(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener("storage", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
  };
}

function getStoredCheckInsSnapshot() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem(DAILY_CHECK_INS_STORAGE_KEY) ?? "";
}

function getStoredCheckInsServerSnapshot() {
  return "";
}

function getDailyCheckInByDateFromSnapshot(snapshot: string, dateKey: string) {
  if (!snapshot) {
    return null;
  }

  try {
    const records = JSON.parse(snapshot) as unknown;

    if (!Array.isArray(records)) {
      return null;
    }

    const dailyCheckInRecords = records as DailyCheckInRecord[];

    return (
      dailyCheckInRecords.find((record) => getDailyCheckInDateKey(record.createdAt) === dateKey) ??
      null
    );
  } catch {
    return null;
  }
}

export function DailyCheckInPage({ initialEmotionId, profile }: DailyCheckInPageProps) {
  const router = useRouter();
  const storedProfile = useStoredProfileValues(profile);
  const [todayDateKey] = useState(getTodayDateKey);
  const [savedRecord, setSavedRecord] = useState<DailyCheckInRecord | null>(null);
  const [modalCountdown, setModalCountdown] = useState(10);
  const storedCheckInsSnapshot = useSyncExternalStore(
    subscribeToStoredCheckIns,
    getStoredCheckInsSnapshot,
    getStoredCheckInsServerSnapshot
  );
  const existingTodayRecord = savedRecord
    ? null
    : getDailyCheckInByDateFromSnapshot(storedCheckInsSnapshot, todayDateKey);
  const statusModalType = existingTodayRecord ? "existing" : savedRecord ? "saved" : null;
  const statusModalIsExisting = statusModalType === "existing";
  const statusModalRedirectHref = getProfileScopedHref(
    statusModalIsExisting ? "/historico" : "/home",
    profile
  );
  const StatusModalIcon = statusModalIsExisting ? History : Save;
  const firstName = storedProfile.fullName.split(" ")[0] ?? "Maia";
  const avatarInitial = firstName.charAt(0).toUpperCase();
  const avatarUrl = storedProfile.avatarUrl;
  const {
    control,
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
    setValue,
  } = useForm<CheckInFormData>({
    resolver: zodResolver(checkInSchema),
    defaultValues: {
      emotionId: getDefaultEmotionId(initialEmotionId),
      intensity: 3,
      secondaryEmotionIds: [],
      sleepQuality: "medium",
      receivedSupport: "partly",
      note: "",
    },
  });
  const selectedEmotionId = useWatch({ control, name: "emotionId" });
  const selectedIntensity = useWatch({ control, name: "intensity" });
  const selectedSecondaryEmotionIds = useWatch({ control, name: "secondaryEmotionIds" }) ?? [];
  const selectedSleepQuality = useWatch({ control, name: "sleepQuality" });
  const selectedSupport = useWatch({ control, name: "receivedSupport" });
  const selectedEmotionLabel = selectedEmotionId
    ? getCheckInEmotionLabel(selectedEmotionId)
    : "Escolha uma emoção";

  useEffect(() => {
    if (!statusModalType) {
      return;
    }

    const countdownInterval = window.setInterval(() => {
      setModalCountdown((currentValue) => Math.max(currentValue - 1, 0));
    }, 1000);
    const redirectTimeout = window.setTimeout(() => {
      router.push(statusModalRedirectHref);
    }, 10000);

    return () => {
      window.clearInterval(countdownInterval);
      window.clearTimeout(redirectTimeout);
    };
  }, [router, statusModalRedirectHref, statusModalType]);

  function toggleSecondaryEmotion(optionId: string) {
    const hasOption = selectedSecondaryEmotionIds.includes(optionId);
    const nextOptions = hasOption
      ? selectedSecondaryEmotionIds.filter((currentId) => currentId !== optionId)
      : [...selectedSecondaryEmotionIds, optionId].slice(0, 4);

    setValue("secondaryEmotionIds", nextOptions, { shouldDirty: true, shouldValidate: true });
  }

  function handleSave(data: CheckInFormData) {
    const record = createDailyCheckInRecord(data);

    saveDailyCheckIn(record);
    setModalCountdown(10);
    setSavedRecord(record);
    reset({
      ...data,
      note: "",
    });
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

          <Image
            src={logoMaia}
            alt="Maia"
            width={54}
            height={54}
            className="size-13 object-contain"
            priority
          />

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
            <section aria-labelledby="check-in-title">
              <p className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                <ClipboardList aria-hidden size={14} strokeWidth={2.4} />
                Check-in diário
              </p>
              <h1
                className="mt-5 max-w-[22rem] font-title text-[2.15rem] font-extrabold leading-[1.12] text-title md:max-w-[24rem] md:text-[2.55rem] md:leading-[1.08]"
                id="check-in-title"
              >
                Como você está agora?
              </h1>
              <p className="mt-5 max-w-[21rem] text-[1.02rem] leading-8 text-text md:max-w-[23rem] md:text-lg">
                Registre este momento em poucos toques. Esses dados ficarão no histórico local e
                poderão apoiar recomendações no futuro.
              </p>
            </section>

            <section
              aria-live="polite"
              className="mt-7 rounded-[2rem] bg-white px-5 py-5 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:mt-9"
            >
              <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">
                Resumo
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-[1.35rem] bg-background px-4 py-4">
                  <p className="text-xs font-bold text-text/70">Emoção</p>
                  <p className="mt-1 font-title text-lg font-extrabold text-title">
                    {selectedEmotionLabel}
                  </p>
                </div>
                <div className="rounded-[1.35rem] bg-background px-4 py-4">
                  <p className="text-xs font-bold text-text/70">Intensidade</p>
                  <p className="mt-1 font-title text-lg font-extrabold text-title">
                    {selectedIntensity}/5
                  </p>
                </div>
              </div>
            </section>
          </div>

          <form
            className="mt-7 rounded-[2rem] bg-white px-5 py-6 shadow-[0_18px_52px_rgb(140_64_84_/_0.1)] ring-1 ring-border/65 md:mt-0 md:px-7"
            onSubmit={handleSubmit(handleSave)}
          >
            <input type="hidden" {...register("emotionId")} />
            <input type="hidden" {...register("sleepQuality")} />
            <input type="hidden" {...register("receivedSupport")} />

            <fieldset>
              <legend className="font-title text-xl font-extrabold text-title">
                Escolha a emoção principal
              </legend>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {checkInEmotionOptions.map((option) => {
                  const Icon = option.icon;
                  const isSelected = selectedEmotionId === option.id;

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "group min-h-28 rounded-[1.45rem] bg-background px-4 py-4 text-left ring-1 ring-border transition hover:-translate-y-0.5 hover:bg-primary/5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        isSelected && "bg-primary/10 ring-primary/45"
                      )}
                      key={option.id}
                      onClick={() =>
                        setValue("emotionId", option.id, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                      type="button"
                    >
                      <span
                        className={cn(
                          "grid size-10 place-items-center rounded-full bg-white text-primary shadow-[0_8px_18px_rgb(140_64_84_/_0.08)]",
                          isSelected &&
                            "bg-primary text-white group-hover:bg-white group-hover:text-primary group-hover:ring-1 group-hover:ring-primary"
                        )}
                      >
                        <Icon aria-hidden size={19} strokeWidth={2.4} />
                      </span>
                      <span className="mt-3 block text-sm font-extrabold text-title">
                        {option.label}
                      </span>
                      <span className="mt-1 block text-xs leading-5 text-text">
                        {option.description}
                      </span>
                    </button>
                  );
                })}
              </div>
              {errors.emotionId ? (
                <p className="mt-3 text-xs font-semibold text-danger">{errors.emotionId.message}</p>
              ) : null}
            </fieldset>

            <fieldset className="mt-7">
              <legend className="font-title text-xl font-extrabold text-title">Intensidade</legend>
              <p className="mt-2 text-sm leading-6 text-text">
                Marque de 1 a 5 para registrar como esse sentimento chegou hoje.
              </p>
              <Controller
                control={control}
                name="intensity"
                render={({ field }) => (
                  <div className="mt-4 grid grid-cols-5 gap-2">
                    {checkInIntensityOptions.map((option) => {
                      const isSelected = field.value === option.value;

                      return (
                        <button
                          aria-label={`Intensidade ${option.label}: ${option.description}`}
                          aria-pressed={isSelected}
                          className={cn(
                            "grid aspect-square place-items-center rounded-full bg-background font-title text-lg font-extrabold text-title ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
              <p className="mt-3 text-center text-xs font-bold text-text/70">
                {checkInIntensityOptions.find((option) => option.value === selectedIntensity)
                  ?.description ?? "Moderada"}
              </p>
            </fieldset>

            <fieldset className="mt-7">
              <legend className="font-title text-lg font-extrabold text-title">
                Algo mais apareceu?
              </legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {secondaryEmotionOptions.map((option) => {
                  const isSelected = selectedSecondaryEmotionIds.includes(option.id);

                  return (
                    <button
                      aria-pressed={isSelected}
                      className={cn(
                        "h-10 rounded-full bg-background px-4 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
              {errors.secondaryEmotionIds ? (
                <p className="mt-3 text-xs font-semibold text-danger">
                  {errors.secondaryEmotionIds.message}
                </p>
              ) : null}
            </fieldset>

            <div className="mt-7 grid gap-5 md:grid-cols-2">
              <fieldset>
                <legend className="text-sm font-extrabold text-title">Sono</legend>
                <div className="mt-3 grid gap-2">
                  {sleepQualityOptions.map((option) => (
                    <button
                      aria-pressed={selectedSleepQuality === option.id}
                      className={cn(
                        "h-11 rounded-full bg-background px-4 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
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
                <legend className="text-sm font-extrabold text-title">Apoio hoje</legend>
                <div className="mt-3 grid gap-2">
                  {supportOptions.map((option) => (
                    <button
                      aria-pressed={selectedSupport === option.id}
                      className={cn(
                        "h-11 rounded-full bg-background px-4 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-primary/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
                        selectedSupport === option.id && selectedPillClasses
                      )}
                      key={option.id}
                      onClick={() =>
                        setValue(
                          "receivedSupport",
                          option.id as CheckInFormData["receivedSupport"],
                          {
                            shouldDirty: true,
                            shouldValidate: true,
                          }
                        )
                      }
                      type="button"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            </div>

            <label className="mt-7 block">
              <span className="text-sm font-extrabold text-title">Observação opcional</span>
              <textarea
                className="mt-2 min-h-28 w-full resize-none rounded-[1.35rem] border border-border bg-background px-4 py-4 text-base leading-7 text-title outline-none transition placeholder:text-text/45 focus:border-primary focus:ring-4 focus:ring-primary/15"
                maxLength={280}
                placeholder="Uma frase sobre seu momento, se quiser."
                {...register("note")}
              />
              {errors.note ? (
                <span className="mt-2 block text-xs font-semibold text-danger">
                  {errors.note.message}
                </span>
              ) : null}
            </label>

            <div className="mt-7">
              <button
                className="inline-flex min-h-[3.75rem] w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:bg-neutral disabled:text-text/60 disabled:shadow-none"
                disabled={isSubmitting}
                type="submit"
              >
                <Save aria-hidden size={17} strokeWidth={2.4} />
                Salvar check-in
              </button>
            </div>
          </form>
        </div>
      </div>

      {statusModalType ? (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end justify-center bg-title/35 px-4 pb-4 pt-12 backdrop-blur-sm md:items-center md:p-8"
          role="dialog"
        >
          <div className="w-full max-w-[27rem] rounded-[2rem] bg-background px-6 py-6 shadow-[0_28px_80px_rgb(57_55_56_/_0.24)] ring-1 ring-white/80 md:px-7">
            <span
              className={cn(
                "grid size-14 place-items-center rounded-full ring-1",
                statusModalIsExisting
                  ? "bg-primary/10 text-primary ring-primary/20"
                  : "bg-success/10 text-success ring-success/20"
              )}
            >
              <StatusModalIcon aria-hidden size={24} strokeWidth={2.4} />
            </span>
            <h2 className="mt-5 font-title text-2xl font-extrabold leading-tight text-title">
              {statusModalIsExisting ? "Check-in de hoje já existe" : "Check-in salvo"}
            </h2>
            <p className="mt-3 text-sm leading-6 text-text">
              {statusModalIsExisting
                ? "Você já registrou seu check-in hoje. Para revisar ou editar esse registro, vá para o histórico."
                : "Seu registro ficou salvo no histórico local. Você pode voltar para a Home agora ou revisar seus registros."}
            </p>

            <div className="mt-6 grid gap-3">
              <button
                className="relative inline-flex min-h-[3.5rem] items-center justify-center gap-2 overflow-hidden rounded-full bg-primary px-5 text-sm font-extrabold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => router.push(statusModalRedirectHref)}
                type="button"
              >
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 bg-white/20 transition-[width]"
                  style={{ width: `${(modalCountdown / 10) * 100}%` }}
                />
                {statusModalIsExisting ? (
                  <History aria-hidden className="relative" size={17} strokeWidth={2.4} />
                ) : (
                  <Home aria-hidden className="relative" size={17} strokeWidth={2.4} />
                )}
                <span className="relative">
                  {statusModalIsExisting ? "Histórico" : "Home"} em {modalCountdown}s
                </span>
              </button>

              <Link
                className="inline-flex min-h-[3.5rem] items-center justify-center gap-2 rounded-full bg-white px-5 text-sm font-extrabold text-text ring-1 ring-border transition hover:bg-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                href={getProfileScopedHref(statusModalIsExisting ? "/home" : "/historico", profile)}
              >
                {statusModalIsExisting ? (
                  <Home aria-hidden size={17} strokeWidth={2.3} />
                ) : (
                  <History aria-hidden size={17} strokeWidth={2.3} />
                )}
                {statusModalIsExisting ? "Ir para home" : "Ir para histórico"}
              </Link>
            </div>
          </div>
        </div>
      ) : null}

      <BottomNavigation />
    </main>
  );
}
