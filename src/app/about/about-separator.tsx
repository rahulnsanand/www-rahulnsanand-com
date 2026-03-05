"use client";

import { motion, useReducedMotion } from "motion/react";

const SEPARATOR_PATH = "M16 0 C8 132, 24 242, 16 362 C8 492, 24 632, 16 772 C10 886, 22 962, 16 1024";

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

  return (
    <svg className={className} viewBox="0 0 32 1024" preserveAspectRatio="none">
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
      </defs>

      <path
        d={SEPARATOR_PATH}
        fill="none"
        stroke={baseStroke}
        strokeWidth={baseWidth}
        vectorEffect="non-scaling-stroke"
      />

      <motion.path
        d={SEPARATOR_PATH}
        fill="none"
        stroke={activeStroke}
        strokeWidth={activeWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        initial={{ pathLength: shouldReduceMotion ? 1 : 0, opacity: shouldReduceMotion ? 1 : 0.8 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.22, 0.61, 0.36, 1] }}
        style={{ filter: "drop-shadow(0 0 10px rgb(var(--brand) / 0.95))" }}
      />

      <motion.circle
        cx="16"
        cy="0"
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
