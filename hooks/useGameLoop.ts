import { useEffect, useRef } from 'react';

export function useGameLoop(callback: (deltaTimeMs: number) => void) {
  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();

  useEffect(() => {
    const animate = (time: number) => {
      if (previousTimeRef.current !== undefined) {
        // deltaTime in milliseconds (ms). We cap it to avoid giant physics jumps
        // when the app resumes from background or the JS thread hiccups.
        const rawDeltaTimeMs = time - previousTimeRef.current;
        const deltaTimeMs = Math.min(rawDeltaTimeMs, 50);
        callback(deltaTimeMs);
      }

      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [callback]);
}