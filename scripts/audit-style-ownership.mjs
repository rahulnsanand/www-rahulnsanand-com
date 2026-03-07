import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postcss from "postcss";

const ROOT_DIR = process.cwd();
const DEFAULT_JSON_OUTPUT = path.join(ROOT_DIR, ".docs", "css-selector-inventory-baseline.json");
const DEFAULT_REPORT_OUTPUT = path.join(ROOT_DIR, ".docs", "css-migration-report.md");

function walkDir(dir, predicate, files = []) {
  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const absolutePath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(absolutePath, predicate, files);
      continue;
    }

    if (predicate(absolutePath)) {
      files.push(absolutePath);
    }
  }

  return files;
}

function ownerForClassName(className) {
  if (className === "light" || className === "dark" || className === "perf-lite") {
    return "src/styles/foundation/tokens-theme.css";
  }

  if (className.startsWith("u-")) return "src/styles/foundation/global-utilities.css";

  if (className.startsWith("site-footer")) return "src/components/layout/site-footer-accent.module.css";
  if (className.startsWith("site-logo")) return "src/components/layout/theme-logo.module.css";
  if (className.startsWith("theme-toggle")) return "src/components/layout/theme-toggle.module.css";
  if (className === "page-transition-root") return "src/components/layout/page-transition.module.css";
  if (className.startsWith("media-fade")) return "src/components/ui/media-fade.module.css";
  if (className.startsWith("site-")) return "src/components/layout/site-header.module.css";

  if (className.startsWith("home-")) return "src/components/home/homepage.module.css";
  if (className.startsWith("content-")) return "src/components/content/content-page.module.css";
  if (className.startsWith("contact-")) return "src/components/contact/contact-page.module.css";

  if (className.startsWith("projects-highlight") || className.startsWith("project-highlight")) {
    return "src/components/projects/highlighted-projects-carousel.module.css";
  }

  if (className.startsWith("projects-") || className.startsWith("project-card")) {
    return "src/components/projects/projects-showcase.module.css";
  }

  if (className.startsWith("blog-share-button")) return "src/components/blog/blog-share-button.module.css";
  if (className.startsWith("blog-scroll-top-button")) return "src/components/blog/blog-scroll-top-button.module.css";
  if (className.startsWith("blog-markdown") || className.startsWith("blog-inline")) {
    return "src/components/blog/blog-markdown.module.css";
  }
  if (className.startsWith("blog-post-")) return "src/app/blogs/[slug]/blog-post-page.module.css";
  if (
    className.startsWith("blogs-") ||
    className.startsWith("blog-card") ||
    className.startsWith("blog-row") ||
    className.startsWith("blog-media")
  ) {
    return "src/components/blog/blog-dashboard.module.css";
  }

  if (className.startsWith("about-separator")) return "src/app/about/about-separator.module.css";
  if (className.startsWith("about-intro")) return "src/app/about/about-intro-panel.module.css";
  if (className.startsWith("about-profile") || className.startsWith("about-tool") || className === "about-timezone") {
    return "src/app/about/about-profile-summary.module.css";
  }
  if (className.startsWith("about-")) return "src/app/about/about-body.module.css";

  if (className.startsWith("nf-")) return "src/app/not-found.module.css";

  return null;
}

function collectCssFiles() {
  return [
    ...walkDir(path.join(ROOT_DIR, "src/styles"), (candidate) => candidate.endsWith(".css")),
    ...walkDir(path.join(ROOT_DIR, "src"), (candidate) => candidate.endsWith(".module.css")),
  ];
}

function parseClassNames(selector) {
  return [...selector.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((match) => match[1]);
}

function createInventory(cssFiles) {
  const selectors = [];
  const ownerCounts = new Map();
  const unresolvedClassSet = new Set();

  for (const cssFile of cssFiles) {
    const source = fs.readFileSync(cssFile, "utf8");
    const ast = postcss.parse(source, { from: cssFile });

    ast.walkRules((rule) => {
      if (!rule.selectors || rule.selectors.length === 0) {
        return;
      }

      const line = rule.source?.start?.line ?? 0;

      for (const selector of rule.selectors) {
        const classNames = parseClassNames(selector);
        if (classNames.length === 0) {
          continue;
        }

        const owners = new Set();
        for (const className of classNames) {
          const owner = ownerForClassName(className);
          if (owner) {
            owners.add(owner);
            ownerCounts.set(owner, (ownerCounts.get(owner) ?? 0) + 1);
            continue;
          }
          unresolvedClassSet.add(className);
        }

        selectors.push({
          file: path.relative(ROOT_DIR, cssFile),
          line,
          selector,
          classNames,
          owners: [...owners].sort(),
        });
      }
    });
  }

  return {
    generatedAt: new Date().toISOString(),
    cssFiles: cssFiles.map((file) => path.relative(ROOT_DIR, file)),
    selectorCount: selectors.length,
    ownerCounts: [...ownerCounts.entries()]
      .map(([owner, count]) => ({ owner, selectorHits: count }))
      .sort((a, b) => a.owner.localeCompare(b.owner)),
    unresolvedClasses: [...unresolvedClassSet].sort(),
    selectors,
  };
}

function writeReport(reportPath, inventory) {
  const ownerRows = inventory.ownerCounts
    .map((entry) => `- ${entry.owner}: ${entry.selectorHits} selector hit(s)`)
    .join("\n");
  const unresolvedRows =
    inventory.unresolvedClasses.length === 0
      ? "- None"
      : inventory.unresolvedClasses.map((className) => `- \`${className}\``).join("\n");

  const report = `# CSS Migration Report

Generated: ${inventory.generatedAt}

## Selector Inventory
- CSS files scanned: ${inventory.cssFiles.length}
- Selector records: ${inventory.selectorCount}

## Owner Distribution
${ownerRows || "- None"}

## Unresolved Selectors
${unresolvedRows}

## Notes
- This report is generated by \`scripts/audit-style-ownership.mjs\`.
- Treat unresolved selectors as blockers until mapped or intentionally allowlisted.
`;

  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, report, "utf8");
}

const jsonOutput = process.argv[2] ? path.resolve(ROOT_DIR, process.argv[2]) : DEFAULT_JSON_OUTPUT;
const reportOutput = process.argv[3] ? path.resolve(ROOT_DIR, process.argv[3]) : DEFAULT_REPORT_OUTPUT;

const cssFiles = collectCssFiles();
if (cssFiles.length === 0) {
  console.error("Style ownership audit failed: no CSS files found.");
  process.exit(1);
}

const inventory = createInventory(cssFiles);

fs.mkdirSync(path.dirname(jsonOutput), { recursive: true });
fs.writeFileSync(jsonOutput, `${JSON.stringify(inventory, null, 2)}\n`, "utf8");
writeReport(reportOutput, inventory);

const unresolvedCount = inventory.unresolvedClasses.length;
if (unresolvedCount > 0) {
  console.error(`Style ownership audit completed with ${unresolvedCount} unresolved class selector(s).`);
  console.error(`See ${path.relative(ROOT_DIR, reportOutput)} for details.`);
  process.exit(1);
}

console.log(
  `Style ownership audit passed: ${inventory.selectorCount} selector record(s), 0 unresolved class selectors.`,
);
