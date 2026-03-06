import { getRectOverlapRatio, scoreProtectedZoneCollision } from "./sketch.protected-zones";
import type { GenerateSketchPlacementsInput, PlacedSketch, Rect } from "./sketch.types";
import { clamp, createSeededRandom, pickRandomSubset, randomBetween } from "./sketch.utils";

export const SKETCH_DEFAULTS = {
  desktopCount: 7,
  tabletCount: 5,
  mobileCount: 3,
  desktopMaxCount: 10,
  tabletMaxCount: 6,
  mobileMaxCount: 4,
  rotationMin: -45,
  rotationMax: 45,
  opacityMin: 0.14,
  opacityMax: 0.32,
  overlapOpacityMin: 0.1,
  overlapOpacityMax: 0.24,
  blurMin: 0.5,
  blurMax: 3,
  overlapBlurMin: 6,
  overlapBlurMax: 12,
  edgePaddingDesktop: 48,
  edgePaddingTablet: 40,
  edgePaddingMobile: 32,
  maxPlacementAttempts: 30,
  hardZonePadding: 40,
  softZonePadding: 20,
  hardZoneRejectThreshold: 0.12,
  softZoneRejectThreshold: 0.16,
  nearZoneDistance: 72,
  maxInterSketchOverlap: 0.24,
};

function resolveSizeRange(width: number): { min: number; max: number } {
  if (width < 768) {
    return { min: 80, max: 180 };
  }

  if (width < 1024) {
    return { min: 120, max: 240 };
  }

  return { min: 140, max: 320 };
}

function resolveEdgePadding(width: number): number {
  if (width < 768) {
    return SKETCH_DEFAULTS.edgePaddingMobile;
  }

  if (width < 1024) {
    return SKETCH_DEFAULTS.edgePaddingTablet;
  }

  return SKETCH_DEFAULTS.edgePaddingDesktop;
}

function resolveTargetCount(width: number, maxItems?: number): number {
  if (width < 768) {
    const requested = maxItems ?? SKETCH_DEFAULTS.mobileCount;
    return Math.max(1, Math.min(SKETCH_DEFAULTS.mobileMaxCount, requested));
  }

  if (width < 1024) {
    const requested = maxItems ?? SKETCH_DEFAULTS.tabletCount;
    return Math.max(1, Math.min(SKETCH_DEFAULTS.tabletMaxCount, requested));
  }

  const requested = maxItems ?? SKETCH_DEFAULTS.desktopCount;
  return Math.max(1, Math.min(SKETCH_DEFAULTS.desktopMaxCount, requested));
}

function hasHeavyOverlap(candidate: Rect, existing: readonly PlacedSketch[]): boolean {
  for (const sketch of existing) {
    const overlap = getRectOverlapRatio(candidate, {
      x: sketch.x,
      y: sketch.y,
      width: sketch.width,
      height: sketch.height,
    });

    if (overlap > SKETCH_DEFAULTS.maxInterSketchOverlap) {
      return true;
    }
  }

  return false;
}

function getBandInfo(height: number, width: number): { bandHeight: number; maxPerBand: number } {
  const bandCount = Math.max(2, Math.min(5, Math.round(height / 720)));
  const bandHeight = height / bandCount;
  const maxPerBand = width < 768 ? 1 : 2;
  return { bandHeight, maxPerBand };
}

function getBandIndex(y: number, height: number, bandHeight: number): number {
  const midpoint = y + height * 0.5;
  return Math.max(0, Math.floor(midpoint / bandHeight));
}

export function generateSketchPlacements({
  width,
  height,
  assets,
  protectedZones,
  maxItems,
  seed,
}: GenerateSketchPlacementsInput): PlacedSketch[] {
  if (width <= 0 || height <= 0 || assets.length === 0) {
    return [];
  }

  const random = createSeededRandom(seed);
  const targetCount = Math.min(resolveTargetCount(width, maxItems), assets.length);
  const selectedAssets = pickRandomSubset(assets, targetCount, random);
  const sizeRange = resolveSizeRange(width);
  const edgePadding = resolveEdgePadding(width);
  const placements: PlacedSketch[] = [];
  const { bandHeight, maxPerBand } = getBandInfo(height, width);
  const sketchesPerBand = new Map<number, number>();

  selectedAssets.forEach((src, index) => {
    for (let attempt = 0; attempt < SKETCH_DEFAULTS.maxPlacementAttempts; attempt += 1) {
      const baseSize = randomBetween(sizeRange.min, sizeRange.max, random);
      const aspectRatio = randomBetween(0.8, 1.18, random);
      const sketchWidth = Math.max(48, Math.min(baseSize, width - edgePadding * 2));
      const sketchHeight = Math.max(48, Math.min(baseSize * aspectRatio, height - edgePadding * 2));
      const maxX = width - edgePadding - sketchWidth;
      const maxY = height - edgePadding - sketchHeight;

      if (maxX <= edgePadding || maxY <= edgePadding) {
        break;
      }

      const x = randomBetween(edgePadding, maxX, random);
      const y = randomBetween(edgePadding, maxY, random);
      const candidateRect: Rect = { x, y, width: sketchWidth, height: sketchHeight };
      const bandIndex = getBandIndex(y, sketchHeight, bandHeight);
      const bandCount = sketchesPerBand.get(bandIndex) ?? 0;

      if (bandCount >= maxPerBand) {
        continue;
      }

      const protectedCollision = scoreProtectedZoneCollision({
        candidate: candidateRect,
        zones: protectedZones,
        hardRejectThreshold: SKETCH_DEFAULTS.hardZoneRejectThreshold,
        softRejectThreshold: SKETCH_DEFAULTS.softZoneRejectThreshold,
        nearDistance: SKETCH_DEFAULTS.nearZoneDistance,
      });

      if (protectedCollision.reject || hasHeavyOverlap(candidateRect, placements)) {
        continue;
      }

      const overlapPenalty = clamp(
        protectedCollision.maxOverlapRatio / SKETCH_DEFAULTS.softZoneRejectThreshold,
        0,
        1,
      );
      const nearPenalty = clamp(protectedCollision.nearIntensity, 0, 1);
      const isNearProtectedContent = protectedCollision.maxOverlapRatio > 0 || nearPenalty > 0.45;
      const baseOpacity = randomBetween(SKETCH_DEFAULTS.opacityMin, SKETCH_DEFAULTS.opacityMax, random);
      const baseBlur = randomBetween(SKETCH_DEFAULTS.blurMin, SKETCH_DEFAULTS.blurMax, random);

      const opacity = isNearProtectedContent
        ? clamp(
            baseOpacity * (1 - overlapPenalty * 0.45 - nearPenalty * 0.25),
            SKETCH_DEFAULTS.overlapOpacityMin,
            SKETCH_DEFAULTS.overlapOpacityMax,
          )
        : baseOpacity;

      const overlapBlur =
        protectedCollision.maxOverlapRatio > 0
          ? randomBetween(SKETCH_DEFAULTS.overlapBlurMin, SKETCH_DEFAULTS.overlapBlurMax, random)
          : baseBlur;

      const blur = isNearProtectedContent
        ? clamp(
            Math.max(overlapBlur, baseBlur + nearPenalty * 3),
            SKETCH_DEFAULTS.blurMin,
            SKETCH_DEFAULTS.overlapBlurMax,
          )
        : baseBlur;

      placements.push({
        id: `${src}-${index}`,
        src,
        x,
        y,
        width: sketchWidth,
        height: sketchHeight,
        rotation: clamp(
          randomBetween(SKETCH_DEFAULTS.rotationMin, SKETCH_DEFAULTS.rotationMax, random),
          SKETCH_DEFAULTS.rotationMin,
          SKETCH_DEFAULTS.rotationMax,
        ),
        opacity,
        blur,
        scale: isNearProtectedContent ? randomBetween(0.9, 0.98, random) : randomBetween(0.94, 1.03, random),
        zIndex: 1,
        delaySeconds: randomBetween(0.06, 0.48, random),
        durationSeconds: randomBetween(1.2, 2.4, random),
        entryRotationOffset: randomBetween(-3, 3, random),
      });

      sketchesPerBand.set(bandIndex, bandCount + 1);
      break;
    }
  });

  return placements;
}
