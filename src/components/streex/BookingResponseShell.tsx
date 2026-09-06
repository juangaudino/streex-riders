import { Check, AlertCircle } from "lucide-react";
import logo from "@/assets/brand/streex-rides-transparent.webp";

export type ResponseVariant = "accepted" | "declined" | "already" | "not_found" | "error";

type BookingResponseAction = "accept" | "decline";

export function BookingResponseShell({
  variant,
  action,
  isSubmitting = false,
  onRespond,
}: {
  variant: ResponseVariant | "ready" | "expired" | "legacy";
  action?: BookingResponseAction;
  isSubmitting?: boolean;
  onRespond?: () => void;
}) {
  const isPositive = variant === "accepted";
  const isNeutral = variant === "declined";
  const isError =
    variant === "not_found" ||
    variant === "error" ||
    variant === "already" ||
    variant === "expired" ||
    variant === "legacy";

  const titles: Record<typeof variant, string> = {
    accepted: "Your ride is confirmed.",
    declined: "No problem.",
    already: "Already processed",
    not_found: "Request not found",
    error: "Something went wrong",
    ready: action === "accept" ? "Confirm your ride" : "Decline this ride?",
    expired: "This secure link has expired",
    legacy: "This quote link has been retired",
  };

  const messages: Record<typeof variant, string> = {
    accepted: "See you soon!",
    declined: "Feel free to reach out anytime.",
    already: "This request has already been processed.",
    not_found: "We couldn't find that ride request.",
    error: "Please try again or contact Juan directly.",
    ready:
      action === "accept"
        ? "Reviewing this page does not confirm your ride. Choose Confirm when you are ready."
        : "Reviewing this page does not decline your ride. Choose Decline if you do not wish to proceed.",
    expired: "Please contact STREEX for a new secure quote link.",
    legacy: "Please contact STREEX to receive a new secure quote link.",
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

        {variant === "ready" && onRespond ? (
          <button
            type="button"
            onClick={onRespond}
            disabled={isSubmitting}
            className="mb-5 inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-[#E6CE20] px-5 text-sm font-semibold text-black transition-transform active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Updating your request…"
              : action === "accept"
                ? "Confirm ride"
                : "Decline ride"}
          </button>
        ) : null}

        <div className="streex-glass w-full p-5 text-left">
          <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-semibold mb-2">
            Juan &mdash; Streex Rides
          </div>
          <a href="tel:+18017974971" className="block text-base font-semibold text-white">
            (801) 797-4971
          </a>
          <a href="mailto:streex.rides@gmail.com" className="block text-sm text-white/70 mt-1">
            streex.rides@gmail.com
          </a>
        </div>
      </div>
    </div>
  );
}
