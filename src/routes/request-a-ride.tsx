import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { BookingFormModal } from "@/components/streex/BookingFormModal";
import { TenantProvider } from "@/components/streex/TenantContext";
import { getPublicSiteConfig } from "@/lib/site-config.functions";

export const Route = createFileRoute("/request-a-ride")({
  loader: () => getPublicSiteConfig({ data: {} }),
  head: () => ({
    meta: [
      { title: "Request a Ride | Streex Rides" },
      { name: "description", content: "Submit a private ride request to Streex Rides." },
      { name: "robots", content: "noindex, nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://rides.getstreex.com/request-a-ride" }],
  }),
  component: RequestARideRoute,
});

function RequestARideRoute() {
  const { config, tenant } = Route.useLoaderData();
  const navigate = useNavigate();

  return (
    <TenantProvider value={{ tenantId: tenant.id, tenantSlug: tenant.slug }}>
      <main className="min-h-screen streex-frame text-white">
        <div className="mx-auto flex min-h-screen max-w-md items-start justify-center px-6 pt-10">
          <img src={config.logoSrc} alt={config.brandName} className="h-10 w-auto" />
        </div>
      </main>
      <BookingFormModal
        open
        onOpenChange={(open) => {
          if (!open) void navigate({ to: "/" });
        }}
      />
    </TenantProvider>
  );
}
