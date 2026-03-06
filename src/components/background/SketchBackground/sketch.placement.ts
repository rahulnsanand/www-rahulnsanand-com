import { getRectOverlapRatio, scoreProtectedZoneCollision } from "./sketch.protected-zones";
import type { GenerateSketchPlacementsInput, PlacedSketch, Rect } from "./sketch.types";
import { clamp, createSeededRandom, randomBetween } from "./sketch.utils";

type PlacementAnchor = {
  x: number;
  y: number;
  jitterX: number;
  jitterY: number;
  column: number;
};

type CandidatePosition = {
  x: number;
  y: number;
  anchorIndex: number | null;
};

type SizeBand = {
  min: number;
  max: number;
  weight: number;
};

const MOBILE_SIZE_BANDS: readonly SizeBand[] = [
  { min: 78, max: 132, weight: 0.7 },
  { min: 132, max: 188, weight: 0.3 },
];

const TABLET_SIZE_BANDS: readonly SizeBand[] = [
  { min: 92, max: 160, weight: 0.55 },
  { min: 160, max: 240, weight: 0.35 },
  { min: 240, max: 310, weight: 0.1 },
];

const DESKTOP_SIZE_BANDS: readonly SizeBand[] = [
  { min: 90, max: 160, weight: 0.5 },
  { min: 160, max: 260, weight: 0.38 },
  { min: 260, max: 360, weight: 0.12 },
];

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
  maxPlacementAttempts: 42,
  hardZonePadding: 36,
  softZonePadding: 14,
  hardZoneRejectThreshold: 0.12,
  softZoneRejectThreshold: 0.16,
  nearZoneDistance: 72,
  maxInterSketchOverlap: 0.24,
};

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

function sampleSizeBand(width: number, random: () => number): SizeBand {
  const bands = width < 768 ? MOBILE_SIZE_BANDS : width < 1024 ? TABLET_SIZE_BANDS : DESKTOP_SIZE_BANDS;
  const totalWeight = bands.reduce((sum, band) => sum + band.weight, 0);
  const threshold = random() * totalWeight;
  let cumulative = 0;

  for (const band of bands) {
    cumulative += band.weight;
    if (threshold <= cumulative) {
      return band;
    }
  }

  return bands[bands.length - 1] ?? { min: 100, max: 180, weight: 1 };
}

function createAssetSequence({
  assets,
  count,
  random,
}: {
  assets: readonly string[];
  count: number;
  random: () => number;
}): string[] {
  if (assets.length === 0 || count <= 0) {
    return [];
  }

  if (assets.length === 1) {
    const firstAsset = assets[0];
    if (!firstAsset) {
      return [];
    }
    return Array.from({ length: count }, () => firstAsset);
  }

  const shuffledAssets = [...assets];
  for (let index = shuffledAssets.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = shuffledAssets[index];
    const swapValue = shuffledAssets[swapIndex];
    if (!current || !swapValue) {
      continue;
    }
    shuffledAssets[index] = swapValue;
    shuffledAssets[swapIndex] = current;
  }

  const nextAssets: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const candidate = shuffledAssets[index % shuffledAssets.length];
    if (!candidate) {
      continue;
    }

    const previous = nextAssets[nextAssets.length - 1];
    if (candidate === previous) {
      const alternateCandidate = shuffledAssets[(index + 1) % shuffledAssets.length];
      if (alternateCandidate && alternateCandidate !== previous) {
        nextAssets.push(alternateCandidate);
        continue;
      }
    }

    nextAssets.push(candidate);
  }

  return nextAssets;
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

function hasNearbyDuplicateAsset({
  candidate,
  src,
  existing,
}: {
  candidate: Rect;
  src: string;
  existing: readonly PlacedSketch[];
}): boolean {
  const candidateCenterX = candidate.x + candidate.width * 0.5;
  const candidateCenterY = candidate.y + candidate.height * 0.5;
  const proximityThreshold = Math.max(candidate.width, candidate.height) * 1.35;

  for (const placed of existing) {
    if (placed.src !== src) {
      continue;
    }

    const placedCenterX = placed.x + placed.width * 0.5;
    const placedCenterY = placed.y + placed.height * 0.5;
    const distance = Math.hypot(candidateCenterX - placedCenterX, candidateCenterY - placedCenterY);
    if (distance < proximityThreshold) {
      return true;
    }
  }

  return false;
}

function resolvePlacementRegion({
  width,
  height,
  edgePadding,
}: {
  width: number;
  height: number;
  edgePadding: number;
}): Rect {
  const safeWidth = Math.max(1, width - edgePadding * 2);
  const fullYStart = edgePadding;
  const fullYEnd = Math.max(fullYStart + 1, height - edgePadding);

  return {
    x: edgePadding,
    y: fullYStart,
    width: safeWidth,
    height: fullYEnd - fullYStart,
  };
}

function buildPlacementAnchors({
  region,
  targetCount,
  viewportWidth,
  random,
}: {
  region: Rect;
  targetCount: number;
  viewportWidth: number;
  random: () => number;
}): PlacementAnchor[] {
  const desiredAnchorCount = Math.max(targetCount * 3, 12);
  const preferredCols = viewportWidth < 768 ? 3 : viewportWidth < 1024 ? 4 : 5;
  const cols = Math.max(3, preferredCols);
  const rowsFromHeight = Math.max(3, Math.min(9, Math.round(region.height / 220)));
  const rows = Math.max(rowsFromHeight, Math.ceil(desiredAnchorCount / cols));
  const cellWidth = region.width / cols;
  const cellHeight = region.height / rows;
  const anchors: PlacementAnchor[] = [];

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      anchors.push({
        x: region.x + col * cellWidth + cellWidth * 0.5,
        y: region.y + row * cellHeight + cellHeight * 0.5,
        jitterX: cellWidth * 0.42,
        jitterY: cellHeight * 0.42,
        column: col,
      });
    }
  }

  for (let index = anchors.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const current = anchors[index];
    const swapValue = anchors[swapIndex];
    if (!current || !swapValue) {
      continue;
    }
    anchors[index] = swapValue;
    anchors[swapIndex] = current;
  }

  return anchors;
}

function getCandidatePosition({
  attempt,
  desiredColumn,
  anchors,
  anchorUsage,
  random,
  region,
  sketchWidth,
  sketchHeight,
}: {
  attempt: number;
  desiredColumn: number;
  anchors: readonly PlacementAnchor[];
  anchorUsage: Map<number, number>;
  random: () => number;
  region: Rect;
  sketchWidth: number;
  sketchHeight: number;
}): CandidatePosition | null {
  const maxX = region.x + region.width - sketchWidth;
  const maxY = region.y + region.height - sketchHeight;
  if (maxX <= region.x || maxY <= region.y) {
    return null;
  }

  if (anchors.length > 0 && attempt < anchors.length * 2) {
    const maxAnchorUsage = attempt < anchors.length ? 0 : 1;
    const eligibleAnchorIndexes: number[] = [];

    anchors.forEach((anchor, anchorIndex) => {
      const usage = anchorUsage.get(anchorIndex) ?? 0;
      const isDesiredColumn = anchor.column === desiredColumn;
      const shouldEnforceColumn = attempt < anchors.length;
      if (usage <= maxAnchorUsage && (!shouldEnforceColumn || isDesiredColumn)) {
        eligibleAnchorIndexes.push(anchorIndex);
      }
    });

    if (eligibleAnchorIndexes.length === 0 && attempt < anchors.length) {
      anchors.forEach((anchor, anchorIndex) => {
        const usage = anchorUsage.get(anchorIndex) ?? 0;
        if (usage <= maxAnchorUsage && anchor.column !== desiredColumn) {
          eligibleAnchorIndexes.push(anchorIndex);
        }
      });
    }

    if (eligibleAnchorIndexes.length > 0) {
      const pickedAnchorIndex = eligibleAnchorIndexes[Math.floor(random() * eligibleAnchorIndexes.length)];
      if (pickedAnchorIndex === undefined) {
        return null;
      }
      const anchor = anchors[pickedAnchorIndex];
      if (!anchor) {
        return null;
      }

      const jitterMultiplier = attempt < anchors.length ? 0.95 : 1.6;
      const x =
        anchor.x +
        randomBetween(-anchor.jitterX * jitterMultiplier, anchor.jitterX * jitterMultiplier, random) -
        sketchWidth * 0.5;
      const y =
        anchor.y +
        randomBetween(-anchor.jitterY * jitterMultiplier, anchor.jitterY * jitterMultiplier, random) -
        sketchHeight * 0.5;

      return {
        x: clamp(x, region.x, maxX),
        y: clamp(y, region.y, maxY),
        anchorIndex: pickedAnchorIndex,
      };
    }
  }

  return {
    x: randomBetween(region.x, maxX, random),
    y: randomBetween(region.y, maxY, random),
    anchorIndex: null,
  };
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
  const targetCount = resolveTargetCount(width, maxItems);
  const selectedAssets = createAssetSequence({ assets, count: targetCount, random });
  const edgePadding = resolveEdgePadding(width);
  const region = resolvePlacementRegion({ width, height, edgePadding });
  const anchors = buildPlacementAnchors({ region, targetCount, viewportWidth: width, random });
  const anchorUsage = new Map<number, number>();
  const totalColumns = anchors.reduce((maxColumn, anchor) => Math.max(maxColumn, anchor.column + 1), 0);
  const placements: PlacedSketch[] = [];

  selectedAssets.forEach((src, index) => {
    const desiredColumn = totalColumns > 0 ? index % totalColumns : 0;
    for (let attempt = 0; attempt < SKETCH_DEFAULTS.maxPlacementAttempts; attempt += 1) {
      const sizeBand = sampleSizeBand(width, random);
      const baseSize = randomBetween(sizeBand.min, sizeBand.max, random);
      const aspectRatio = randomBetween(0.78, 1.2, random);
      const sketchWidth = Math.max(48, Math.min(baseSize, region.width));
      const sketchHeight = Math.max(48, Math.min(baseSize * aspectRatio, region.height));
      const candidatePosition = getCandidatePosition({
        attempt,
        desiredColumn,
        anchors,
        anchorUsage,
        random,
        region,
        sketchWidth,
        sketchHeight,
      });

      if (!candidatePosition) {
        continue;
      }

      const candidateRect: Rect = {
        x: candidatePosition.x,
        y: candidatePosition.y,
        width: sketchWidth,
        height: sketchHeight,
      };

      const protectedCollision = scoreProtectedZoneCollision({
        candidate: candidateRect,
        zones: protectedZones,
        hardRejectThreshold: SKETCH_DEFAULTS.hardZoneRejectThreshold,
        softRejectThreshold: SKETCH_DEFAULTS.softZoneRejectThreshold,
        nearDistance: SKETCH_DEFAULTS.nearZoneDistance,
      });

      if (
        protectedCollision.reject ||
        hasHeavyOverlap(candidateRect, placements) ||
        hasNearbyDuplicateAsset({ candidate: candidateRect, src, existing: placements })
      ) {
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
        x: candidateRect.x,
        y: candidateRect.y,
        width: candidateRect.width,
        height: candidateRect.height,
        rotation: clamp(
          randomBetween(SKETCH_DEFAULTS.rotationMin, SKETCH_DEFAULTS.rotationMax, random),
          SKETCH_DEFAULTS.rotationMin,
          SKETCH_DEFAULTS.rotationMax,
        ),
        opacity,
        blur,
        scale: isNearProtectedContent ? randomBetween(0.9, 0.98, random) : randomBetween(0.94, 1.03, random),
        zIndex: 1,
        delaySeconds: randomBetween(0.06, 0.42, random),
        durationSeconds: randomBetween(1.35, 2.45, random),
        entryRotationOffset: randomBetween(-2.4, 2.4, random),
      });

      if (candidatePosition.anchorIndex !== null) {
        const usage = anchorUsage.get(candidatePosition.anchorIndex) ?? 0;
        anchorUsage.set(candidatePosition.anchorIndex, usage + 1);
      }

      break;
    }
  });

  return placements;
}
