"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthInput } from "@/features/auth/components/AuthInput";
import { saveRegisteredUserProfile } from "@/features/profile/data/profile-storage";
import { registerSchema, type RegisterFormData } from "@/schemas/auth.schema";
import { signupFields } from "../data/signup-fields";

type SignupFormProps = {
  isDragging?: boolean;
  isRevealed?: boolean;
  onLoginClick?: () => void;
  translateY?: number;
  variant?: "card" | "page";
};

export function SignupForm({
  isDragging = false,
  isRevealed = true,
  onLoginClick,
  translateY = 0,
  variant = "page",
}: SignupFormProps) {
  const router = useRouter();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      birthDate: "",
      confirmPassword: "",
      email: "",
      name: "",
      password: "",
      phone: "",
    },
  });

  async function onSubmit(data: RegisterFormData) {
    saveRegisteredUserProfile(data);
    router.push("/auth/select-type");
  }

  const formCard = (
    <div className="w-full">
      <div className="rounded-[1.75rem] bg-white/90 px-5 py-6 backdrop-blur sm:px-6">
        <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onSubmit)}>
          {signupFields.map((field) => {
            const Icon = field.icon;

            return (
              <AuthInput
                autoComplete={field.autoComplete}
                error={errors[field.name]}
                icon={<Icon size={16} strokeWidth={2.2} />}
                id={field.name}
                key={field.name}
                label={field.label}
                mask={field.mask}
                placeholder={field.placeholder}
                replacement={field.replacement}
                registration={register(field.name)}
                required={field.required}
                separate={field.separate}
                showMask={field.showMask}
                type={field.type}
              />
            );
          })}

          <button
            className="mt-1 flex h-14 items-center justify-center rounded-full bg-primary px-8 text-sm font-bold text-white shadow-button transition hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSubmitting}
            type="submit"
          >
            {isSubmitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>
      </div>

      <p className="mt-4 text-center text-xs text-text">
        Já tem uma conta?{" "}
        {onLoginClick ? (
          <button className="font-semibold text-primary" onClick={onLoginClick} type="button">
            Faça login
          </button>
        ) : (
          <Link className="font-semibold text-primary" href="/auth?mode=login">
            Faça login
          </Link>
        )}
      </p>
    </div>
  );

  if (variant === "card") {
    return <section className="w-full max-w-[25rem]">{formCard}</section>;
  }

  return (
    <section
      className={`absolute inset-0 z-0 flex min-h-dvh flex-col overflow-y-auto px-5 py-6 ${
        isRevealed ? "" : "pointer-events-none"
      }`}
      style={{
        transform: `translateY(${translateY}px)`,
        transition: isDragging ? "none" : "transform 500ms cubic-bezier(0.22, 1, 0.36, 1)",
      }}
    >
      <div className="mx-auto flex min-h-[calc(100dvh-3rem)] w-full max-w-sm flex-col justify-center sm:max-w-md md:max-w-none md:flex-row md:items-center md:justify-center md:gap-16 lg:gap-24">
        <section className="order-2 w-full md:order-1 md:flex md:w-1/2 md:justify-center">
          <div className="w-full md:max-w-94">{formCard}</div>
        </section>

        <section className="order-1 mb-7 md:order-2 md:mb-0 md:flex md:w-1/2 md:flex-col md:items-start">
          <div className="mb-5 flex items-center gap-3 md:mb-7">
            <Image
              alt="Maia"
              className="size-15 object-contain md:size-12"
              height={48}
              priority
              src="/images/logo-maia.png"
              width={48}
            />
            <p className="font-title text-3xl font-bold text-primary">Maia</p>
          </div>

          <h1 className="max-w-80 font-title text-[2rem] font-extrabold leading-tight tracking-[-0.03em] text-title md:max-w-[27rem] md:text-5xl">
            O seu refúgio de <span className="text-primary">cuidado materno.</span>
          </h1>

          <p className="mt-3 max-w-82 text-sm leading-6 text-text md:max-w-90 md:text-base">
            Junte-se à nossa comunidade de mães e profissionais e receba apoio personalizado.
          </p>
        </section>
      </div>
    </section>
  );
}
