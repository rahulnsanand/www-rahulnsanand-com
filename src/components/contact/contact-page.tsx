"use client";

import "./contact-page.module.css";
import type { FormEvent } from "react";
import { useState } from "react";
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

const MESSAGE_MIN_LENGTH = 8;
const MESSAGE_MAX_LENGTH = 5000;
const REQUEST_TIMEOUT_MS = 12_000;

function collectClientMetadata() {
  if (typeof window === "undefined") {
    return { b: "", l: "", z: "", s: "" };
  }

  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
  const screenSize = `${window.screen.width}x${window.screen.height}`;
  const ua = navigator.userAgent || "";

  const browser =
    /edg\//i.test(ua) ? "Edge" : /chrome\//i.test(ua) ? "Chrome" : /firefox\//i.test(ua) ? "Firefox" : /safari\//i.test(ua) ? "Safari" : "Unknown";

  return {
    b: browser,
    l: navigator.language || "",
    z: timezone,
    s: screenSize,
    th: document.documentElement.classList.contains("dark")
      ? "dark"
      : document.documentElement.classList.contains("light")
        ? "light"
        : "unknown",
    lt: new Date().toISOString(),
  };
}

export function ContactPageBody() {
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [formStartedAt, setFormStartedAt] = useState(() => Date.now().toString());

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

    if (!senderEmail || !message) {
      setSubmitState("error");
      setStatusMessage("Sender email and message are required.");
      return;
    }

    if (message.length < MESSAGE_MIN_LENGTH || message.length > MESSAGE_MAX_LENGTH) {
      setSubmitState("error");
      setStatusMessage(`Message should be between ${MESSAGE_MIN_LENGTH} and ${MESSAGE_MAX_LENGTH} characters.`);
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      setSubmitState("sending");
      setStatusMessage("Sending...");

      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({ e: senderEmail, m: message, d: metadata, h: companyWebsite, t: startedAt }),
      });

      const result = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        throw new Error(result?.error ?? "Could not send message.");
      }

      setSubmitState("success");
      setStatusMessage("Message sent. Thanks for reaching out.");
      form.reset();
      setFormStartedAt(Date.now().toString());
    } catch (error) {
      const messageText =
        error instanceof Error && error.name === "AbortError"
          ? "Request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Could not send message.";
      setSubmitState("error");
      setStatusMessage(messageText);
    } finally {
      window.clearTimeout(timeout);
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
            maxLength={320}
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
            minLength={MESSAGE_MIN_LENGTH}
            maxLength={MESSAGE_MAX_LENGTH}
          />
        </div>

        <div className="contact-actions">
          <button
            type="submit"
            className="contact-submit u-theme-fade-target u-focus-ring-target"
            disabled={submitState === "sending"}
            aria-busy={submitState === "sending"}
          >
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
              <a
                href={link.href}
                className="contact-social-link u-theme-fade-target u-focus-ring-target"
                target="_blank"
                rel="noreferrer noopener"
              >
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
