"use client";

import { useEffect, useRef, useState } from "react";
import { SignupIntroCover } from "./SignupIntroCover";

const FALLBACK_VIEWPORT_HEIGHT = 720;
const MIN_REVEAL_DISTANCE = 360;
const REVEAL_THRESHOLD_RATIO = 0.36;
const INTRO_BACKGROUND = "linear-gradient(155deg, #f97f9f 0%, #ee7ea8 48%, #cf79c6 100%)";

type SignupIntroGateProps = {
  onRevealed: () => void;
};

export function SignupIntroGate({ onRevealed }: SignupIntroGateProps) {
  const pointerStartY = useRef<number | null>(null);
  const [viewportHeight, setViewportHeight] = useState(FALLBACK_VIEWPORT_HEIGHT);
  const [dragOffset, setDragOffset] = useState(0);
  const [hasEntered, setHasEntered] = useState(false);
  const [isEntryMaskVisible, setIsEntryMaskVisible] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isRevealed, setIsRevealed] = useState(false);

  const revealDistance = Math.max(viewportHeight, MIN_REVEAL_DISTANCE);
  const revealThreshold = revealDistance * REVEAL_THRESHOLD_RATIO;
  const coverTranslateY = isRevealed ? -viewportHeight : dragOffset;

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setHasEntered(true);
    });

    const timeoutId = window.setTimeout(() => {
      setIsEntryMaskVisible(false);
    }, 540);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.clearTimeout(timeoutId);
    };
  }, []);

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

  useEffect(() => {
    if (!isRevealed) {
      return;
    }

    const timeoutId = window.setTimeout(onRevealed, 520);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [isRevealed, onRevealed]);

  function handlePointerDown(event: React.PointerEvent<HTMLElement>) {
    if (isRevealed) {
      return;
    }

    pointerStartY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    if (pointerStartY.current === null || isRevealed) {
      return;
    }

    const offset = Math.min(0, event.clientY - pointerStartY.current);
    setDragOffset(Math.max(offset, -revealDistance));
  }

  function handlePointerUp() {
    if (isRevealed) {
      return;
    }

    if (Math.abs(dragOffset) >= revealThreshold) {
      setIsRevealed(true);
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
    if (isRevealed) {
      return;
    }

    pointerStartY.current = null;
    setIsDragging(false);
    setDragOffset(0);
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden"
      style={{ background: isEntryMaskVisible ? INTRO_BACKGROUND : "transparent" }}
    >
      <div
        className="absolute inset-0 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ transform: hasEntered ? "translateY(0)" : "translateY(-100%)" }}
      >
        <SignupIntroCover
          isDragging={isDragging}
          isRevealed={isRevealed}
          onPointerCancel={handlePointerCancel}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          translateY={coverTranslateY}
        />
      </div>
    </div>
  );
}
