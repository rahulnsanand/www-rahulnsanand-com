"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "@phosphor-icons/react";

export function BlogScrollTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const titleElement = document.getElementById("blog-post-title");
    if (!titleElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(!entry.isIntersecting);
      },
      {
        threshold: 0,
      },
    );

    observer.observe(titleElement);
    return () => observer.disconnect();
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
      className={`blog-scroll-top-button${isVisible ? " blog-scroll-top-button--visible" : ""}`}
      onClick={handleScrollToTop}
      aria-label="Scroll to top"
      title="Scroll to top"
    >
      <ArrowUp size={18} aria-hidden="true" />
      <span>Scroll to top</span>
    </button>
  );
}
