import { clamp } from "./sketch.utils";

const GEOMETRY_SELECTOR = "path, circle, ellipse, rect, line, polyline, polygon";
const svgMarkupCache = new Map<string, Promise<string | null>>();

function getStyleProperty(styleValue: string | null, propertyName: string): string | null {
  if (!styleValue) {
    return null;
  }

  const propertyMatch = styleValue.match(new RegExp(`${propertyName}\\s*:\\s*([^;]+)`, "i"));
  return propertyMatch?.[1]?.trim() ?? null;
}

function isUsablePaint(value: string | null): value is string {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized !== "none" && normalized !== "transparent";
}

function getSafeGeometryLength(element: SVGGeometryElement): number {
  try {
    const length = element.getTotalLength();
    if (Number.isFinite(length) && length > 0) {
      return clamp(length, 12, 2200);
    }
  } catch {
    return 120;
  }

  return 120;
}

function resolveDrawColor(segment: SVGElement, styleValue: string | null): string {
  const stroke = segment.getAttribute("stroke") ?? getStyleProperty(styleValue, "stroke");
  if (isUsablePaint(stroke)) {
    return stroke;
  }

  const fill = segment.getAttribute("fill") ?? getStyleProperty(styleValue, "fill");
  if (isUsablePaint(fill)) {
    return fill;
  }

  return "currentColor";
}

function resolveStrokeWidth(segment: SVGElement, styleValue: string | null): number {
  const strokeWidthRaw = segment.getAttribute("stroke-width") ?? getStyleProperty(styleValue, "stroke-width");
  const parsed = Number.parseFloat(strokeWidthRaw ?? "");
  if (Number.isFinite(parsed) && parsed > 0) {
    return clamp(parsed, 1.0, 3.6);
  }

  return 1.6;
}

function toSketchSvgMarkup(rawSvgMarkup: string): string | null {
  const parser = new DOMParser();
  const documentNode = parser.parseFromString(rawSvgMarkup, "image/svg+xml");
  const parseError = documentNode.querySelector("parsererror");
  if (parseError) {
    return null;
  }

  const svg = documentNode.querySelector("svg");
  if (!svg) {
    return null;
  }

  svg.removeAttribute("width");
  svg.removeAttribute("height");
  svg.removeAttribute("class");
  svg.setAttribute("focusable", "false");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "xMidYMid meet");
  // Keep only safe static SVG content before injecting inline.
  svg.querySelectorAll("script, foreignObject").forEach((node) => node.remove());

  const segments = Array.from(svg.querySelectorAll<SVGElement>(GEOMETRY_SELECTOR));
  if (segments.length === 0) {
    return null;
  }

  segments.forEach((originalSegment) => {
    const styleValue = originalSegment.getAttribute("style");
    const drawColor = resolveDrawColor(originalSegment, styleValue);
    const drawStrokeWidth = resolveStrokeWidth(originalSegment, styleValue);
    const drawSegment = originalSegment.cloneNode(true);

    if (!(drawSegment instanceof SVGElement)) {
      return;
    }

    drawSegment.removeAttribute("style");
    drawSegment.setAttribute("fill", "none");
    drawSegment.setAttribute("stroke", drawColor);
    drawSegment.setAttribute("stroke-width", drawStrokeWidth.toFixed(2));
    drawSegment.setAttribute("stroke-linecap", "round");
    drawSegment.setAttribute("stroke-linejoin", "round");
    drawSegment.setAttribute("vector-effect", "non-scaling-stroke");
    drawSegment.setAttribute("opacity", "0");
    drawSegment.setAttribute("data-sketch-draw", "true");

    originalSegment.setAttribute("opacity", "0");
    originalSegment.setAttribute("data-sketch-original", "true");

    const parent = originalSegment.parentNode;
    if (!parent) {
      return;
    }

    parent.insertBefore(drawSegment, originalSegment);
  });

  return svg.outerHTML;
}

export function loadSketchSvgMarkup(src: string): Promise<string | null> {
  const cached = svgMarkupCache.get(src);
  if (cached) {
    return cached;
  }

  const nextValue = fetch(src)
    .then((response) => {
      if (!response.ok) {
        return null;
      }
      return response.text();
    })
    .then((rawMarkup) => {
      if (!rawMarkup) {
        return null;
      }
      return toSketchSvgMarkup(rawMarkup);
    })
    .catch(() => null);

  svgMarkupCache.set(src, nextValue);
  return nextValue;
}

export function runSketchStrokeAnimation({
  root,
  delaySeconds,
  durationSeconds,
  reduceMotion,
}: {
  root: HTMLElement;
  delaySeconds: number;
  durationSeconds: number;
  reduceMotion: boolean;
}) {
  const drawSegments = Array.from(root.querySelectorAll<SVGGeometryElement>("[data-sketch-draw]"));
  const originalSegments = Array.from(root.querySelectorAll<SVGElement>("[data-sketch-original]"));
  if (drawSegments.length === 0 || originalSegments.length === 0) {
    return;
  }

  if (reduceMotion) {
    drawSegments.forEach((segment) => {
      segment.style.animation = "none";
      segment.style.strokeDasharray = "none";
      segment.style.strokeDashoffset = "0";
      segment.style.opacity = "0";
    });

    originalSegments.forEach((segment) => {
      segment.style.animation = "none";
      segment.style.opacity = "1";
    });
    return;
  }

  const totalSegments = drawSegments.length;
  const staggerStep = clamp((durationSeconds * 0.7) / Math.max(totalSegments, 1), 0.004, 0.028);

  drawSegments.forEach((drawSegment, index) => {
    const originalSegment = originalSegments[index];
    const length = getSafeGeometryLength(drawSegment);
    const segmentDelay = delaySeconds + index * staggerStep;
    const drawDuration = clamp(0.32 + Math.log10(length + 10) * 0.15, 0.34, 0.96);

    drawSegment.style.strokeDasharray = `${length.toFixed(2)}`;
    drawSegment.style.strokeDashoffset = `${length.toFixed(2)}`;
    drawSegment.style.opacity = "0";
    drawSegment.style.animation = `sketch-stroke-draw ${drawDuration.toFixed(3)}s cubic-bezier(0.22, 0.61, 0.36, 1) ${segmentDelay.toFixed(3)}s forwards`;

    if (!originalSegment) {
      return;
    }

    originalSegment.style.opacity = "0";
    originalSegment.style.animation = `sketch-segment-reveal 0.22s linear ${(segmentDelay + drawDuration * 0.68).toFixed(3)}s forwards`;
  });
}
