import { motion } from "motion/react";
import type { PlacedSketch } from "./sketch.types";

type SketchAssetProps = {
  sketch: PlacedSketch;
  shouldReduceMotion: boolean;
};

export function SketchAsset({ sketch, shouldReduceMotion }: SketchAssetProps) {
  const targetFilter = `blur(${sketch.blur.toFixed(2)}px)`;

  return (
    <motion.div
      className="sketch-item"
      style={{
        left: sketch.x,
        top: sketch.y,
        width: sketch.width,
        height: sketch.height,
        zIndex: sketch.zIndex,
      }}
      initial={
        shouldReduceMotion
          ? {
              opacity: sketch.opacity,
              scale: sketch.scale,
              y: 0,
              rotate: sketch.rotation,
              filter: targetFilter,
            }
          : {
              opacity: 0,
              scale: 0.96,
              y: 8,
              rotate: sketch.rotation + sketch.entryRotationOffset,
              filter: "blur(12px)",
            }
      }
      animate={{
        opacity: sketch.opacity,
        scale: sketch.scale,
        y: 0,
        rotate: sketch.rotation,
        filter: targetFilter,
      }}
      transition={{
        duration: shouldReduceMotion ? 0 : sketch.durationSeconds,
        delay: shouldReduceMotion ? 0 : sketch.delaySeconds,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      aria-hidden="true"
    >
      <img src={sketch.src} alt="" className="sketch-item-media" loading="lazy" draggable={false} />
    </motion.div>
  );
}
