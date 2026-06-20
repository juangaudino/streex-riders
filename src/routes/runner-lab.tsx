import { createFileRoute } from "@tanstack/react-router";
import { RunnerApp } from "@/features/runner/RunnerApp";

export const Route = createFileRoute("/runner-lab")({
  head: () => ({
    meta: [
      { title: "Streex Horizon" },
      {
        name: "description",
        content: "Play Streex Horizon, the Streex Rides road challenge.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RunnerLabRoute,
});

function RunnerLabRoute() {
  return <RunnerApp />;
}
