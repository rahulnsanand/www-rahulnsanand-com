"use client";

import "./media-fade.module.css";
import { useState, type IframeHTMLAttributes } from "react";

type FadeInIframeProps = Omit<IframeHTMLAttributes<HTMLIFrameElement>, "className" | "onLoad"> & {
  frameClassName?: string;
  iframeClassName?: string;
  placeholderClassName?: string;
};

export function FadeInIframe({
  frameClassName,
  iframeClassName,
  placeholderClassName,
  ...props
}: FadeInIframeProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`media-fade-frame media-fade-frame--embed${isLoaded ? " media-fade-frame--loaded" : ""}${frameClassName ? ` ${frameClassName}` : ""}`}>
      <iframe {...props} onLoad={handleLoad} className={`media-fade-iframe${iframeClassName ? ` ${iframeClassName}` : ""}`} />
      <span
        aria-hidden="true"
        className={`media-fade-placeholder media-fade-placeholder--embed${placeholderClassName ? ` ${placeholderClassName}` : ""}`}
      />
    </div>
  );
}
