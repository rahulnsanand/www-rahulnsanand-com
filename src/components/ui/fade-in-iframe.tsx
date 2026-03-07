"use client";

import "./media-fade.module.css";
import { useState, type IframeHTMLAttributes } from "react";
import Image from "next/image";

type FadeInIframeProps = Omit<IframeHTMLAttributes<HTMLIFrameElement>, "className" | "onLoad"> & {
  frameClassName?: string;
  iframeClassName?: string;
  placeholderClassName?: string;
  posterSrc?: string;
  posterAlt?: string;
  posterSizes?: string;
};

export function FadeInIframe({
  frameClassName,
  iframeClassName,
  placeholderClassName,
  posterSrc,
  posterAlt,
  posterSizes,
  ...props
}: FadeInIframeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`media-fade-frame media-fade-frame--embed${isLoaded ? " media-fade-frame--loaded" : ""}${frameClassName ? ` ${frameClassName}` : ""}`}>
      {posterSrc ? (
        <Image
          src={posterSrc}
          alt={posterAlt ?? ""}
          fill
          sizes={posterSizes ?? "100vw"}
          className="media-fade-poster"
          priority
          unoptimized
          aria-hidden={posterAlt ? undefined : true}
        />
      ) : null}
      <iframe {...props} onLoad={handleLoad} className={`media-fade-iframe${iframeClassName ? ` ${iframeClassName}` : ""}`} />
      <span
        aria-hidden="true"
        className={`media-fade-placeholder media-fade-placeholder--embed${placeholderClassName ? ` ${placeholderClassName}` : ""}`}
      />
    </div>
  );
}
