import { createFileRoute } from "@tanstack/react-router";
import { PassengerConsole } from "@/features/passenger/PassengerConsole";
import { getPublicSiteConfig } from "@/lib/site-config.functions";

export const Route = createFileRoute("/passenger")({
  loader: () => getPublicSiteConfig({ data: {} }),
  head: () => ({
    meta: [
      { title: "STREEX Passenger Console" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "theme-color", content: "#0B0B0B" },
    ],
  }),
  component: PassengerRoute,
});

function PassengerRoute() {
  const { config } = Route.useLoaderData();
  return <PassengerConsole config={config} />;
}
