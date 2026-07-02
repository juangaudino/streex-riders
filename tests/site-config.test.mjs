import { describe, expect, test } from "bun:test";
import { CONFIG } from "../src/config.ts";
import { mergeSiteConfig, SiteConfigOverrideSchema } from "../src/lib/site-config.ts";

describe("public site config", () => {
  test("merges saved section visibility and service changes", () => {
    const override = SiteConfigOverrideSchema.parse({
      tagline: "A saved tagline.",
      sections: { reviews: false, faq: false },
      services: [{ id: "airport", name: "Airport Rides", enabled: false }],
    });
    const result = mergeSiteConfig(CONFIG, override);

    expect(result.tagline).toBe("A saved tagline.");
    expect(result.sections.reviews).toBe(false);
    expect(result.sections.faq).toBe(false);
    expect(result.sections.servicesGrid).toBe(CONFIG.sections.servicesGrid);
    expect(result.services.find((service) => service.id === "airport")).toMatchObject({
      name: "Airport Rides",
      enabled: false,
    });
  });

  test("normalizes contact values saved by Admin", () => {
    const result = mergeSiteConfig(CONFIG, {
      phoneDisplay: "801-555-0199",
      instagram: "@streex.test",
    });

    expect(result.phone).toBe("+18015550199");
    expect(result.instagram).toBe("streex.test");
    expect(result.instagramUrl).toBe("https://instagram.com/streex.test");
  });
});
