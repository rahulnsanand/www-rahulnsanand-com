import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { loadSketchSvgMarkup, runSketchStrokeAnimation } from "./sketch.svg";
import type { PlacedSketch } from "./sketch.types";

type SketchAssetProps = {
  sketch: PlacedSketch;
  shouldReduceMotion: boolean;
};

export function SketchAsset({ sketch, shouldReduceMotion }: SketchAssetProps) {
  const [inlineSvgMarkup, setInlineSvgMarkup] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const vectorRootRef = useRef<HTMLDivElement | null>(null);
  const targetFilter = `blur(${sketch.blur.toFixed(2)}px)`;

  useEffect(() => {
    let active = true;
    setInlineSvgMarkup(null);
    setLoadFailed(false);

    loadSketchSvgMarkup(sketch.src).then((markup) => {
      if (!active) {
        return;
      }

      if (markup) {
        setInlineSvgMarkup(markup);
        return;
      }

      setLoadFailed(true);
    });

    return () => {
      active = false;
    };
  }, [sketch.src]);

  useEffect(() => {
    if (!inlineSvgMarkup || !vectorRootRef.current) {
      return;
    }

    runSketchStrokeAnimation({
      root: vectorRootRef.current,
      delaySeconds: sketch.delaySeconds * 0.88,
      durationSeconds: sketch.durationSeconds,
      reduceMotion: shouldReduceMotion,
    });
  }, [inlineSvgMarkup, shouldReduceMotion, sketch.delaySeconds, sketch.durationSeconds]);

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
              opacity: sketch.opacity,
              scale: 0.992,
              y: 2,
              rotate: sketch.rotation + sketch.entryRotationOffset,
              filter: "blur(6px)",
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
        duration: shouldReduceMotion ? 0 : Math.max(0.64, sketch.durationSeconds * 0.68),
        delay: shouldReduceMotion ? 0 : sketch.delaySeconds * 0.34,
        ease: [0.22, 0.61, 0.36, 1],
      }}
      aria-hidden="true"
    >
      {inlineSvgMarkup ? (
        <div
          ref={vectorRootRef}
          className="sketch-item-vector-root"
          dangerouslySetInnerHTML={{ __html: inlineSvgMarkup }}
        />
      ) : loadFailed ? (
        <img src={sketch.src} alt="" className="sketch-item-media" loading="lazy" draggable={false} />
      ) : null}
    </motion.div>
  );
}
