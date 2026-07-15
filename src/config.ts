// To customize this template, edit src/config.ts
import streexLogo from "@/assets/brand/streex-rides-transparent.webp";
export const CONFIG = {
  // ─── BRAND ───────────────────────────────────
  brandName: "Streex Rides",
  ownerName: "Juan",
  tagline: "Private rides. Elevated.",
  subheadline:
    "Premium private rides across Salt Lake City & Park City. Reliable, comfortable and personalized transportation — designed to elevate your journey.",
  logoSrc: streexLogo,

  // ─── CONTACT ─────────────────────────────────
  phone: "+18017974971",
  phoneDisplay: "(801) 797-4971",
  email: "streex.rides@gmail.com",
  website: "https://rides.getstreex.com",

  // ─── SOCIAL ──────────────────────────────────
  instagram: "streex.rides",
  instagramUrl: "https://instagram.com/streex.rides",
  instagramDM: "https://ig.me/m/streex.rides",
  whatsapp: "https://wa.me/18017974971",
  googleReviews: "",
  nextdoor: "",

  // ─── PAYMENT ─────────────────────────────────
  venmo: "https://venmo.com/juangaudino",
  cashapp: "https://cash.app/$juangaudino",
  applePayPhone: "+18017974971",
  applePayPhoneDisplay: "(801) 797-4971",

  // ─── BOOKING ─────────────────────────────────
  calUrl: "https://cal.com/streex-riders",

  // ─── WIFI ────────────────────────────────────
  wifiName: "STREEX-5G",
  wifiPassword: null as string | null,

  // ─── COLORS ──────────────────────────────────
  accentColor: "#E6CE20",
  backgroundColor: "#0B0B0B",

  // ─── TICKER SERVICES ─────────────────────────
  // Options: "boarding" | "pill"
  tickerStyle: "boarding",
  tickerServices: [
    "Airport Transfers",
    "Park City",
    "Scheduled Rides",
    "Hourly Service",
    "Corporate Travel",
    "Private Events",
    "Bilingual Service",
    "Las Vegas",
  ],

  // ─── HERO CHIPS ──────────────────────────────
  heroChips: ["Airport Rides", "Scheduled Rides", "Park City", "Long Distance", "Hourly Service"],

  // ─── SERVICES GRID ───────────────────────────
  services: [
    {
      id: "airport",
      icon: "PlaneTakeoff",
      name: "Airport Transfers",
      price: "From $40",
      subtitle: null as string | null,
      enabled: true,
    },
    {
      id: "parkcity",
      icon: "Mountain",
      name: "Park City",
      price: "From $80",
      subtitle: null as string | null,
      enabled: true,
    },
    {
      id: "scheduled",
      icon: "CalendarCheck",
      name: "Scheduled Rides",
      price: "From $40",
      subtitle: null as string | null,
      enabled: true,
    },
    {
      id: "hourly",
      icon: "Clock",
      name: "Hourly Service",
      price: "$60/hr · 40 mi included",
      subtitle: "$1 per additional mile" as string | null,
      enabled: true,
    },
    {
      id: "corporate",
      icon: "Briefcase",
      name: "Corporate Travel",
      price: "Contact for quote",
      subtitle: null as string | null,
      enabled: true,
    },
    {
      id: "longdistance",
      icon: "MapPin",
      name: "Long Distance",
      price: "Contact for quote",
      subtitle: null as string | null,
      enabled: true,
    },
    {
      id: "lasvegas",
      icon: "Sparkles",
      name: "Las Vegas",
      price: "Contact for quote",
      subtitle: null as string | null,
      enabled: false,
    }, // CONFIG: set true to activate
    {
      id: "privateevents",
      icon: "Star",
      name: "Private Events",
      price: "Contact for quote",
      subtitle: null as string | null,
      enabled: false,
    }, // CONFIG: set true to activate
  ],

  // ─── SECTIONS VISIBILITY ─────────────────────
  sections: {
    wifi: true,
    textMe: true,
    callMe: true,
    saveContact: true,
    scheduleRide: true,
    moreOptions: true,
    experienceGallery: true,
    servicesGrid: true,
    serviceAreas: true,
    reviews: true,
    whyStreex: true,
    meetJuan: true,
    paymentOptions: true,
    findUs: true,
    feedbackForm: true,
    faq: true,
  },

  // ─── TENANT MEDIA ────────────────────────────
  galleryImages: [
    { label: "Salt Lake City", image: "/images/streex/slc.jpg", microLabel: null as string | null },
    {
      label: "Park City",
      image: "/images/streex/park-city.jpg",
      microLabel: null as string | null,
    },
    {
      label: "SLC Airport",
      image: "/images/streex/airport.jpg",
      microLabel: null as string | null,
    },
    {
      label: "Mountain Routes",
      image: "/images/streex/mountains.jpg",
      microLabel: null as string | null,
    },
    {
      label: "Your Ride",
      image: "/images/streex/rav4.jpg",
      microLabel: "✦ Toyota RAV4 • Spacious SUV" as string | null,
    },
  ],

  // ─── WHY STREEX ──────────────────────────────
  whyStreexTitle: "Why Streex",
  whyStreexBody: [
    "Streex was created to offer something different — a more thoughtful, comfortable and elevated transportation experience in Utah. Every ride is designed around you: your schedule, your comfort, your experience.",
    "Built by someone with a background in branding and technology, Streex is more than a ride. It's the beginning of a better way to move.",
  ],

  // ─── MEET OWNER ──────────────────────────────
  meetTitle: "Meet Juan",
  meetPhoto: "/images/streex/juan.jpg",
  meetBody: [
    "Hi, I'm Juan — creator of Streex Rides.",
    "I believe transportation can be more than a ride — it can be a genuinely comfortable and thoughtful experience.",
    "Fluent in English and Spanish, with a background in branding, technology and creative projects, I built Streex around one simple idea: details matter.",
    "While continuing my studies at Weber State University, I'm building Streex as a more personal, elevated and human way to move around Utah.",
    "I look forward to being your driver.",
  ],

  // ─── AREAS SERVED ────────────────────────────
  areas: [
    "Salt Lake City",
    "Park City",
    "SLC Airport",
    "Ogden",
    "Farmington",
    "Layton",
    "Clearfield",
    "South Salt Lake",
    "Sandy",
    "Draper",
    "Provo",
    "Lehi",
    "Las Vegas",
    "Idaho",
  ],

  // ─── SEO ─────────────────────────────────────
  seoTitle: "Streex Rides | Private Rides in Salt Lake City, Park City & SLC Airport",
  seoDescription:
    "Private rides. Elevated. Premium private transportation across Salt Lake City, Park City, SLC Airport and surrounding Utah areas, including hourly service and long-distance rides to Las Vegas.",
  seoUrl: "https://rides.getstreex.com",
  ogImage: "https://rides.getstreex.com/images/streex/streex-og-preview-v2.jpg",
};

export type AppConfig = typeof CONFIG;
