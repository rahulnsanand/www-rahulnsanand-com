import type { SketchPageKey } from "./sketch.types";

type SketchManifest = Record<SketchPageKey, readonly string[]>;

// Add new page sketches by creating files in /public/sketches/<page-key>/ and
// registering their absolute public paths in this manifest.
export const sketchManifest: SketchManifest = {
  home: [
    "/sketches/home/hotel-svgrepo-com.svg",
    "/sketches/home/map-svgrepo-com.svg",
    "/sketches/home/polaroid-svgrepo-com.svg",
    "/sketches/home/sunbathing-svgrepo-com.svg",
  ],
  about: [
    "/sketches/about/surf-svgrepo-com.svg",
    "/sketches/about/suv-svgrepo-com.svg",
    "/sketches/about/the-trees-svgrepo-com.svg",
    "/sketches/about/wallet-svgrepo-com.svg",
  ],
  projects: [],
  blogs: [],
  contact: [],
  blogPost: [],
};
