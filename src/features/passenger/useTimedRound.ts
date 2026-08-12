import { useEffect, useRef, useState } from "react";
import {
  getTimedGameProgress,
  isTimedGameWarning,
  TIMED_GAME_QUESTION_DURATION_MS,
} from "./timed-game";

type UseTimedRoundOptions = {
  active: boolean;
  roundKey: string | null;
  onExpire: () => void;
  durationMs?: number;
};

export function useTimedRound({
  active,
  roundKey,
  onExpire,
  durationMs = TIMED_GAME_QUESTION_DURATION_MS,
}: UseTimedRoundOptions) {
  const [remainingMs, setRemainingMs] = useState(durationMs);
  const onExpireRef = useRef(onExpire);

  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    if (!active || !roundKey) {
      setRemainingMs(durationMs);
      return;
    }

    let expired = false;
    const deadline = Date.now() + durationMs;
    const tick = () => {
      const nextRemainingMs = Math.max(0, deadline - Date.now());
      setRemainingMs(nextRemainingMs);

      if (nextRemainingMs === 0 && !expired) {
        expired = true;
        onExpireRef.current();
      }
    };

    tick();
    const intervalId = window.setInterval(tick, 100);
    return () => window.clearInterval(intervalId);
  }, [active, durationMs, roundKey]);

  return {
    remainingMs,
    progress: getTimedGameProgress(remainingMs, durationMs),
    isWarning: isTimedGameWarning(remainingMs),
  };
}
