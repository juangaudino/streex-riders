export type LocationPageContent = {
  slug: "slc-airport-private-rides" | "park-city-private-transportation" | "las-vegas-private-rides";
  title: string;
  description: string;
  serviceName: string;
  eyebrow: string;
  intro: string;
  route: string;
  details: readonly string[];
  bestFor: readonly string[];
  questions: readonly { question: string; answer: string }[];
};

export const LOCATION_PAGES: Record<LocationPageContent["slug"], LocationPageContent> = {
  "slc-airport-private-rides": {
    slug: "slc-airport-private-rides",
    title: "SLC Airport Private Rides | Streex Rides",
    description:
      "Private transportation to and from Salt Lake City International Airport (SLC). Request a comfortable, personally coordinated airport ride with Streex Rides.",
    serviceName: "SLC Airport Private Rides",
    eyebrow: "Salt Lake City International Airport",
    intro:
      "A quieter way to begin or end a trip. Streex offers private, pre-requested rides to and from SLC Airport, coordinated around your schedule.",
    route: "SLC Airport ↔ Salt Lake City, Park City and the Wasatch Front",
    details: [
      "Request your pickup or drop-off details online and receive a personal quote before the ride is finalized.",
      "Use the notes field for flight details, luggage needs, meeting instructions or a preferred pickup time.",
      "Airport trips are scheduled around availability; advance notice is recommended, especially for early departures and mountain travel.",
    ],
    bestFor: [
      "Airport arrivals and departures",
      "SLC Airport to Park City travel",
      "Business and guest transportation",
      "Families, luggage and planned itineraries",
    ],
    questions: [
      {
        question: "How do I request an SLC Airport ride?",
        answer:
          "Open the booking form, select your date and requested time, then add your pickup and destination. Include flight or meeting details in the notes and Streex will follow up with a personal quote.",
      },
      {
        question: "Can I request a ride between SLC Airport and Park City?",
        answer:
          "Yes. SLC Airport and Park City trips can be requested through the same form. Availability, timing and conditions are reviewed before confirmation.",
      },
      {
        question: "How far ahead should I request airport transportation?",
        answer:
          "Online requests require at least 12 hours of notice. For airport, mountain or early-morning travel, requesting earlier is recommended.",
      },
    ],
  },
  "park-city-private-transportation": {
    slug: "park-city-private-transportation",
    title: "Park City Private Transportation | Streex Rides",
    description:
      "Private transportation between Salt Lake City, SLC Airport and Park City. Request a comfortable, personally coordinated ride with Streex Rides.",
    serviceName: "Park City Private Transportation",
    eyebrow: "Park City & Mountain Travel",
    intro:
      "Private transportation for Park City plans that deserve more than a generic rideshare. Streex coordinates scheduled rides from Salt Lake City, SLC Airport and across the Wasatch Front.",
    route: "Salt Lake City & SLC Airport ↔ Park City",
    details: [
      "Request a point-to-point ride for airport transfers, hotel arrivals, dinners, events or a planned mountain day.",
      "Include the exact pickup location, destination and timing so the route can be reviewed personally before confirmation.",
      "Mountain conditions and peak travel periods can affect availability, so advance requests are especially helpful.",
    ],
    bestFor: [
      "SLC Airport to Park City transfers",
      "Park City hotels, dining and events",
      "Ski resort and mountain-area travel",
      "Scheduled return rides to Salt Lake City",
    ],
    questions: [
      {
        question: "Does Streex serve Park City?",
        answer:
          "Yes. Streex accepts requests for private transportation to and from Park City, including Salt Lake City and SLC Airport routes.",
      },
      {
        question: "Can I request a return ride from Park City?",
        answer:
          "Yes. Add the date, time and route to your request. A return can be coordinated as a separate scheduled ride when availability allows.",
      },
      {
        question: "Do weather conditions affect Park City rides?",
        answer:
          "They can. Streex reviews timing and route conditions before confirmation, especially during winter or high-demand travel periods.",
      },
    ],
  },
  "las-vegas-private-rides": {
    slug: "las-vegas-private-rides",
    title: "Las Vegas Private Rides from Utah | Streex Rides",
    description:
      "Request a private long-distance ride between Utah and Las Vegas. Streex Rides provides personally quoted, scheduled transportation for custom itineraries.",
    serviceName: "Las Vegas Private Rides",
    eyebrow: "Long-Distance Transportation",
    intro:
      "For a long-distance route, the details matter. Streex accepts custom transportation requests between Utah and Las Vegas, planned around your itinerary and quoted personally before confirmation.",
    route: "Northern Utah ↔ Las Vegas, Nevada",
    details: [
      "Long-distance rides are custom requests rather than instant bookings, so the route, timing and passenger needs are reviewed first.",
      "Share your full pickup location, destination, date, preferred departure time and any planned stops in the booking notes.",
      "A quote and confirmation are provided before a long-distance ride is finalized; submitting a request does not charge you automatically.",
    ],
    bestFor: [
      "Utah to Las Vegas travel",
      "One-way or return itinerary requests",
      "Private events and group travel plans",
      "Custom long-distance transportation",
    ],
    questions: [
      {
        question: "Can I book a private ride from Utah to Las Vegas?",
        answer:
          "You can submit a long-distance request with your route, date, passenger count and any relevant details. Streex reviews each itinerary and responds with a personal quote when available.",
      },
      {
        question: "How is a Las Vegas ride priced?",
        answer:
          "Long-distance transportation is quoted individually because timing, route, passenger needs and stops vary. No automatic charge is made when you submit a request.",
      },
      {
        question: "How early should I request a long-distance ride?",
        answer:
          "Request as early as possible. Online booking requires at least 12 hours of notice, but long-distance trips need more planning and availability review.",
      },
    ],
  },
};
