import { Apple } from "lucide-react";

type Payment = {
  label: string;
  sublabel?: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
};

const VenmoMark = () => (
  <span
    style={{
      fontFamily: "Montserrat",
      fontWeight: 800,
      fontSize: 18,
      color: "#E6CE20",
      letterSpacing: "-0.02em",
      lineHeight: 1,
    }}
  >
    V
  </span>
);

const CashAppMark = () => (
  <span
    style={{
      fontFamily: "Montserrat",
      fontWeight: 800,
      fontSize: 18,
      color: "#E6CE20",
      lineHeight: 1,
    }}
  >
    $
  </span>
);

const PAYMENTS: Payment[] = [
  {
    label: "Venmo",
    href: "https://venmo.com/juangaudino",
    external: true,
    icon: <VenmoMark />,
  },
  {
    label: "Cash App",
    href: "https://cash.app/$juangaudino",
    external: true,
    icon: <CashAppMark />,
  },
  {
    label: "Apple Pay",
    sublabel: "(801) 797-4971",
    href: "tel:+18017974971",
    icon: <Apple className="h-5 w-5 text-[#E6CE20]" />,
  },
];

export function PaymentOptions() {
  return (
    <section className="px-5 mt-16">
      <h2 className="text-2xl font-bold mb-1 px-1">Payment Options</h2>
      <p className="text-sm text-white/55 mb-5 px-1">
        Quick and convenient payment methods.
      </p>
      <div className="grid grid-cols-3 gap-3">
        {PAYMENTS.map((p) => (
          <a
            key={p.label}
            href={p.href}
            target={p.external ? "_blank" : undefined}
            rel={p.external ? "noreferrer" : undefined}
            className="streex-glass p-4 flex flex-col items-center justify-center text-center gap-2 cursor-pointer"
          >
            <div className="h-10 w-10 rounded-full flex items-center justify-center bg-[#E6CE20]/12 border border-[#E6CE20]/25">
              {p.icon}
            </div>
            <div className="text-[13px] font-semibold text-white leading-tight">
              {p.label}
            </div>
            {p.sublabel && (
              <div className="text-[10px] text-white/55 leading-tight">
                {p.sublabel}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}