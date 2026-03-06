import { createHash } from "node:crypto";
import nodemailer from "nodemailer";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ContactPayload = {
  e?: string;
  m?: string;
  h?: string;
  t?: string;
  d?: {
    b?: string;
    l?: string;
    z?: string;
    s?: string;
  };
};

type ContactGuardState = {
  ipAttempts: Map<string, number[]>;
  senderCooldown: Map<string, number>;
  duplicateMessages: Map<string, number>;
};

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 6;
const BURST_WINDOW_MS = 60 * 1000;
const MAX_REQUESTS_PER_BURST = 3;
const COOLDOWN_MS = 45 * 1000;
const DUPLICATE_MESSAGE_WINDOW_MS = 30 * 60 * 1000;
const MIN_FORM_FILL_MS = 2500;
const MAX_FORM_AGE_MS = 2 * 60 * 60 * 1000;
const MAX_URLS_IN_MESSAGE = 4;
const MAX_GUARD_ENTRIES = 5000;

function getGuardState() {
  const globalWithGuard = globalThis as typeof globalThis & { __contactGuardState?: ContactGuardState };

  if (!globalWithGuard.__contactGuardState) {
    globalWithGuard.__contactGuardState = {
      ipAttempts: new Map<string, number[]>(),
      senderCooldown: new Map<string, number>(),
      duplicateMessages: new Map<string, number>(),
    };
  }

  return globalWithGuard.__contactGuardState;
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST;
  const portValue = process.env.SMTP_PORT;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const destinationEmail = process.env.CONTACT_DESTINATION_EMAIL;

  if (!host || !portValue || !user || !pass || !destinationEmail) return null;

  const port = Number(portValue);
  if (!Number.isInteger(port) || port <= 0) return null;

  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  const from = process.env.SMTP_FROM ?? user;

  return { host, port, user, pass, secure, from, destinationEmail };
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeText(value: unknown, maxLength = 1200) {
  return String(value ?? "").trim().slice(0, maxLength);
}

function countUrls(text: string) {
  return (text.match(/(?:https?:\/\/|www\.)/gi) ?? []).length;
}

function buildClientRateKey(ipAddress: string, senderEmail: string) {
  const safeEmail = senderEmail.toLowerCase();
  return ipAddress ? `ip:${ipAddress}` : `sender:${safeEmail}`;
}

function buildMessageFingerprint(senderEmail: string, message: string) {
  return createHash("sha256")
    .update(senderEmail.toLowerCase())
    .update("\n")
    .update(message.trim().toLowerCase())
    .digest("hex");
}

function trimMapSize<T>(map: Map<string, T>) {
  while (map.size > MAX_GUARD_ENTRIES) {
    const oldestKey = map.keys().next().value;
    if (!oldestKey) break;
    map.delete(oldestKey);
  }
}

function cleanupGuardState(state: ContactGuardState, now: number) {
  for (const [key, timestamps] of state.ipAttempts) {
    const active = timestamps.filter((ts) => now - ts <= RATE_LIMIT_WINDOW_MS);
    if (active.length === 0) state.ipAttempts.delete(key);
    else state.ipAttempts.set(key, active);
  }

  for (const [key, blockedUntil] of state.senderCooldown) {
    if (blockedUntil <= now) state.senderCooldown.delete(key);
  }

  for (const [key, blockedUntil] of state.duplicateMessages) {
    if (blockedUntil <= now) state.duplicateMessages.delete(key);
  }

  trimMapSize(state.ipAttempts);
  trimMapSize(state.senderCooldown);
  trimMapSize(state.duplicateMessages);
}

function jsonRateLimit(error: string, retryAfterSeconds: number) {
  const response = NextResponse.json({ error }, { status: 429 });
  response.headers.set("Retry-After", String(Math.max(1, retryAfterSeconds)));
  return response;
}

function newlineToBr(value: string) {
  return escapeHtml(value).replaceAll("\n", "<br/>");
}

function readRequestMetadata(request: Request) {
  const rawIp =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0] ??
    "";

  return {
    requestUserAgent: normalizeText(request.headers.get("user-agent"), 1500),
    ipAddress: normalizeText(rawIp, 120),
    country: normalizeText(request.headers.get("cf-ipcountry"), 80),
    region: normalizeText(request.headers.get("cf-region"), 120),
    city: normalizeText(request.headers.get("cf-ipcity"), 120),
  };
}

function renderMetadataRows(metadata: Record<string, string>) {
  return Object.entries(metadata)
    .filter(([, value]) => Boolean(value))
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 10px;border:1px solid #cfdae8;font-weight:600;width:190px;background:#f3f8ff;color:#184f84;">${escapeHtml(
          label,
        )}</td><td style="padding:8px 10px;border:1px solid #cfdae8;background:#ffffff;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");
}

function renderHtmlEmail(params: {
  senderEmail: string;
  message: string;
  serverReceivedAt: string;
  metadata: Record<string, string>;
}) {
  const metadataRows = renderMetadataRows(params.metadata);

  return `
    <div style="margin:0;padding:24px;background:#eff3f8;font-family:Segoe UI,Helvetica,Arial,sans-serif;color:#1f2937;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:760px;margin:0 auto;background:#ffffff;border:1px solid #cfd8e3;border-radius:14px;overflow:hidden;box-shadow:0 8px 24px rgba(18,38,63,0.08);">
        <tr>
          <td style="padding:18px 24px;border-bottom:1px solid #d6deea;background:linear-gradient(180deg,#edf5ff 0%,#f7fbff 100%);">
            <p style="margin:0;font-size:12px;letter-spacing:0.1em;text-transform:uppercase;color:#2a79c3;font-weight:700;">Portfolio Contact</p>
          </td>
        </tr>

        <tr>
          <td style="padding:20px 24px 12px;">
            <p style="margin:0 0 12px;font-size:14px;color:#4b5563;">Sender</p>
            <p style="margin:0;display:inline-block;padding:8px 10px;border:1px solid #bdd5f2;border-radius:10px;background:#f4f9ff;font-size:16px;font-weight:600;color:#0f4e86;">${escapeHtml(params.senderEmail)}</p>
          </td>
        </tr>

        <tr>
          <td style="padding:12px 24px 16px;">
            <p style="margin:0 0 12px;font-size:14px;color:#4b5563;">Message</p>
            <div style="padding:14px;border:1px solid #cfd8e3;border-radius:10px;background:#f9fbff;font-size:15px;line-height:1.6;white-space:normal;">
              ${newlineToBr(params.message)}
            </div>
          </td>
        </tr>

        <tr>
          <td style="padding:8px 24px 24px;">
            <p style="margin:0 0 10px;font-size:14px;color:#4b5563;">Submission details</p>
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:collapse;font-size:13px;line-height:1.5;">
              ${metadataRows}
            </table>
          </td>
        </tr>
      </table>
    </div>
  `;
}

export async function POST(request: Request) {
  const smtp = getSmtpConfig();
  if (!smtp) {
    return NextResponse.json(
      { error: "Contact service is not configured yet." },
      { status: 500 },
    );
  }

  let payload: ContactPayload;
  try {
    payload = (await request.json()) as ContactPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const senderEmail = String(payload.e ?? "").trim();
  const message = String(payload.m ?? "").trim();
  const companyWebsite = normalizeText(payload.h, 300);
  const formStartedAt = normalizeText(payload.t, 40);
  const clientMetadata = {
    browser: normalizeText(payload.d?.b, 120),
    language: normalizeText(payload.d?.l, 120),
    timezone: normalizeText(payload.d?.z, 120),
    screenSize: normalizeText(payload.d?.s, 60),
  };
  const requestMetadata = readRequestMetadata(request);
  const now = Date.now();

  // Honeypot field: bots often fill hidden fields. Return success without sending.
  if (companyWebsite) {
    return NextResponse.json({ ok: true });
  }

  const startedAtMs = Number(formStartedAt);
  if (!Number.isFinite(startedAtMs) || startedAtMs <= 0) {
    return NextResponse.json({ error: "Invalid form state. Please refresh and try again." }, { status: 400 });
  }

  const formAgeMs = now - startedAtMs;
  if (formAgeMs < MIN_FORM_FILL_MS) {
    return jsonRateLimit("Please wait a few seconds before sending.", Math.ceil((MIN_FORM_FILL_MS - formAgeMs) / 1000));
  }

  if (formAgeMs > MAX_FORM_AGE_MS) {
    return NextResponse.json(
      { error: "This form has expired. Please refresh the page and try again." },
      { status: 400 },
    );
  }

  if (!senderEmail || !message) {
    return NextResponse.json(
      { error: "Sender email and message are required." },
      { status: 400 },
    );
  }

  if (!isValidEmail(senderEmail)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  if (message.length < 8 || message.length > 5000) {
    return NextResponse.json(
      { error: "Message should be between 8 and 5000 characters." },
      { status: 400 },
    );
  }

  if (countUrls(message) > MAX_URLS_IN_MESSAGE) {
    return NextResponse.json(
      { error: "Message contains too many links. Please keep it concise." },
      { status: 400 },
    );
  }

  const guard = getGuardState();
  cleanupGuardState(guard, now);

  const clientKey = buildClientRateKey(requestMetadata.ipAddress, senderEmail);
  const attempts = guard.ipAttempts.get(clientKey) ?? [];
  const attemptsInWindow = attempts.filter((ts) => now - ts <= RATE_LIMIT_WINDOW_MS);
  const attemptsInBurst = attemptsInWindow.filter((ts) => now - ts <= BURST_WINDOW_MS);

  if (attemptsInBurst.length >= MAX_REQUESTS_PER_BURST) {
    const earliestBurst = attemptsInBurst[0] ?? now;
    const retrySeconds = Math.ceil((earliestBurst + BURST_WINDOW_MS - now) / 1000);
    return jsonRateLimit("Too many requests. Please try again shortly.", retrySeconds);
  }

  if (attemptsInWindow.length >= MAX_REQUESTS_PER_WINDOW) {
    const earliestWindow = attemptsInWindow[0] ?? now;
    const retrySeconds = Math.ceil((earliestWindow + RATE_LIMIT_WINDOW_MS - now) / 1000);
    return jsonRateLimit("Rate limit reached. Please try again later.", retrySeconds);
  }

  const cooldownKey = `${clientKey}|${senderEmail.toLowerCase()}`;
  const senderBlockedUntil = guard.senderCooldown.get(cooldownKey) ?? 0;
  if (senderBlockedUntil > now) {
    return jsonRateLimit(
      "Please wait before sending another message.",
      Math.ceil((senderBlockedUntil - now) / 1000),
    );
  }

  const duplicateKey = buildMessageFingerprint(senderEmail, message);
  const duplicateBlockedUntil = guard.duplicateMessages.get(duplicateKey) ?? 0;
  if (duplicateBlockedUntil > now) {
    return jsonRateLimit(
      "Duplicate message detected. Please avoid re-sending the same text.",
      Math.ceil((duplicateBlockedUntil - now) / 1000),
    );
  }

  guard.ipAttempts.set(clientKey, [...attemptsInWindow, now]);
  guard.senderCooldown.set(cooldownKey, now + COOLDOWN_MS);

  try {
    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: {
        user: smtp.user,
        pass: smtp.pass,
      },
    });

    const serverReceivedAt = new Date().toISOString();
    const location = [requestMetadata.city, requestMetadata.region, requestMetadata.country]
      .filter(Boolean)
      .join(", ");
    const emailMetadata: Record<string, string> = {
      "Server received at (UTC)": serverReceivedAt,
      "Browser (client)": clientMetadata.browser,
      "Browser UA (request)": requestMetadata.requestUserAgent,
      Language: clientMetadata.language,
      Timezone: clientMetadata.timezone,
      "Screen size": clientMetadata.screenSize,
      "Approx location": location,
      "Client IP": requestMetadata.ipAddress,
    };

    const textMetadata = Object.entries(emailMetadata)
      .filter(([, value]) => Boolean(value))
      .map(([label, value]) => `- ${label}: ${value}`)
      .join("\n");

    await transporter.sendMail({
      from: smtp.from,
      to: smtp.destinationEmail,
      replyTo: senderEmail,
      subject: `Portfolio contact from ${senderEmail}`,
      text: `Sender email: ${senderEmail}\n\nMessage:\n${message}\n\nSubmission details:\n${textMetadata}`,
      html: renderHtmlEmail({
        senderEmail,
        message,
        serverReceivedAt,
        metadata: emailMetadata,
      }),
    });

    guard.duplicateMessages.set(duplicateKey, now + DUPLICATE_MESSAGE_WINDOW_MS);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to send message." }, { status: 502 });
  }
}
