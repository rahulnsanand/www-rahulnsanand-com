export type SketchPageKey = "home" | "about" | "projects" | "blogs" | "contact" | "blogPost";

export type SafeZoneStrength = "hard" | "soft";

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type SketchSafeZoneRect = Rect & {
  strength: SafeZoneStrength;
};

export type PlacedSketch = {
  id: string;
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  blur: number;
  scale: number;
  zIndex: number;
  delaySeconds: number;
  durationSeconds: number;
  entryRotationOffset: number;
};

export type SketchBackgroundProps = {
  page: SketchPageKey;
  className?: string;
  maxItems?: number;
};

export type GenerateSketchPlacementsInput = {
  width: number;
  height: number;
  assets: readonly string[];
  protectedZones: readonly SketchSafeZoneRect[];
  maxItems?: number;
  seed: number;
};
