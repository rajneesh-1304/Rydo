"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Box, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import CheckRoundedIcon from "@mui/icons-material/CheckRounded";
import styles from "./SplashScreen.module.scss";

export const SplashScreen: React.FC = () => {
  const router = useRouter();

  const [dragProgress, setDragProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const trackRef = useRef<HTMLDivElement>(null);
  const wasDraggedRef = useRef(false);

  const triggerComplete = useCallback(() => {
    setIsCompleted(true);
    setDragProgress(1);
    setTimeout(() => {
      router.push("/login");
    }, 250);
  }, [router]);

  // Handle global pointer drag events
  useEffect(() => {
    if (!isDragging || isCompleted) return;

    const handlePointerMove = (e: PointerEvent) => {
      if (!trackRef.current || isCompleted) return;
      wasDraggedRef.current = true;
      const rect = trackRef.current.getBoundingClientRect();
      const knobSize = 54;
      const maxDrag = Math.max(1, rect.width - knobSize - 10);
      const currentX = e.clientX - rect.left - 5;
      const progress = Math.max(0, Math.min(1, currentX / maxDrag));

      setDragProgress(progress);

      if (progress >= 0.8) {
        setIsDragging(false);
        triggerComplete();
      }
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      setDragProgress((prev) => {
        if (prev >= 0.8) {
          triggerComplete();
          return 1;
        }
        return 0;
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
      window.removeEventListener("pointercancel", handlePointerUp);
    };
  }, [isDragging, isCompleted, triggerComplete]);

  // Pointer down on track or knob starts dragging immediately
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isCompleted || !trackRef.current) return;
    wasDraggedRef.current = false;
    setIsDragging(true);

    const rect = trackRef.current.getBoundingClientRect();
    const knobSize = 54;
    const maxDrag = Math.max(1, rect.width - knobSize - 10);
    const currentX = e.clientX - rect.left - 5;
    const initialProgress = Math.max(0, Math.min(1, currentX / maxDrag));
    setDragProgress(initialProgress);
  };

  // Simple click / tap fallback
  const handleClick = () => {
    if (isCompleted || wasDraggedRef.current) return;
    triggerComplete();
  };

  const trackWidth = trackRef.current ? trackRef.current.offsetWidth : 360;
  const knobSize = 54;
  const maxTravel = Math.max(0, trackWidth - knobSize - 10);
  const thumbOffset = Math.round(dragProgress * maxTravel);

  return (
    <Box className={styles.splashContainer}>
      {/* Full-screen background image */}
      <div className={styles.bgImageWrapper}>
        <Image
          src="/taxii-splash-bg.jpg"
          alt="Taxii background"
          fill
          priority
          sizes="100vw"
          className={styles.bgImage}
        />
        <div className={styles.gradientOverlay} />
      </div>

      {/* Simple top header */}
      <header className={styles.topBar}>
        <div className={styles.brandLogo}>
          <span className={styles.logoName}>Taxii</span>
          <span className={styles.logoDot} />
        </div>
      </header>

      {/* Simple bottom section with full-width swipe button */}
      <main className={styles.bottomSection}>
        <div className={styles.heroText}>
          <Typography component="h1" className={styles.title}>
            Ride anywhere, anytime
          </Typography>
          <Typography className={styles.subtitle}>
            Swipe below to book your ride instantly
          </Typography>
        </div>

        {/* Full-width swipe button */}
        <div className={styles.swipeContainer}>
          <div
            ref={trackRef}
            className={`${styles.swipeTrack} ${isCompleted ? styles.completed : ""}`}
            onPointerDown={handlePointerDown}
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label="Swipe to book ride"
          >
            {/* Color fill following swipe */}
            <div
              className={styles.swipeFill}
              style={{
                width: isCompleted ? "100%" : `${thumbOffset + knobSize}px`,
                transition: isDragging ? "none" : "width 0.25s ease-out",
              }}
            />

            {/* Centered label */}
            <div
              className={styles.trackLabel}
              style={{
                opacity: Math.max(0, 1 - dragProgress * 1.5),
              }}
            >
              <span>Swipe to book ride</span>
              <span className={styles.arrowIcon}>👉</span>
            </div>

            {/* Draggable Knob */}
            <div
              className={`${styles.swipeKnob} ${isDragging ? styles.dragging : ""}`}
              style={{
                transform: `translateX(${isCompleted ? maxTravel : thumbOffset}px)`,
                transition: isDragging ? "none" : "transform 0.25s ease-out",
              }}
            >
              {isCompleted ? (
                <CheckRoundedIcon className={styles.knobIcon} />
              ) : (
                <ArrowForwardRoundedIcon className={styles.knobIcon} />
              )}
            </div>
          </div>
        </div>
      </main>
    </Box>
  );
};

export default SplashScreen;
