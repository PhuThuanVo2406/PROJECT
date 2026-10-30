"use client";

import { useEffect, useRef, useState } from "react";
import { fluidSimulation } from "./fluidSimulation";

/**
 * The fluid ink behind the home hero. It stays off (and the still gradient
 * behind it shows) when the visitor asks for reduced motion or the browser
 * has no WebGL. It pauses while the hero is off screen or the tab is hidden.
 */
export default function InkCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let sim: ReturnType<typeof fluidSimulation>;
    try {
      sim = fluidSimulation(canvas);
    } catch {
      return;
    }
    setRunning(true);

    let onScreen = true;
    const sync = () => sim.setActive(onScreen && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    observer.observe(canvas);
    document.addEventListener("visibilitychange", sync);

    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
      sim.destroy();
    };
  }, []);

  return <canvas ref={ref} className={running ? "ink-canvas on" : "ink-canvas"} aria-hidden="true" />;
}
