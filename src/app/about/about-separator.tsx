"use client";

import "./about-separator.module.css";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";

const VIEWBOX_WIDTH = 32;
const CENTER_X = VIEWBOX_WIDTH / 2;
/** Horizontal swing of the snake, in the same user units as the viewBox width. */
const WAVE_AMPLITUDE = 8;
/** Target length of one S-curve. The real length is rounded so waves divide the height evenly. */
const TARGET_WAVE_LENGTH = 360;
/** Used for the first server render, before the content height has been measured. */
const FALLBACK_HEIGHT = 1080;

/**
 * Build a snake that starts at the very top of the column and ends at the very bottom, using
 * roughly constant-length waves so the shape stays the same no matter how long the About content
 * gets.
 */
function buildSeparatorPath(height: number): string {
  const waveCount = Math.max(2, Math.round(height / TARGET_WAVE_LENGTH));
  const waveLength = height / waveCount;
  const segments: string[] = [`M${CENTER_X} 0`];

  for (let index = 0; index < waveCount; index += 1) {
    const start = waveLength * index;
    const control1 = `${CENTER_X - WAVE_AMPLITUDE} ${(start + waveLength * 0.36).toFixed(2)}`;
    const control2 = `${CENTER_X + WAVE_AMPLITUDE} ${(start + waveLength * 0.72).toFixed(2)}`;
    const end = `${CENTER_X} ${(start + waveLength).toFixed(2)}`;
    segments.push(`C${control1}, ${control2}, ${end}`);
  }

  return segments.join(" ");
}

type AboutSeparatorProps = {
  className: string;
  filterId: string;
  glowBlurA: number;
  glowBlurB: number;
  baseStroke: string;
  baseWidth: number;
  activeStroke: string;
  activeWidth: number;
  orbRadius: number;
};

export function AboutSeparator({
  className,
  filterId,
  glowBlurA,
  glowBlurB,
  baseStroke,
  baseWidth,
  activeStroke,
  activeWidth,
  orbRadius,
}: AboutSeparatorProps) {
  const shouldReduceMotion = useReducedMotion();
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const revealClipId = `${filterId}-reveal`;
  void orbRadius;

  useEffect(() => {
    const svg = svgRef.current;
    const track = svg?.parentElement;
    if (!track) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      setMeasuredHeight(Math.round(entry.contentRect.height));
    });

    // `observe` delivers an initial callback with the current size, so there is no need to measure
    // the element synchronously here.
    observer.observe(track);

    return () => observer.disconnect();
  }, []);

  // Mapping the viewBox 1:1 onto the measured pixel height keeps the wave undistorted while the
  // column grows with the About content.
  const viewBoxHeight = measuredHeight > 0 ? measuredHeight : FALLBACK_HEIGHT;
  const separatorPath = buildSeparatorPath(viewBoxHeight);

  return (
    <svg
      ref={svgRef}
      className={className}
      viewBox={`0 0 ${VIEWBOX_WIDTH} ${viewBoxHeight}`}
      preserveAspectRatio="none"
      style={{ overflow: "visible" }}
    >
      <defs>
        <filter id={filterId} x="-300%" y="-300%" width="700%" height="700%">
          <feGaussianBlur stdDeviation={glowBlurA} result="blurA" />
          <feGaussianBlur stdDeviation={glowBlurB} result="blurB" />
          <feMerge>
            <feMergeNode in="blurB" />
            <feMergeNode in="blurA" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <clipPath id={revealClipId} clipPathUnits="userSpaceOnUse">
          <motion.rect
            x="0"
            y="0"
            width={VIEWBOX_WIDTH}
            initial={{ height: shouldReduceMotion ? viewBoxHeight : 0 }}
            animate={{ height: viewBoxHeight }}
            transition={{
              duration: shouldReduceMotion ? 0 : 3,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease: "easeInOut",
            }}
          />
        </clipPath>
      </defs>

      <path
        d={separatorPath}
        fill="none"
        stroke={baseStroke}
        strokeWidth={baseWidth}
        vectorEffect="non-scaling-stroke"
      />

      <path
        d={separatorPath}
        fill="none"
        stroke={activeStroke}
        strokeWidth={activeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        clipPath={`url(#${revealClipId})`}
        style={{
          opacity: 1,
        }}
      />

    </svg>
  );
}
