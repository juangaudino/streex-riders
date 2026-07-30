// Server-only: sends transactional emails through Resend.
// Imported only from server functions / server routes.

const FROM = process.env.EMAIL_FROM || "Streex Rides <onboarding@resend.dev>";
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "streex.rides@gmail.com";
const SITE_URL = process.env.SITE_URL || "https://rides.getstreex.com";
const JUAN_PHONE = "(801) 797-4971";

export { ADMIN_EMAIL, SITE_URL, JUAN_PHONE };

export type TenantEmailBrand = {
  brandName: string;
  ownerName: string;
  phone: string;
  email: string;
  siteUrl: string;
};

const DEFAULT_BRAND: TenantEmailBrand = {
  brandName: "Streex Rides",
  ownerName: "Juan",
  phone: JUAN_PHONE,
  email: ADMIN_EMAIL,
  siteUrl: SITE_URL,
};

export async function getTenantEmailBrand(tenantId: string): Promise<TenantEmailBrand> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: tenant } = await supabaseAdmin
    .from("tenants")
    .select("slug,display_name,owner_name,owner_email,owner_phone")
    .eq("id", tenantId)
    .maybeSingle();
  if (!tenant) return DEFAULT_BRAND;
  return {
    brandName: tenant.display_name,
    ownerName: tenant.owner_name,
    phone: tenant.owner_phone || DEFAULT_BRAND.phone,
    email: tenant.owner_email,
    siteUrl: tenantId === "streex" ? SITE_URL : `${SITE_URL}/${tenant.slug}`,
  };
}

type SendArgs = {
  to: string | string[];
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: SendArgs) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    console.warn("[Resend] RESEND_API_KEY is not configured. Skipping email send.");
    return { skipped: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    console.error(`[Resend] Send failed ${res.status}: ${body}`);
    throw new Error(`Email send failed [${res.status}]`);
  }
  return res.json();
}

function esc(s: string | number | null | undefined) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const wrap = (inner: string, brand: TenantEmailBrand = DEFAULT_BRAND) => `
<div style="background:#0B0B0B;padding:32px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#ffffff;">
  <div style="max-width:560px;margin:0 auto;background:#141414;border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:32px 28px;">
    <div style="font-size:11px;letter-spacing:0.22em;text-transform:uppercase;color:#E6CE20;font-weight:600;margin-bottom:18px;">${esc(brand.brandName)}</div>
    ${inner}
    <div style="margin-top:32px;padding-top:18px;border-top:1px solid rgba(255,255,255,0.08);font-size:11px;color:rgba(255,255,255,0.4);">
      ${esc(brand.brandName)} &middot; ${esc(brand.phone)} &middot; ${esc(brand.email)}
    </div>
  </div>
</div>`;

const p = (txt: string) =>
  `<p style="font-size:14px;line-height:1.6;color:rgba(255,255,255,0.85);margin:0 0 14px;">${txt}</p>`;

const detailRow = (label: string, value: string) => `
<tr>
  <td style="padding:6px 0;font-size:13px;color:rgba(255,255,255,0.55);width:120px;">${esc(label)}</td>
  <td style="padding:6px 0;font-size:14px;color:#ffffff;font-weight:500;">${esc(value)}</td>
</tr>`;

const button = (label: string, href: string, variant: "primary" | "secondary" = "primary") => {
  const styles =
    variant === "primary"
      ? "background:#E6CE20;color:#0B0B0B;"
      : "background:transparent;color:#ffffff;border:1px solid rgba(255,255,255,0.25);";
  return `<a href="${esc(href)}" style="display:inline-block;${styles}font-weight:600;font-size:14px;padding:14px 22px;border-radius:999px;text-decoration:none;margin:6px 4px;">${esc(label)}</a>`;
};

type Booking = {
  id: string;
  service_type?: string | null;
  name: string;
  phone: string;
  email: string;
  pickup: string;
  destination: string;
  date: string;
  time: string;
  estimated_duration_minutes?: number | null;
  passengers: number;
  notes: string | null;
  price: number | null;
};

const detailsTable = (b: Booking, opts: { showPrice?: boolean } = {}) => `
<table style="width:100%;border-collapse:collapse;margin:8px 0 18px;">
  ${detailRow("Service", b.service_type === "hourly" ? "Hourly Service" : "Point to Point")}
  ${detailRow("From", b.pickup)}
  ${detailRow("To", b.destination)}
  ${detailRow("Date", b.date)}
  ${detailRow("Time", b.time)}
  ${
    b.service_type === "hourly" && b.estimated_duration_minutes
      ? detailRow("Reserved", `${Math.round(b.estimated_duration_minutes / 60)} hr`)
      : ""
  }
  ${detailRow("Passengers", String(b.passengers))}
  ${opts.showPrice && b.price != null ? detailRow("Price", `$${Number(b.price).toFixed(2)}`) : ""}
</table>`;

export function buildPassengerConfirmation(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  return {
    subject: "Ride Request Received — Streex Rides",
    html: wrap(
      `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:#ffffff;">Hi ${esc(b.name)},</h1>
      ${p("We received your ride request:")}
      ${detailsTable(b)}
      ${p(`${esc(brand.ownerName)} will review your request and send you a price quote shortly.`)}
      ${p(`&mdash; ${esc(brand.brandName)}`)}
    `,
      brand,
    ),
  };
}

export function buildAdminNewRequest(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  const wa = `https://wa.me/${b.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi ${b.name}, this is ${brand.ownerName} from ${brand.brandName}. I received your ride request from ${b.pickup} to ${b.destination} on ${b.date} at ${b.time}.`,
  )}`;
  return {
    subject: `New Ride Request — ${b.name}`,
    html: wrap(
      `
      <h1 style="font-size:20px;font-weight:700;margin:0 0 16px;color:#ffffff;">New ride request received</h1>
      <table style="width:100%;border-collapse:collapse;margin:8px 0 18px;">
        ${detailRow("Name", b.name)}
        ${detailRow("Phone", b.phone)}
        ${detailRow("Email", b.email)}
        ${detailRow("Service", b.service_type === "hourly" ? "Hourly Service" : "Point to Point")}
        ${detailRow("From", b.pickup)}
        ${detailRow("To", b.destination)}
        ${detailRow("Date", b.date)}
        ${detailRow("Time", b.time)}
        ${
          b.service_type === "hourly" && b.estimated_duration_minutes
            ? detailRow("Reserved", `${Math.round(b.estimated_duration_minutes / 60)} hr`)
            : ""
        }
        ${detailRow("Passengers", String(b.passengers))}
        ${b.notes ? detailRow("Notes", b.notes) : ""}
      </table>
      <div style="margin-top:8px;">${button("Reply via WhatsApp", wa)}</div>
    `,
      brand,
    ),
  };
}

export function buildPassengerQuote(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  const accept = `${SITE_URL}/booking/accept?id=${encodeURIComponent(b.id)}`;
  const decline = `${SITE_URL}/booking/decline?id=${encodeURIComponent(b.id)}`;
  return {
    subject: "Your Ride Quote — Streex Rides",
    html: wrap(
      `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:#ffffff;">Hi ${esc(b.name)},</h1>
      ${p("Here is your quote for the requested ride:")}
      ${detailsTable(b, { showPrice: true })}
      ${p("Please confirm or decline using the buttons below:")}
      <div style="margin-top:14px;">
        ${button("Accept Ride", accept, "primary")}
        ${button("Decline Ride", decline, "secondary")}
      </div>
    `,
      brand,
    ),
  };
}

export function buildPassengerConfirmed(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  return {
    subject: "Your Ride is Confirmed — Streex Rides",
    html: wrap(
      `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:#ffffff;">Hi ${esc(b.name)},</h1>
      ${p("Great news! Your ride is confirmed.")}
      ${detailsTable(b, { showPrice: true })}
      ${p(`See you soon!<br/>&mdash; ${esc(brand.ownerName)}, ${esc(brand.brandName)}<br/>${esc(brand.phone)}`)}
    `,
      brand,
    ),
  };
}

export function buildAdminConfirmed(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  return {
    subject: `Booking Confirmed — ${b.name}`,
    html: wrap(
      p(
        `${esc(b.name)} accepted the quote of $${Number(b.price ?? 0).toFixed(2)} for ${esc(b.date)} at ${esc(b.time)}.`,
      ),
      brand,
    ),
  };
}

export function buildPassengerDeclined(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  return {
    subject: "Ride Request Update — Streex Rides",
    html: wrap(
      `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:#ffffff;">Hi ${esc(b.name)},</h1>
      ${p("We understand. If you change your mind or need to discuss options, feel free to reach out directly:")}
      ${p(`${esc(brand.ownerName)} &mdash; ${esc(brand.brandName)}<br/>${esc(brand.phone)}<br/>${esc(brand.email)}`)}
    `,
      brand,
    ),
  };
}

export function buildPassengerRejected(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  return {
    subject: "Ride Request Update — Streex Rides",
    html: wrap(
      `
      <h1 style="font-size:22px;font-weight:700;margin:0 0 16px;color:#ffffff;">Hi ${esc(b.name)},</h1>
      ${p(`Unfortunately, STREEX is not available for your requested ride on ${esc(b.date)} at ${esc(b.time)}.`)}
      ${p(`If your schedule is flexible, contact ${esc(brand.ownerName)} directly and we’ll gladly look for another option.`)}
      ${p(`${esc(brand.ownerName)} &mdash; ${esc(brand.brandName)}<br/>${esc(brand.phone)}<br/>${esc(brand.email)}`)}
    `,
      brand,
    ),
  };
}

export function buildAdminDeclined(b: Booking, brand: TenantEmailBrand = DEFAULT_BRAND) {
  return {
    subject: `Booking Declined — ${b.name}`,
    html: wrap(p(`${esc(b.name)} declined the quote for ${esc(b.date)} at ${esc(b.time)}.`), brand),
  };
}
