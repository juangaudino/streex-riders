import { createFileRoute } from "@tanstack/react-router";
import { Check, AlertCircle } from "lucide-react";
import { z } from "zod";
import { acceptBooking } from "@/lib/booking.functions";
import logo from "@/assets/streex-logo.png";

const Search = z.object({ id: z.string().optional() });

export const Route = createFileRoute("/booking/accept")({
  validateSearch: (s) => Search.parse(s),
  loaderDeps: ({ search: { id } }) => ({ id }),
  loader: async ({ deps }) => {
    if (!deps.id) return { state: "not_found" as const };
    try {
      const result = await acceptBooking({ data: { id: deps.id } });
      if (result.status === "not_found") return { state: "not_found" as const };
      if (result.status === "already_processed")
        return { state: "already" as const };
      return { state: "ok" as const };
    } catch {
      return { state: "error" as const };
    }
  },
  component: AcceptPage,
});

function AcceptPage() {
  const { state } = Route.useLoaderData();
  return <ResponseShell variant={state === "ok" ? "accepted" : state} />;
}

type Variant = "accepted" | "declined" | "already" | "not_found" | "error";

export function ResponseShell({ variant }: { variant: Variant }) {
  const isPositive = variant === "accepted";
  const isNeutral = variant === "declined";
  const isError = variant === "not_found" || variant === "error" || variant === "already";

  const titles: Record<Variant, string> = {
    accepted: "Your ride is confirmed.",
    declined: "No problem.",
    already: "Already processed",
    not_found: "Request not found",
    error: "Something went wrong",
  };

  const messages: Record<Variant, string> = {
    accepted: "See you soon!",
    declined: "Feel free to reach out anytime.",
    already: "This request has already been processed.",
    not_found: "We couldn't find that ride request.",
    error: "Please try again or contact Juan directly.",
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white flex flex-col items-center justify-center px-6 py-16 relative">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(230,206,32,0.10) 0%, transparent 70%)",
        }}
      />
      <div className="relative w-full max-w-sm flex flex-col items-center text-center">
        <img src={logo} alt="Streex" className="w-32 h-auto streex-logo-glow mb-8" />

        <div
          className={`h-16 w-16 rounded-full flex items-center justify-center mb-6 border ${
            isPositive
              ? "bg-[#E6CE20]/15 border-[#E6CE20]/40"
              : isNeutral
              ? "bg-white/[0.05] border-white/15"
              : "bg-white/[0.04] border-white/10"
          }`}
        >
          {isPositive ? (
            <Check className="h-7 w-7 text-[#E6CE20]" strokeWidth={2.4} />
          ) : isError ? (
            <AlertCircle className="h-7 w-7 text-white/70" strokeWidth={2} />
          ) : (
            <Check className="h-7 w-7 text-white/70" strokeWidth={2} />
          )}
        </div>

        <h1 className="text-2xl font-bold mb-2">{titles[variant]}</h1>
        <p className="text-sm text-white/65 mb-8">{messages[variant]}</p>

        <div className="streex-glass w-full p-5 text-left">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-semibold mb-2">
            Juan &mdash; Streex Rides
          </div>
          <a
            href="tel:+18017974971"
            className="block text-base font-semibold text-white"
          >
            (801) 797-4971
          </a>
          <a
            href="mailto:streex.rides@gmail.com"
            className="block text-sm text-white/70 mt-1"
          >
            streex.rides@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}