"use client";

import "./blog-share-button.module.css";
import { useEffect, useRef, useState } from "react";
import { Check, ShareNetwork, Warning } from "@phosphor-icons/react";

type ShareStatus = "idle" | "copied" | "failed";

type BlogShareButtonProps = {
  title: string;
  url: string;
};

export function BlogShareButton({ title, url }: BlogShareButtonProps) {
  const [status, setStatus] = useState<ShareStatus>("idle");
  const resetTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (resetTimerRef.current) {
        window.clearTimeout(resetTimerRef.current);
      }
    };
  }, []);

  const scheduleStatusReset = () => {
    if (resetTimerRef.current) {
      window.clearTimeout(resetTimerRef.current);
    }

    resetTimerRef.current = window.setTimeout(() => {
      setStatus("idle");
      resetTimerRef.current = null;
    }, 1800);
  };

  const copyUrlToClipboard = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = url;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        const isCopied = document.execCommand("copy");
        document.body.removeChild(textarea);
        if (!isCopied) {
          throw new Error("Clipboard copy command failed");
        }
      }
      setStatus("copied");
      scheduleStatusReset();
    } catch {
      setStatus("failed");
      scheduleStatusReset();
    }
  };

  const handleShare = async () => {
    if (typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: title,
          url,
        });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    await copyUrlToClipboard();
  };

  const buttonLabel = status === "copied" ? "Link copied" : status === "failed" ? "Copy failed" : "Share post";
  const statusClass = status === "copied" ? " blog-share-button--copied" : status === "failed" ? " blog-share-button--failed" : "";

  return (
    <button
      type="button"
      className={`blog-share-button u-theme-fade-target u-focus-ring-target${statusClass}`}
      onClick={handleShare}
      aria-label={buttonLabel}
      title="Share this post"
    >
      {status === "copied" ? (
        <Check size={18} aria-hidden="true" />
      ) : status === "failed" ? (
        <Warning size={18} aria-hidden="true" />
      ) : (
        <ShareNetwork size={18} aria-hidden="true" />
      )}
    </button>
  );
}
