import { forwardRef } from "react";
import { SketchAsset } from "./SketchAsset";
import type { PlacedSketch } from "./sketch.types";
import { joinClassNames } from "./sketch.utils";

type SketchBackgroundLayerProps = {
  placements: readonly PlacedSketch[];
  className?: string;
  shouldReduceMotion: boolean;
};

export const SketchBackgroundLayer = forwardRef<HTMLDivElement, SketchBackgroundLayerProps>(
  function SketchBackgroundLayer({ placements, className, shouldReduceMotion }, ref) {
    return (
      <div ref={ref} className={joinClassNames("sketch-background", className)} aria-hidden="true">
        {placements.map((sketch) => (
          <SketchAsset key={sketch.id} sketch={sketch} shouldReduceMotion={shouldReduceMotion} />
        ))}
      </div>
    );
  },
);
