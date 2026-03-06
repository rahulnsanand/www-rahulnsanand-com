"use client";

import type { FormEvent } from "react";
import { useMemo, useState } from "react";
import { ArrowUpRight } from "@phosphor-icons/react";
import { FooterAccentText } from "@/components/layout/site-footer-accent";

const socialLinks = [
  {
    href: "https://www.linkedin.com/in/rahulnsanand",
    label: "LinkedIn",
  },
  {
    href: "https://github.com/rahulnsanand",
    label: "GitHub",
  },
  {
    href: "https://medium.com/@rahulnsanand",
    label: "Medium",
  },
  {
    href: "https://www.youtube.com/@rahulnsanand",
    label: "YouTube",
  },
] as const;

function collectClientMetadata() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const screenSize =
    typeof window !== "undefined" ? `${window.screen.width}x${window.screen.height}` : "";
  const ua = navigator.userAgent || "";

  const browser =
    /edg\//i.test(ua) ? "Edge" : /chrome\//i.test(ua) ? "Chrome" : /firefox\//i.test(ua) ? "Firefox" : /safari\//i.test(ua) ? "Safari" : "Unknown";

  return {
    b: browser,
    l: navigator.language || "",
    z: timezone,
    s: screenSize,
  };
}

export function ContactPageBody() {
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const formStartedAt = useMemo(() => Date.now().toString(), []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitState === "sending") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const senderEmail = String(formData.get("senderEmail") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();
    const companyWebsite = String(formData.get("companyWebsite") ?? "").trim();
    const startedAt = String(formData.get("formStartedAt") ?? "").trim();
    const metadata = collectClientMetadata();

    if (!senderEmail || !message) return;

    try {
      setSubmitState("sending");
      setStatusMessage("Sending...");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ e: senderEmail, m: message, d: metadata, h: companyWebsite, t: startedAt }),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(result?.error ?? "Could not send message.");
      }

      setSubmitState("success");
      setStatusMessage("Message sent. Thanks for reaching out.");
      form.reset();
    } catch (error) {
      const messageText = error instanceof Error ? error.message : "Could not send message.";
      setSubmitState("error");
      setStatusMessage(messageText);
    }
  }

  return (
    <section className="contact-page relative" aria-label="Contact Rahul NS Anand">
      <FooterAccentText text="connect()" />

      <header className="contact-header">
        <p className="contact-kicker">Contact</p>
        <h1 className="contact-title">Let&apos;s build something useful.</h1>
        <p className="contact-copy">
          I&apos;m open to thoughtful product collaborations, engineering opportunities, and conversations around AI,
          frontend systems, and design-led software.
        </p>
      </header>

      <form className="contact-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="companyWebsite"
          className="contact-honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <input type="hidden" name="formStartedAt" value={formStartedAt} />

        <div className="contact-field">
          <label htmlFor="senderEmail" className="contact-label">
            Sender email
          </label>
          <input
            id="senderEmail"
            name="senderEmail"
            type="email"
            className="contact-input"
            required
            placeholder="you@company.com"
            autoComplete="email"
          />
        </div>

        <div className="contact-field">
          <label htmlFor="message" className="contact-label">
            Message to send
          </label>
          <textarea
            id="message"
            name="message"
            className="contact-textarea"
            rows={7}
            required
            placeholder="Share a little context about what you want to discuss."
          />
        </div>

        <div className="contact-actions">
          <button type="submit" className="contact-submit" disabled={submitState === "sending"}>
            {submitState === "sending" ? "Sending..." : "Send message"}
          </button>
          <p
            className={`contact-status${submitState === "error" ? " contact-status--error" : ""}`}
            aria-live="polite"
          >
            {statusMessage || "Delivered directly to my inbox."}
          </p>
        </div>
      </form>

      <div className="contact-socials" aria-label="Social links">
        <p className="contact-socials-title">Or reach out here:</p>
        <ul className="contact-socials-list">
          {socialLinks.map((link) => (
            <li key={link.href} className="contact-socials-item">
              <a href={link.href} className="contact-social-link" target="_blank" rel="noreferrer noopener">
                {link.label}
                <ArrowUpRight size={14} weight="duotone" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
