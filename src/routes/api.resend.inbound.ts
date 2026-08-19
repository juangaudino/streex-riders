import { createFileRoute } from "@tanstack/react-router";

const RESEND_API_URL = "https://api.resend.com";
const MAX_WEBHOOK_AGE_SECONDS = 5 * 60;
const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;
const FORWARD_TO = process.env.INBOUND_FORWARD_TO || "streex.rides@gmail.com";
const FORWARD_FROM = process.env.INBOUND_FORWARD_FROM || "STREEX Rides <juan@rides.getstreex.com>";

type ResendInboundEvent = {
  type?: string;
  data?: {
    email_id?: string;
    subject?: string;
  };
};

type ReceivedEmail = {
  id: string;
  from?: string;
  to?: string[];
  subject?: string;
  html?: string | null;
  text?: string | null;
  reply_to?: string[] | null;
  attachments?: Array<{
    id: string;
    filename?: string;
    content_type?: string;
    size?: number;
  }>;
};

type ReceivedAttachment = {
  id: string;
  filename: string;
  content_type?: string;
  size?: number;
  download_url?: string;
};

function base64ToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  const binary = atob(padded);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let result = 0;
  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return result === 0;
}

async function verifyResendWebhook(
  payload: string,
  request: Request,
  secret: string,
): Promise<boolean> {
  const id = request.headers.get("svix-id");
  const timestamp = request.headers.get("svix-timestamp");
  const signature = request.headers.get("svix-signature");
  if (!id || !timestamp || !signature) return false;

  const timestampSeconds = Number(timestamp);
  if (!Number.isFinite(timestampSeconds)) return false;
  if (Math.abs(Date.now() / 1000 - timestampSeconds) > MAX_WEBHOOK_AGE_SECONDS) {
    return false;
  }

  const secretBytes = base64ToBytes(secret.replace(/^whsec_/, ""));
  const key = await crypto.subtle.importKey(
    "raw",
    secretBytes.buffer as ArrayBuffer,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signedContent = `${id}.${timestamp}.${payload}`;
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedContent).buffer as ArrayBuffer,
  );
  const expected = bytesToBase64(new Uint8Array(digest));

  return signature.split(" ").some((candidate) => {
    const [version, value] = candidate.split(",", 2);
    return version === "v1" && value ? constantTimeEqual(value, expected) : false;
  });
}

function safeHeaderValue(value: string | undefined): string | undefined {
  if (!value || value.length > 320 || /[\r\n]/.test(value)) return undefined;
  return value;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function resendRequest<T>(path: string, apiKey: string): Promise<T> {
  const response = await fetch(`${RESEND_API_URL}${path}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend API ${response.status}: ${body.slice(0, 300)}`);
  }
  return response.json() as Promise<T>;
}

async function downloadAttachment(
  attachment: ReceivedAttachment,
): Promise<{ filename: string; content: string; content_type?: string } | null> {
  if (!attachment.download_url || !attachment.filename) return null;
  if (attachment.size && attachment.size > MAX_ATTACHMENT_BYTES) {
    console.warn(`[Resend inbound] Skipping oversized attachment: ${attachment.filename}`);
    return null;
  }

  const response = await fetch(attachment.download_url);
  if (!response.ok) {
    console.warn(`[Resend inbound] Attachment download failed: ${attachment.filename}`);
    return null;
  }
  const buffer = await response.arrayBuffer();
  if (buffer.byteLength > MAX_ATTACHMENT_BYTES) {
    console.warn(`[Resend inbound] Skipping oversized attachment: ${attachment.filename}`);
    return null;
  }
  return {
    filename: attachment.filename,
    content: bytesToBase64(new Uint8Array(buffer)),
    content_type: attachment.content_type,
  };
}

async function forwardReceivedEmail(email: ReceivedEmail, apiKey: string): Promise<void> {
  const subject = email.subject?.trim() || "New message for STREEX Rides";
  const originalFrom = safeHeaderValue(email.from);
  const replyTo = safeHeaderValue(email.reply_to?.[0]) || originalFrom;
  const text = email.text || "";
  const html =
    email.html || `<pre style="white-space:pre-wrap;font:inherit;">${escapeHtml(text)}</pre>`;
  const header = `<div style="margin-bottom:20px;padding:12px 16px;border-left:3px solid #E6CE20;background:#f7f7f7;color:#333;font:14px/1.5 Arial,sans-serif;">`;
  const forwardedHeader = `${header}<strong>Forwarded to STREEX Rides</strong><br/>From: ${escapeHtml(originalFrom || "Unknown sender")}<br/>To: ${escapeHtml((email.to || []).join(", "))}</div>`;

  let attachments: Array<{ filename: string; content: string; content_type?: string }> = [];
  if (email.attachments?.length) {
    const attachmentList = await resendRequest<{ data?: ReceivedAttachment[] }>(
      `/emails/receiving/${encodeURIComponent(email.id)}/attachments`,
      apiKey,
    );
    const downloaded = await Promise.all(
      (attachmentList.data || []).map((attachment) => downloadAttachment(attachment)),
    );
    attachments = downloaded.filter(
      (attachment): attachment is { filename: string; content: string; content_type?: string } =>
        Boolean(attachment),
    );
  }

  const payload: Record<string, unknown> = {
    from: FORWARD_FROM,
    to: [FORWARD_TO],
    subject: `[STREEX] ${subject}`,
    html: `${forwardedHeader}${html}`,
    text: `Forwarded to STREEX Rides\nFrom: ${originalFrom || "Unknown sender"}\n\n${text}`,
  };
  if (replyTo) payload.reply_to = replyTo;
  if (attachments.length) payload.attachments = attachments;

  const response = await fetch(`${RESEND_API_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Resend forwarding failed [${response.status}]: ${body.slice(0, 300)}`);
  }
}

export const Route = createFileRoute("/api/resend/inbound")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = process.env.RESEND_API_KEY;
        const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
        if (!apiKey || !webhookSecret) {
          console.error("[Resend inbound] Missing RESEND_API_KEY or RESEND_WEBHOOK_SECRET.");
          return Response.json({ error: "Inbound email is not configured." }, { status: 503 });
        }

        const payload = await request.text();
        if (!(await verifyResendWebhook(payload, request, webhookSecret))) {
          return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
        }

        let event: ResendInboundEvent;
        try {
          event = JSON.parse(payload) as ResendInboundEvent;
        } catch {
          return Response.json({ error: "Invalid webhook payload." }, { status: 400 });
        }

        if (event.type !== "email.received") {
          return Response.json({ ok: true, ignored: true });
        }

        const emailId = event.data?.email_id;
        if (!emailId) return Response.json({ error: "Missing email id." }, { status: 400 });

        const email = await resendRequest<ReceivedEmail>(
          `/emails/receiving/${encodeURIComponent(emailId)}`,
          apiKey,
        );
        await forwardReceivedEmail(email, apiKey);

        return Response.json({ ok: true, forwarded: true });
      },
    },
  },
});
