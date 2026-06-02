import { useCallback, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { RunnerCanvas } from "./components/RunnerCanvas";
import { RunnerIntro } from "./components/RunnerIntro";
import { RunnerResults } from "./components/RunnerResults";
import { RunnerTransition } from "./components/RunnerTransition";
import type { RunnerGameSnapshot, RunnerScreen } from "./runner.types";

const EMPTY_SNAPSHOT: RunnerGameSnapshot = {
  score: 0,
  rank: 1,
  totalRiders: 1,
  crashKind: null,
};

export function RunnerApp() {
  const router = useRouter();
  const [screen, setScreen] = useState<RunnerScreen>("intro");
  const [result, setResult] = useState<RunnerGameSnapshot>(EMPTY_SNAPSHOT);
  const [runId, setRunId] = useState(0);

  const play = useCallback(() => {
    setRunId((current) => current + 1);
    setScreen("transition");
    window.setTimeout(() => setScreen("playing"), 520);
  }, []);

  const backToStreex = useCallback(() => {
    router.navigate({ to: "/" });
  }, [router]);

  const handleGameOver = useCallback((snapshot: RunnerGameSnapshot) => {
    setResult(snapshot);
    setScreen("results");
  }, []);

  if (screen === "transition") return <RunnerTransition />;

  if (screen === "playing") {
    return (
      <RunnerCanvas
        key={runId}
        onGameOver={handleGameOver}
        onRestart={play}
        onBack={backToStreex}
      />
    );
  }

  if (screen === "results") {
    return <RunnerResults snapshot={result} onReplay={play} onBack={backToStreex} />;
  }

  return <RunnerIntro onPlay={play} onBack={backToStreex} />;
}
