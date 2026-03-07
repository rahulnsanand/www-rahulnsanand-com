"use client";

import "./blog-scroll-top-button.module.css";
import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";
import {
  SITE_HEADER_FLOATING_CHANGE_EVENT,
  type SiteHeaderFloatingChangeDetail,
} from "@/lib/site-header-events";

export function BlogScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollThreshold = 320;
    let ticking = false;

    const syncWithHeader = (isFloating?: boolean) => {
      const headerVisible = typeof isFloating === "boolean"
        ? isFloating
        : document.documentElement.classList.contains("site-nav-condensed");
      const hasScrolledEnough = window.scrollY > scrollThreshold;

      setIsVisible(headerVisible || hasScrolledEnough);
    };

    const handleFloatingHeaderChange = (event: Event) => {
      const detail = (event as CustomEvent<SiteHeaderFloatingChangeDetail>).detail;

      if (detail && typeof detail.isFloating === "boolean") {
        syncWithHeader(detail.isFloating);
        return;
      }

      syncWithHeader();
    };

    const handleScroll = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      window.requestAnimationFrame(() => {
        syncWithHeader();
        ticking = false;
      });
    };

    syncWithHeader();
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    window.addEventListener(SITE_HEADER_FLOATING_CHANGE_EVENT, handleFloatingHeaderChange as EventListener);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      window.removeEventListener(SITE_HEADER_FLOATING_CHANGE_EVENT, handleFloatingHeaderChange as EventListener);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <button
      type="button"
      className={`blog-scroll-top-button u-theme-fade-target u-focus-ring-target${
        isVisible ? " blog-scroll-top-button--visible" : ""
      }`}
      onClick={handleScrollToTop}
      aria-label="scroll to top"
      title="scroll to top"
    >
      <ArrowUp size={18} aria-hidden="true" />
      <span>scroll to top</span>
    </button>
  );
}
