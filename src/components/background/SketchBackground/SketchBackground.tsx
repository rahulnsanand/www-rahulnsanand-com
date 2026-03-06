"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { SketchBackgroundLayer } from "./SketchBackgroundLayer";
import { SKETCH_DEFAULTS, generateSketchPlacements } from "./sketch.placement";
import { sketchManifest } from "./sketch.manifest";
import { measureProtectedZones } from "./sketch.protected-zones";
import type { PlacedSketch, SketchBackgroundProps } from "./sketch.types";
import { createDebouncedCallback } from "./sketch.utils";

const RESIZE_DEBOUNCE_MS = 180;
const MEANINGFUL_WIDTH_DELTA = 24;
const MEANINGFUL_HEIGHT_DELTA = 56;

type LayoutSnapshot = {
  width: number;
  height: number;
};

function getNextSeed(seed: number, revision: number): number {
  return seed + revision * 9973;
}

export function SketchBackground({ page, className, maxItems }: SketchBackgroundProps) {
  const shouldReduceMotion = useReducedMotion();
  const layerRef = useRef<HTMLDivElement | null>(null);
  const seedRef = useRef<number>(Math.floor(Math.random() * 1_000_000_000));
  const layoutRef = useRef<LayoutSnapshot | null>(null);
  const placementRevisionRef = useRef(0);
  const [placements, setPlacements] = useState<PlacedSketch[]>([]);

  const assets = useMemo(() => sketchManifest[page], [page]);
  const assetSignature = useMemo(() => assets.join("|"), [assets]);

  useEffect(() => {
    if (assets.length === 0) {
      setPlacements([]);
      layoutRef.current = null;
      return;
    }

    const layer = layerRef.current;
    const shell = layer?.closest<HTMLElement>("[data-sketch-shell]");
    if (!layer || !shell) {
      setPlacements([]);
      layoutRef.current = null;
      return;
    }

    let cancelled = false;
    let firstRaf = 0;
    let secondRaf = 0;

    const recomputePlacements = (force: boolean) => {
      const width = Math.round(shell.clientWidth);
      const height = Math.round(shell.scrollHeight);
      if (width < 280 || height < 220) {
        setPlacements([]);
        return;
      }

      const previousLayout = layoutRef.current;
      const widthDelta = previousLayout ? Math.abs(width - previousLayout.width) : Number.POSITIVE_INFINITY;
      const heightDelta = previousLayout ? Math.abs(height - previousLayout.height) : Number.POSITIVE_INFINITY;
      const hasMeaningfulResize =
        widthDelta >= MEANINGFUL_WIDTH_DELTA || heightDelta >= MEANINGFUL_HEIGHT_DELTA;

      if (!force && previousLayout && !hasMeaningfulResize) {
        return;
      }

      layoutRef.current = { width, height };
      // Any element marked with data-sketch-safe-zone participates in collision avoidance.
      const protectedZones = measureProtectedZones({
        shell,
        shellWidth: width,
        shellHeight: height,
        hardZonePadding: SKETCH_DEFAULTS.hardZonePadding,
        softZonePadding: SKETCH_DEFAULTS.softZonePadding,
      });
      const placementRevision = placementRevisionRef.current;
      const nextPlacements = generateSketchPlacements({
        width,
        height,
        assets,
        protectedZones,
        maxItems,
        seed: getNextSeed(seedRef.current, placementRevision),
      });
      placementRevisionRef.current += 1;

      if (!cancelled) {
        setPlacements(nextPlacements);
      }
    };

    firstRaf = window.requestAnimationFrame(() => {
      secondRaf = window.requestAnimationFrame(() => {
        recomputePlacements(true);
      });
    });

    const debouncedResize = createDebouncedCallback(() => {
      recomputePlacements(false);
    }, RESIZE_DEBOUNCE_MS);

    const observer = new ResizeObserver(() => {
      debouncedResize();
    });

    observer.observe(shell);
    const protectedElements = shell.querySelectorAll<HTMLElement>("[data-sketch-safe-zone]");
    protectedElements.forEach((element) => observer.observe(element));
    window.addEventListener("resize", debouncedResize);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(firstRaf);
      window.cancelAnimationFrame(secondRaf);
      observer.disconnect();
      debouncedResize.cancel();
      window.removeEventListener("resize", debouncedResize);
    };
  }, [assetSignature, assets, maxItems]);

  if (assets.length === 0) {
    return null;
  }

  return (
    <SketchBackgroundLayer
      ref={layerRef}
      className={className}
      placements={placements}
      shouldReduceMotion={Boolean(shouldReduceMotion)}
    />
  );
}
