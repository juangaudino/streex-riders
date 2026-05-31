import { createFileRoute } from "@tanstack/react-router";
import { RunnerApp } from "@/features/runner/RunnerApp";

export const Route = createFileRoute("/runner-lab")({
  head: () => ({
    meta: [
      { title: "STREEX Runner Lab" },
      {
        name: "description",
        content: "Hidden development route for STREEX Runner.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: RunnerLabRoute,
});

function RunnerLabRoute() {
  return <RunnerApp />;
}
