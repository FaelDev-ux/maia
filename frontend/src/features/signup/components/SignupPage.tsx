"use client";

import { useEffect, useRef, useState } from "react";
import { SignupForm } from "./SignupForm";
import { SignupIntroCover } from "./SignupIntroCover";

const FALLBACK_VIEWPORT_HEIGHT = 720;
const MIN_REVEAL_DISTANCE = 520;
const REVEAL_THRESHOLD_RATIO = 0.78;

export type SignupPageProps = {
  onLoginClick?: () => void;
  rootElement?: "div" | "main";
};

export function SignupPage({ onLoginClick, rootElement = "main" }: SignupPageProps) {
  const pointerStartY = useRef<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState(FALLBACK_VIEWPORT_HEIGHT);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSignupRevealed, setIsSignupRevealed] = useState(false);

  const revealDistance = Math.max(viewportHeight, MIN_REVEAL_DISTANCE);
  const revealThreshold = revealDistance * REVEAL_THRESHOLD_RATIO;
  const signupTranslateY = isSignupRevealed ? 0 : Math.max(viewportHeight + dragOffset, 0);
  const coverTranslateY = isSignupRevealed ? -viewportHeight : dragOffset;

  useEffect(() => {
    function updateViewportHeight() {
      setViewportHeight(window.innerHeight);
    }

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
    };
  }, []);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (isSignupRevealed) {
      return;
    }

    pointerStartY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (pointerStartY.current === null || isSignupRevealed) {
      return;
    }

    const offset = Math.min(0, event.clientY - pointerStartY.current);
    setDragOffset(Math.max(offset, -revealDistance));
  }

  function handlePointerUp() {
    if (isSignupRevealed) {
      return;
    }

    if (Math.abs(dragOffset) >= revealThreshold) {
      setIsSignupRevealed(true);
      setDragOffset(-revealDistance);
      pointerStartY.current = null;
      setIsDragging(false);
      return;
    }

    pointerStartY.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }

  function handlePointerCancel() {
    if (isSignupRevealed) {
      return;
    }

    pointerStartY.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }

  const content = (
    <>
      <SignupForm
        isDragging={isDragging}
        isRevealed={isSignupRevealed}
        onLoginClick={onLoginClick}
        translateY={signupTranslateY}
      />

      <SignupIntroCover
        isDragging={isDragging}
        isRevealed={isSignupRevealed}
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        translateY={coverTranslateY}
      />
    </>
  );

  if (rootElement === "div") {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-[#fff8fa] text-text">{content}</div>
    );
  }

  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#fff8fa] text-text">{content}</main>
  );
}
