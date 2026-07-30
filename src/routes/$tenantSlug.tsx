import { createFileRoute, notFound } from "@tanstack/react-router";
import { getPublicSiteConfig } from "@/lib/site-config.functions";
import { StreexLanding } from "./index";
import { z } from "zod";

export const Route = createFileRoute("/$tenantSlug")({
  validateSearch: z.object({ preview: z.string().optional() }),
  loaderDeps: ({ search }) => ({ preview: search.preview }),
  loader: async ({ params, deps }) => {
    try {
      return await getPublicSiteConfig({
        data: { tenantSlug: params.tenantSlug, previewToken: deps.preview },
      });
    } catch {
      throw notFound();
    }
  },
  head: ({ loaderData }) => {
    const config = loaderData?.config;
    const slug = loaderData?.tenant.slug;
    if (!config || !slug) return {};
    const canonical = `https://rides.getstreex.com/${slug}`;
    return {
      meta: [
        { title: config.seoTitle },
        { name: "description", content: config.seoDescription },
        { property: "og:title", content: config.seoTitle },
        { property: "og:description", content: config.seoDescription },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:site_name", content: config.brandName },
        { property: "og:image", content: config.ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: config.seoTitle },
        { name: "twitter:description", content: config.seoDescription },
        { name: "twitter:image", content: config.ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": ["LocalBusiness", "TaxiService"],
            name: config.brandName,
            description: config.seoDescription,
            url: canonical,
            image: config.ogImage,
            telephone: config.phone,
            email: config.email,
            founder: { "@type": "Person", name: config.ownerName },
            areaServed: config.areas.map((name) => ({ "@type": "Place", name })),
            serviceType: config.services
              .filter((service) => service.enabled)
              .map((service) => service.name),
            priceRange: "$$",
          }),
        },
      ],
    };
  },
  component: TenantLandingRoute,
});

function TenantLandingRoute() {
  const result = Route.useLoaderData();
  return (
    <StreexLanding
      initialConfig={result.config}
      tenant={{ id: result.tenant.id, slug: result.tenant.slug }}
    />
  );
}
