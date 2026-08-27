import { promises as fs } from "node:fs";
import path from "node:path";

const SITE_CONTENT_FILE = path.join(process.cwd(), "src", "content", "site.json");
const FALLBACK_BASE_URL = "https://www.rahulnsanand.com";

/**
 * Resolve the canonical site origin, without a trailing slash.
 *
 * The environment wins so previews can point elsewhere, then `src/content/site.json` (which is
 * editable from the CMS), then a hardcoded fallback.
 */
export async function resolveSiteUrl() {
  const fromEnv = process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, "");

  try {
    const site = JSON.parse(await fs.readFile(SITE_CONTENT_FILE, "utf8"));
    if (typeof site.url === "string" && site.url.trim()) {
      return site.url.trim().replace(/\/$/, "");
    }
  } catch {
    // Fall through to the hardcoded default.
  }

  return FALLBACK_BASE_URL;
}
