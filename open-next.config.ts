import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * Adapter config for deploying this Next.js app to Cloudflare Workers.
 *
 * Defaults are deliberate: the site is almost entirely prerendered, so the in-memory incremental
 * cache is enough and no R2/KV bucket is needed. Add an `incrementalCache` override here if ISR
 * ever needs to survive across isolates.
 *
 * @see https://opennext.js.org/cloudflare
 */
export default defineCloudflareConfig();
