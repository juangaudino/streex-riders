import { createFileRoute } from "@tanstack/react-router";
import { LocationServicePage } from "@/components/streex/LocationServicePage";
import { CONFIG } from "@/config";
import { LOCATION_PAGES } from "@/lib/location-pages";
import { getPublicSiteConfig } from "@/lib/site-config.functions";

const page = LOCATION_PAGES["las-vegas-private-rides"];
const canonical = `https://rides.getstreex.com/${page.slug}`;

export const Route = createFileRoute("/las-vegas-private-rides")({
  loader: () => getPublicSiteConfig({ data: {} }),
  head: ({ loaderData }) => {
    const config = loaderData?.config ?? CONFIG;
    return {
      meta: [
        { title: page.title },
        { name: "description", content: page.description },
        { property: "og:title", content: page.title },
        { property: "og:description", content: page.description },
        { property: "og:type", content: "website" },
        { property: "og:url", content: canonical },
        { property: "og:image", content: config.ogImage },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: page.title },
        { name: "twitter:description", content: page.description },
        { name: "twitter:image", content: config.ogImage },
      ],
      links: [{ rel: "canonical", href: canonical }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "Service",
                name: page.serviceName,
                description: page.description,
                url: canonical,
                areaServed: ["Salt Lake City", "Utah", "Las Vegas", "Nevada"],
                provider: {
                  "@type": ["LocalBusiness", "TaxiService"],
                  name: config.brandName,
                  telephone: config.phone,
                  url: config.website,
                },
              },
              {
                "@type": "BreadcrumbList",
                itemListElement: [
                  { "@type": "ListItem", position: 1, name: "Streex Rides", item: config.website },
                  { "@type": "ListItem", position: 2, name: page.serviceName, item: canonical },
                ],
              },
            ],
          }),
        },
      ],
    };
  },
  component: LasVegasPrivateRidesRoute,
});

function LasVegasPrivateRidesRoute() {
  const result = Route.useLoaderData();
  return <LocationServicePage config={result.config} tenant={result.tenant} page={page} />;
}
