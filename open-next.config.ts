import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import kvIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/kv-incremental-cache";
import r2IncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache";

const incrementalCacheBackend = (process.env.OPENNEXT_INCREMENTAL_CACHE_BACKEND ?? "r2").toLowerCase();
const incrementalCache = incrementalCacheBackend === "kv" ? kvIncrementalCache : r2IncrementalCache;

export default defineCloudflareConfig({
	incrementalCache,
});
