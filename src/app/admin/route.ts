import { siteContent } from "@/lib/site";

/**
 * Sveltia CMS lives at /admin.
 *
 * It is served as a bare HTML document from a route handler rather than a page, because the CMS
 * takes over the whole document and must not inherit the site chrome, fonts or theme script from
 * the root layout. The configuration is fetched separately from /admin/config.yml.
 */

export const dynamic = "force-static";

const CMS_SCRIPT_URL = "https://unpkg.com/@sveltia/cms@%5E0.201.1/dist/sveltia-cms.js";

const ADMIN_HTML = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Content Manager | ${siteContent.name}</title>
    <link rel="cms-config-url" type="application/yaml" href="/admin/config.yml" />
  </head>
  <body>
    <script src="${CMS_SCRIPT_URL}"></script>
  </body>
</html>
`;

export function GET(): Response {
  return new Response(ADMIN_HTML, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=0, must-revalidate",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}
