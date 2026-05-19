import { useCallback, useRef, useState } from "react";

function randomCrash() {
  const r = Math.random();
  return Math.max(1.01, +(1 / (1 - r * 0.97)).toFixed(2));
}

export function useCrashGame({ onCrash, speed = 0.035 }) {
  const [phase, setPhase] = useState("idle");
  const [multiplier, setMultiplier] = useState(1);
  const [crashAt, setCrashAt] = useState(null);
  const raf = useRef(null);
  const startTime = useRef(0);

  const startRound = useCallback(() => {
    const target = randomCrash();
    setCrashAt(target);
    setMultiplier(1);
    setPhase("running");
    startTime.current = performance.now();

    const tick = (now) => {
      const elapsed = (now - startTime.current) / 1000;
      const m = +(1 + elapsed * (2.5 + elapsed * 0.15)).toFixed(2);
      if (m >= target) {
        setMultiplier(target);
        setPhase("crashed");
        onCrash?.(target);
        return;
      }
      setMultiplier(m);
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }, [onCrash]);

  const reset = useCallback(() => {
    if (raf.current) cancelAnimationFrame(raf.current);
    setPhase("idle");
    setMultiplier(1);
    setCrashAt(null);
  }, []);

  const cashOut = useCallback(() => {
    if (phase !== "running") return null;
    if (raf.current) cancelAnimationFrame(raf.current);
    setPhase("cashed");
    return multiplier;
  }, [phase, multiplier]);

  return { phase, multiplier, crashAt, startRound, reset, cashOut };
}
