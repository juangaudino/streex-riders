import type { AppConfig } from "@/config";

type Payment = {
  label: string;
  href: string;
  external?: boolean;
  icon: React.ReactNode;
};

const VenmoIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="#E6CE20">
    <path d="M19.5 1.5c.8 1.3 1.1 2.6 1.1 4.3 0 5.4-4.6 12.4-8.3 17.3H4.9L2 2.3l6.6-.6 1.5 12.1c1.4-2.3 3.1-6 3.1-8.5 0-1.4-.2-2.3-.6-3.1L19.5 1.5z" />
  </svg>
);

const CashAppIcon = () => (
  <svg viewBox="0 0 24 24" width="22" height="22" fill="#E6CE20">
    <path d="M13.608 2.467c-.297-.088-.6.08-.688.377l-.407 1.374a5.33 5.33 0 00-.513-.05C9.5 4.168 7.5 5.8 7.5 8c0 2 1.5 3.1 3.3 3.7l1.5.5c1 .3 1.2.8 1.2 1.3 0 .8-.8 1.5-2.1 1.5-.9 0-1.9-.3-2.7-.8l-.4 1.4c.7.4 1.6.7 2.5.8l-.4 1.4c-.1.3.1.6.4.7l1 .3c.3.1.6-.1.7-.4l.4-1.4c2.1-.2 3.5-1.7 3.5-3.5 0-1.8-1.1-2.9-3-3.5l-1.5-.5c-.9-.3-1.3-.7-1.3-1.3 0-.8.7-1.3 1.8-1.3.8 0 1.6.3 2.2.6l.4-1.4c-.6-.3-1.2-.5-1.9-.6l.4-1.4c.1-.3-.1-.6-.4-.7l-1-.3z" />
  </svg>
);

const ApplePayIcon = () => (
  <svg viewBox="0 0 24 24" width="26" height="26" fill="#E6CE20">
    <path d="M12.005 3.16c-.8.96-2.08 1.71-3.33 1.6-.16-1.27.46-2.62 1.2-3.45C10.67.33 12.03-.37 13.14-.5c.13 1.31-.38 2.59-1.135 3.66zm1.12 1.76c-1.84-.11-3.41 1.05-4.28 1.05-.88 0-2.21-.99-3.66-.96-1.88.03-3.63 1.1-4.59 2.79-1.97 3.4-.51 8.44 1.4 11.21.94 1.37 2.07 2.89 3.55 2.84 1.4-.06 1.95-.91 3.65-.91 1.71 0 2.2.91 3.68.88 1.54-.03 2.51-1.38 3.45-2.75 1.08-1.57 1.53-3.09 1.56-3.17-.03-.01-3-1.15-3.03-4.54-.03-2.84 2.32-4.2 2.43-4.27-1.33-1.97-3.4-2.18-4.12-2.21z" />
  </svg>
);

function getPayments(config: AppConfig): Payment[] {
  return [
    {
      label: "Venmo",
      href: config.venmo,
      external: true,
      icon: <VenmoIcon />,
    },
    {
      label: "Cash App",
      href: config.cashapp,
      external: true,
      icon: <CashAppIcon />,
    },
    {
      label: "Apple Pay",
      href: `tel:${config.applePayPhone}`,
      icon: <ApplePayIcon />,
    },
  ];
}

export function PaymentOptions({ config }: { config: AppConfig }) {
  const payments = getPayments(config);

  return (
    <section className="px-5 mt-8">
      <h2 className="text-2xl font-bold mb-1 px-1">Payment Options</h2>
      <p className="text-sm text-white/55 mb-6 px-1">Quick and convenient payment methods.</p>
      <div className="flex items-center justify-center gap-6">
        {payments.map((p) => (
          <a
            key={p.label}
            href={p.href}
            target={p.external ? "_blank" : undefined}
            rel={p.external ? "noreferrer" : undefined}
            aria-label={p.label}
            className="flex flex-col items-center"
          >
            <span className="streex-pay-icon h-12 w-12 rounded-full flex items-center justify-center">
              {p.icon}
            </span>
            <span
              style={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 500,
                fontSize: 10,
                color: "rgba(255,255,255,0.6)",
                marginTop: 6,
                letterSpacing: "0.05em",
                textAlign: "center",
              }}
            >
              {p.label}
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
