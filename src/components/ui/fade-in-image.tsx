"use client";

import "./media-fade.module.css";
import { useState } from "react";
import Image, { type ImageProps } from "next/image";

type FadeInImageProps = Omit<ImageProps, "className" | "onLoad"> & {
  alt: string;
  frameClassName?: string;
  imageClassName?: string;
  placeholderClassName?: string;
};

export function FadeInImage({
  alt,
  frameClassName,
  imageClassName,
  placeholderClassName,
  ...props
}: FadeInImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleLoad = () => {
    setIsLoaded(true);
  };

  return (
    <span className={`media-fade-frame${isLoaded ? " media-fade-frame--loaded" : ""}${frameClassName ? ` ${frameClassName}` : ""}`}>
      <Image
        {...props}
        alt={alt}
        onLoad={handleLoad}
        className={`media-fade-image${imageClassName ? ` ${imageClassName}` : ""}`}
      />
      <span
        aria-hidden="true"
        className={`media-fade-placeholder${placeholderClassName ? ` ${placeholderClassName}` : ""}`}
      />
    </span>
  );
}
