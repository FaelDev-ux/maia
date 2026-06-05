"use client";

import { useCallback, useEffect, useState } from "react";
import { MaiaBrand } from "@/components/layout/MaiaBrand";
import { SignupForm } from "@/features/signup/components/SignupForm";
import { SignupIntroGate } from "@/features/signup/components/SignupIntroGate";
import { LoginForm } from "./LoginForm";

export type AuthMode = "login" | "register";

type UnifiedAuthPageProps = {
  initialMode?: AuthMode;
  shouldShowSignupIntro?: boolean;
};

export function UnifiedAuthPage({
  initialMode = "login",
  shouldShowSignupIntro = false,
}: UnifiedAuthPageProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [hasShownSignupIntro, setHasShownSignupIntro] = useState(false);
  const [showSignupIntro, setShowSignupIntro] = useState(false);

  const isLoginMode = mode === "login";

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    window.history.replaceState(null, "", `/auth?mode=${nextMode}`);
  }

  const finishSignupIntro = useCallback(() => {
    setShowSignupIntro(false);
  }, []);

  useEffect(() => {
    if (initialMode !== "register" || !shouldShowSignupIntro) {
      return;
    }

    if (!hasShownSignupIntro) {
      const timeoutId = window.setTimeout(() => {
        setHasShownSignupIntro(true);
        setShowSignupIntro(true);
      }, 0);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }
  }, [hasShownSignupIntro, initialMode, shouldShowSignupIntro]);

  return (
    <main className="min-h-dvh overflow-x-hidden bg-background text-text">
      <div className="mx-auto flex min-h-dvh w-full max-w-none flex-col justify-center overflow-x-hidden px-6 py-6 md:hidden">
        <div className="grid w-full min-w-0 overflow-hidden">
          <section
            aria-hidden={!isLoginMode}
            className={`col-start-1 row-start-1 min-w-0 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isLoginMode
                ? "translate-x-0 opacity-100"
                : "pointer-events-none -translate-x-full opacity-0"
            }`}
          >
            <AuthCopy mode="login" />

            <div className="mt-7 flex min-w-0 justify-center">
              <LoginForm onRegisterClick={() => changeMode("register")} />
            </div>
          </section>

          <section
            aria-hidden={isLoginMode}
            className={`col-start-1 row-start-1 min-w-0 transition duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${
              isLoginMode
                ? "pointer-events-none translate-x-full opacity-0"
                : "translate-x-0 opacity-100"
            }`}
          >
            <AuthCopy mode="register" />

            <div className="mt-7 flex min-w-0 justify-center">
              <SignupForm onLoginClick={() => changeMode("login")} variant="card" />
            </div>
          </section>
        </div>
      </div>

      <div className="relative mx-auto hidden min-h-dvh w-full max-w-[78rem] md:block">
        <section
          className="absolute left-0 top-1/2 flex w-1/2 justify-center px-10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: isLoginMode ? "translate3d(0, -50%, 0)" : "translate3d(100%, -50%, 0)",
          }}
        >
          <AuthCopy mode={mode} />
        </section>

        <section
          className="absolute left-0 top-1/2 flex w-1/2 justify-center px-10 transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
          style={{
            transform: isLoginMode ? "translate3d(100%, -50%, 0)" : "translate3d(0, -50%, 0)",
          }}
        >
          {isLoginMode ? (
            <LoginForm onRegisterClick={() => changeMode("register")} />
          ) : (
            <SignupForm onLoginClick={() => changeMode("login")} variant="card" />
          )}
        </section>
      </div>

      {showSignupIntro && <SignupIntroGate onRevealed={finishSignupIntro} />}
    </main>
  );
}

type AuthCopyProps = {
  mode: AuthMode;
};

function AuthCopy({ mode }: AuthCopyProps) {
  const isLoginMode = mode === "login";

  return (
    <section className="w-full max-w-[28rem]">
      <header className="mb-7 flex items-center gap-4 md:mb-6">
        <MaiaBrand
          imageClassName="size-12"
          imageSize={48}
          textClassName="text-3xl font-bold"
        />
      </header>

      <h1 className="font-title text-[2rem] font-extrabold leading-tight text-title md:text-5xl">
        {isLoginMode ? (
          <>
            Bem-vinda de volta ao <span className="text-primary">seu espaço seguro.</span>
          </>
        ) : (
          <>
            O seu refúgio de <span className="text-primary">cuidado materno.</span>
          </>
        )}
      </h1>

      <p className="mt-4 max-w-96 text-sm leading-6 text-text md:text-base">
        {isLoginMode
          ? "Entre para continuar acompanhando seus sentimentos e seus momentos de cuidado."
          : "Junte-se à nossa comunidade de mães e profissionais e receba apoio personalizado."}
      </p>
    </section>
  );
}
