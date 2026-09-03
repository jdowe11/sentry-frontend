"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/utils/cn";

interface MatrixRainCanvasProps {
  opacity?: number;
  fontSize?: number;
  fps?: number;
  className?: string;
}

export default function MatrixRainCanvas({
  opacity = 0.28,
  fontSize = 14,
  fps = 30,
  className,
}: MatrixRainCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number | null = null;
    let lastTime = performance.now();
    const interval = 1000 / fps;

    // Respect reduced motion preference
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let prefersReducedMotion = motionQuery.matches;

    // cmatrix character pool: katakana, numbers, latin uppercase, symbols
    const chars =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZｦｱｳｴｵｶｷｹｺｻｼｽｾｿﾀﾂﾃﾅﾆﾇﾈﾊﾋﾎﾏﾐﾑﾒﾓﾔﾕﾗﾘﾜ:・.\"=*+-<>¦｜";

    let columns = 0;
    let drops: number[] = [];

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Set transform to device pixel ratio cleanly
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      columns = Math.floor(width / fontSize);
      drops = [];
      const rows = Math.floor(height / fontSize);
      for (let i = 0; i < columns; i++) {
        // Stagger drops randomly across screen height for immediate natural rain
        drops[i] = Math.floor(Math.random() * rows);
      }

      // If reduced motion is enabled, draw one static frame and stop
      if (prefersReducedMotion) {
        drawStaticFrame(width, height);
      }
    };

    const drawStaticFrame = (width: number, height: number) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < columns; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillStyle = "#059669";
        ctx.fillText(char, x, y);
      }
    };

    const render = (currentTime: number) => {
      // If tab is hidden or reduced motion is preferred, pause RAF loop
      if (document.hidden || prefersReducedMotion) return;

      animationFrameId = requestAnimationFrame(render);

      const delta = currentTime - lastTime;
      if (delta < interval) return;
      lastTime = currentTime - (delta % interval);

      const width = window.innerWidth;
      const height = window.innerHeight;

      // Soft fade background to produce trailing effect
      ctx.fillStyle = "rgba(0, 0, 0, 0.06)";
      ctx.fillRect(0, 0, width, height);

      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        // Head character: bright mint/white
        ctx.fillStyle = "#A7F3D0";
        ctx.fillText(char, x, y);

        // Trailing character: Sentry emerald
        if (drops[i] > 0) {
          const prevChar = chars[Math.floor(Math.random() * chars.length)];
          ctx.fillStyle = "#059669";
          ctx.fillText(prevChar, x, y - fontSize);
        }

        // Loop drop when it passes bottom
        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }

        drops[i]++;
      }
    };

    const startLoop = () => {
      if (prefersReducedMotion || document.hidden) return;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(render);
    };

    const stopLoop = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
    };

    // Pause when window/tab is not visible (huge win for battery / laptop / Electron)
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    // Handle user system reduced motion preference change dynamically
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        stopLoop();
        drawStaticFrame(window.innerWidth, window.innerHeight);
      } else {
        startLoop();
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    motionQuery.addEventListener("change", handleMotionChange);

    startLoop();

    return () => {
      stopLoop();
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, [fontSize, fps]);

  return (
    <canvas
      ref={canvasRef}
      className={cn(
        "pointer-events-none absolute inset-0 z-0 h-full w-full",
        className
      )}
      style={{ opacity }}
    />
  );
}
