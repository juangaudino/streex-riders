import { Apple } from "lucide-react";

type Payment = {
  label: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
};

const Mark = ({ children }: { children: React.ReactNode }) => (
  <span
    style={{
      fontFamily: "'Montserrat', sans-serif",
      fontWeight: 800,
      fontSize: 18,
      color: "#E6CE20",
      lineHeight: 1,
    }}
  >
    {children}
  </span>
);

const PAYMENTS: Payment[] = [
  {
    label: "Venmo",
    href: "https://venmo.com/juangaudino",
    external: true,
    icon: <Mark>V</Mark>,
  },
  {
    label: "Cash App",
    href: "https://cash.app/$juangaudino",
    external: true,
    icon: <Mark>$</Mark>,
  },
  {
    label: "Apple Pay",
    href: "tel:+18017974971",
    icon: <Apple className="h-5 w-5 text-[#E6CE20]" />,
  },
];

export function PaymentOptions() {
  return (
    <section className="px-5 mt-16">
      <h2 className="text-2xl font-bold mb-1 px-1">Payment Options</h2>
      <p className="text-sm text-white/55 mb-6 px-1">
        Quick and convenient payment methods.
      </p>
      <div className="flex items-center justify-center gap-6">
        {PAYMENTS.map((p) => (
          <a
            key={p.label}
            href={p.href}
            target={p.external ? "_blank" : undefined}
            rel={p.external ? "noreferrer" : undefined}
            aria-label={p.label}
            className="streex-pay-icon h-12 w-12 rounded-full flex items-center justify-center"
          >
            {p.icon}
          </a>
        ))}
      </div>
    </section>
  );
}