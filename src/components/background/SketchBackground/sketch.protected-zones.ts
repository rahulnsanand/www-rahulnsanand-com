import type { Rect, SafeZoneStrength, SketchSafeZoneRect } from "./sketch.types";
import { clamp } from "./sketch.utils";

type MeasureProtectedZonesInput = {
  shell: HTMLElement;
  shellWidth: number;
  shellHeight: number;
  hardZonePadding: number;
  softZonePadding: number;
};

type ScoreProtectedZoneCollisionInput = {
  candidate: Rect;
  zones: readonly SketchSafeZoneRect[];
  hardRejectThreshold: number;
  softRejectThreshold: number;
  nearDistance: number;
};

export type ProtectedZoneCollisionScore = {
  reject: boolean;
  maxOverlapRatio: number;
  nearIntensity: number;
};

function parseSafeZoneStrength(rawValue: string | null): SafeZoneStrength {
  if (rawValue === "soft") {
    return "soft";
  }
  return "hard";
}

function expandAndClampRect({
  rect,
  padding,
  shellWidth,
  shellHeight,
}: {
  rect: Rect;
  padding: number;
  shellWidth: number;
  shellHeight: number;
}): Rect {
  const x = clamp(rect.x - padding, 0, shellWidth);
  const y = clamp(rect.y - padding, 0, shellHeight);
  const maxRight = clamp(rect.x + rect.width + padding, 0, shellWidth);
  const maxBottom = clamp(rect.y + rect.height + padding, 0, shellHeight);

  return {
    x,
    y,
    width: Math.max(0, maxRight - x),
    height: Math.max(0, maxBottom - y),
  };
}

function getIntersectionArea(a: Rect, b: Rect): number {
  const startX = Math.max(a.x, b.x);
  const startY = Math.max(a.y, b.y);
  const endX = Math.min(a.x + a.width, b.x + b.width);
  const endY = Math.min(a.y + a.height, b.y + b.height);
  const width = endX - startX;
  const height = endY - startY;
  if (width <= 0 || height <= 0) {
    return 0;
  }
  return width * height;
}

function getRectDistance(a: Rect, b: Rect): number {
  const horizontalGap = Math.max(b.x - (a.x + a.width), a.x - (b.x + b.width), 0);
  const verticalGap = Math.max(b.y - (a.y + a.height), a.y - (b.y + b.height), 0);
  return Math.hypot(horizontalGap, verticalGap);
}

export function measureProtectedZones({
  shell,
  shellWidth,
  shellHeight,
  hardZonePadding,
  softZonePadding,
}: MeasureProtectedZonesInput): SketchSafeZoneRect[] {
  const shellRect = shell.getBoundingClientRect();
  const zoneElements = Array.from(shell.querySelectorAll<HTMLElement>("[data-sketch-safe-zone]"));

  return zoneElements.flatMap((zoneElement) => {
    const rect = zoneElement.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1) {
      return [];
    }

    const relativeRect: Rect = {
      x: rect.left - shellRect.left,
      y: rect.top - shellRect.top,
      width: rect.width,
      height: rect.height,
    };

    const strength = parseSafeZoneStrength(zoneElement.getAttribute("data-sketch-safe-zone"));
    const paddedRect = expandAndClampRect({
      rect: relativeRect,
      padding: strength === "hard" ? hardZonePadding : softZonePadding,
      shellWidth,
      shellHeight,
    });

    if (paddedRect.width < 1 || paddedRect.height < 1) {
      return [];
    }

    return [{ ...paddedRect, strength }];
  });
}

export function scoreProtectedZoneCollision({
  candidate,
  zones,
  hardRejectThreshold,
  softRejectThreshold,
  nearDistance,
}: ScoreProtectedZoneCollisionInput): ProtectedZoneCollisionScore {
  const candidateArea = candidate.width * candidate.height;
  if (candidateArea <= 0) {
    return { reject: true, maxOverlapRatio: 1, nearIntensity: 1 };
  }

  let reject = false;
  let maxOverlapRatio = 0;
  let nearIntensity = 0;

  for (const zone of zones) {
    const overlapArea = getIntersectionArea(candidate, zone);
    const overlapRatio = overlapArea / candidateArea;
    maxOverlapRatio = Math.max(maxOverlapRatio, overlapRatio);

    if (zone.strength === "hard" && overlapRatio > hardRejectThreshold) {
      reject = true;
      break;
    }

    if (zone.strength === "soft" && overlapRatio > softRejectThreshold) {
      reject = true;
      break;
    }

    const distance = getRectDistance(candidate, zone);
    const intensity = clamp(1 - distance / nearDistance, 0, 1);
    nearIntensity = Math.max(nearIntensity, intensity);
  }

  return { reject, maxOverlapRatio, nearIntensity };
}

export function getRectOverlapRatio(rect: Rect, other: Rect): number {
  const overlapArea = getIntersectionArea(rect, other);
  const area = rect.width * rect.height;
  if (area <= 0) {
    return 0;
  }
  return overlapArea / area;
}
