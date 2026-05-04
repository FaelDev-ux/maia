"use client";

import Image from "next/image";
import { useState } from "react";

const onboardingSlides = [
  {
    imageAlt: "Mãe segurando seu bebê",
    imageClassName: "object-cover object-center",
    imageSrc: "/images/slide1.png",
    kicker: "Apoio real",
    label: "Comunidade",
    paragraph:
      "Sua jornada pós-parto merece acolhimento, orientação e uma rede que entende cada descoberta.",
    status: "Ativa",
    title: "Você não está",
    titleAccent: "sozinha.",
  },
  {
    imageAlt: "Mãe recebendo orientação no pós-parto",
    imageClassName: "object-cover object-center",
    imageSrc: "/images/slide2.png",
    kicker: "Guia leve",
    label: "Orientação",
    paragraph:
      "Acompanhe informações simples para entender o puerpério e reconhecer o que seu corpo precisa.",
    status: "Clara",
    title: "Entenda cada",
    titleAccent: "fase.",
  },
  {
    imageAlt: "Mãe com rede de apoio no puerpério",
    imageClassName: "object-cover object-center",
    imageSrc: "/images/slide3.png",
    kicker: "Rede ativa",
    label: "Conexão",
    paragraph:
      "Compartilhe vivências, encontre escuta e caminhe com outras mães que passam por momentos parecidos.",
    status: "Presente",
    title: "Conecte-se com",
    titleAccent: "apoio.",
  },
  {
    imageAlt: "Mãe em momento de autocuidado",
    imageClassName: "object-cover object-center",
    imageSrc: "/images/slide4.png",
    kicker: "Cuidado seu",
    label: "Autocuidado",
    paragraph:
      "Guarde espaço para suas emoções, sua rotina e pequenos passos de cuidado todos os dias.",
    status: "Diário",
    title: "Cuide de você",
    titleAccent: "também.",
  },
];

export default function Home() {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const currentSlide = onboardingSlides[currentSlideIndex];

  function showNextSlide() {
    setCurrentSlideIndex((slideIndex) => (slideIndex + 1) % onboardingSlides.length);
  }

  function skipToLastSlide() {
    setCurrentSlideIndex(onboardingSlides.length - 1);
  }

  return (
    <div className="relative flex min-h-dvh w-full flex-col overflow-hidden bg-[#f8f4f5] text-text">
      <div className="pointer-events-none absolute -right-24 top-10 h-80 w-80 rounded-full bg-white/65 blur-2xl" />
      <div className="pointer-events-none absolute -left-28 bottom-10 h-80 w-80 rounded-full bg-neutral/70 blur-2xl" />
      <div className="pointer-events-none absolute inset-0 opacity-45">
        <div className="absolute left-[120px] top-0 h-full w-8 rotate-12 bg-white/60 blur-md" />
        <div className="absolute right-3 top-16 h-[104px] w-10 rotate-[30deg] rounded-full border border-white/90" />
        <div className="absolute right-0 bottom-18 h-18 w-18 rounded-full border-[18px] border-white/75" />
      </div>

      <header className="relative mb-2 z-10 flex items-start justify-between px-6 pt-4">
        <Image
          alt="Maia"
          className="h-[60px] w-[60px] object-contain"
          height={60}
          priority
          src="/images/logo-maia.png"
          width={60}
        />
        <button
          className="pt-5 text-2xl font-medium text-title"
          onClick={skipToLastSlide}
          type="button"
        >
          PULAR
        </button>
      </header>

      <main className="relative z-10 flex flex-1 flex-col px-6">
        <div className="relative mt-5 h-[min(58dvh,450px)] min-h-[332px] rounded-[28px] shadow-card md:mx-auto md:h-[440px] md:min-h-[440px] md:w-[min(100%,456px)]">
          <div
            className="maia-slide-visual absolute inset-0 overflow-hidden rounded-[28px]"
            key={currentSlide.imageSrc}
          >
            <Image
              alt={currentSlide.imageAlt}
              className={currentSlide.imageClassName}
              fill
              priority
              sizes="(max-width: 767px) 100vw, 456px"
              src={currentSlide.imageSrc}
            />
          </div>
          <div
            className="absolute right-[-10px] z-10 flex min-w-[140px] items-center gap-3 rounded-[30px] border border-white/15 bg-white/50 px-4 py-3 shadow-soft backdrop-blur-sm"
            style={{ bottom: -20 }}
          >
            <div className="grid h-10 w-10 place-items-center rounded-full bg-primary/45">
              <Image alt="" aria-hidden="true" height={19} src="/svg/Container.svg" width={20} />
            </div>
            <div className="maia-slide-badge leading-none" key={currentSlide.kicker}>
              <p className="text-[10px] mb-0.5 mr-12 font-extrabold uppercase tracking-[0.02em] text-title">
                {currentSlide.kicker}
              </p>
              <p className="text-[10px] font-bold uppercase tracking-[0.02em] text-buttons">
                {currentSlide.label}
              </p>
              <p className="mt-0.5 text-[9px] font-bold text-buttons uppercase">
                {currentSlide.status}
              </p>
            </div>
          </div>
        </div>

        <div className="maia-slide-copy mt-8" key={currentSlide.title}>
          <h1 className="max-w-72 font-title text-[39px] font-extrabold leading-[0.96] tracking-normal text-title">
            {currentSlide.title} <span className="text-primary">{currentSlide.titleAccent}</span>
          </h1>
          <p className="mt-4 max-w-[18.5rem] text-[16px] leading-6 text-text">
            {currentSlide.paragraph}
          </p>
        </div>

        <div className="mt-6 flex justify-center gap-1.5">
          {onboardingSlides.map((slide, slideIndex) => (
            <span
              aria-label={`Slide ${slideIndex + 1} de ${onboardingSlides.length}`}
              className={`h-1.5 rounded-full transition-all ${
                slideIndex === currentSlideIndex ? "w-6 bg-primary" : "w-1.5 bg-neutral"
              }`}
              key={slide.title}
            />
          ))}
        </div>
      </main>

      <footer className="relative z-10 px-6 pb-8 pt-6">
        <button
          className="mx-auto flex h-[65px] w-[75%] max-w-[292px] items-center justify-center rounded-full bg-primary text-[15px] font-bold text-white shadow-button transition-colors hover:bg-primary/90"
          onClick={showNextSlide}
          type="button"
        >
          Próximo <span className="ml-2 text-lg leading-none">→</span>
        </button>
      </footer>
    </div>
  );
}
