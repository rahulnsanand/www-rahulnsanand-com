"use client";

import { motion, useReducedMotion } from "motion/react";

const VIEWBOX_HEIGHT = 1080;
const EDGE_PADDING = 28;
const SEPARATOR_PATH =
  "M16 28 C8 160, 24 270, 16 390 C8 520, 24 660, 16 800 C10 914, 22 990, 16 1052";

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
  const revealClipId = `${filterId}-reveal`;

  return (
    <svg
      className={className}
      viewBox={`0 0 32 ${VIEWBOX_HEIGHT}`}
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
            width="32"
            initial={{ height: shouldReduceMotion ? VIEWBOX_HEIGHT : 0 }}
            animate={{ height: VIEWBOX_HEIGHT }}
            transition={{
              duration: shouldReduceMotion ? 0 : 3,
              delay: shouldReduceMotion ? 0 : 0.2,
              ease: "easeInOut",
            }}
          />
        </clipPath>
      </defs>

      <path
        d={SEPARATOR_PATH}
        fill="none"
        stroke={baseStroke}
        strokeWidth={baseWidth}
        vectorEffect="non-scaling-stroke"
      />

      <path
        d={SEPARATOR_PATH}
        fill="none"
        stroke={activeStroke}
        strokeWidth={activeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        clipPath={`url(#${revealClipId})`}
        style={{
          filter: "drop-shadow(0 0 10px rgb(var(--brand) / 0.95))",
          opacity: 1,
        }}
      />

      <motion.circle
        cx="16"
        cy={EDGE_PADDING}
        r={orbRadius}
        fill="rgb(var(--brand))"
        filter={`url(#${filterId})`}
        style={{ transformBox: "fill-box", transformOrigin: "center" }}
        initial={{ scale: 0.96, opacity: 0.95 }}
        animate={
          shouldReduceMotion
            ? { scale: 1, opacity: 1 }
            : { scale: [0.95, 1.05, 0.95], opacity: [0.92, 1, 0.92] }
        }
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 1.6, ease: "easeInOut", repeat: Infinity }}
      />
    </svg>
  );
}
