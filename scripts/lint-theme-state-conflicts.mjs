import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postcss from "postcss";

const THEME_CLASSES = new Set(["light", "dark"]);
const PERF_LITE_PROTECTED_TARGETS = new Set([
  ".home-name-underline-main",
  ".home-name-underline-detail",
]);
const ROOT_DIR = process.cwd();

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

function normalizeSelector(selector) {
  return selector
    .replace(/:global\(([^)]+)\)/g, "$1")
    .replace(/:local\(([^)]+)\)/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function parseHtmlSelector(selector) {
  const trimmed = normalizeSelector(selector);
  const match = trimmed.match(/^html((?:\.[A-Za-z0-9_-]+)+)\s+(.+)$/);

  if (!match) {
    return null;
  }

  const htmlClasses = match[1].split(".").filter(Boolean);
  const targetSelector = match[2].replace(/\s+/g, " ").trim();

  return {
    htmlClasses,
    targetSelector,
  };
}

function contextKey(node) {
  const contexts = [];
  let current = node.parent;

  while (current) {
    if (current.type === "atrule") {
      contexts.push(`@${current.name} ${current.params}`.trim());
    }
    current = current.parent;
  }

  return contexts.reverse().join(" | ");
}

function mapKey(parts) {
  return parts.join("||");
}

function lintCssFile(cssPath) {
  const cssSource = fs.readFileSync(cssPath, "utf8");
  const ast = postcss.parse(cssSource, { from: cssPath });

  const themeDecls = new Map();
  const stateDecls = new Map();
  const combinedDecls = new Map();
  const protectedPerfLiteIssues = [];
  const issues = [];

  ast.walkRules((rule) => {
    if (!rule.selectors || rule.selectors.length === 0) {
      return;
    }

    for (const selector of rule.selectors) {
      const parsed = parseHtmlSelector(selector);
      if (!parsed) {
        continue;
      }

      const context = contextKey(rule);
      const themes = parsed.htmlClasses.filter((className) => THEME_CLASSES.has(className));
      const states = parsed.htmlClasses.filter((className) => !THEME_CLASSES.has(className));

      if (states.includes("perf-lite") && PERF_LITE_PROTECTED_TARGETS.has(parsed.targetSelector)) {
        const line = rule.source?.start?.line ?? 0;
        protectedPerfLiteIssues.push({
          file: path.relative(ROOT_DIR, cssPath),
          line,
          selector: normalizeSelector(selector),
        });
      }

      rule.walkDecls((decl) => {
        const property = decl.prop.trim().toLowerCase();
        const line = decl.source?.start?.line ?? rule.source?.start?.line ?? 0;
        const selectorKey = mapKey([context, parsed.targetSelector, property]);

        if (themes.length === 1 && states.length === 0) {
          const existing = themeDecls.get(selectorKey) ?? {
            maxLine: 0,
            themes: new Set(),
          };
          existing.themes.add(themes[0]);
          existing.maxLine = Math.max(existing.maxLine, line);
          themeDecls.set(selectorKey, existing);
          return;
        }

        if (themes.length === 1 && states.length > 0) {
          for (const state of states) {
            const key = mapKey([state, context, parsed.targetSelector, property]);
            const existing = combinedDecls.get(key) ?? new Set();
            existing.add(themes[0]);
            combinedDecls.set(key, existing);
          }
          return;
        }

        if (themes.length === 0 && states.length > 0) {
          for (const state of states) {
            const key = mapKey([state, context, parsed.targetSelector, property]);
            const existing = stateDecls.get(key) ?? [];
            existing.push({
              selector: normalizeSelector(selector),
              line,
            });
            stateDecls.set(key, existing);
          }
        }
      });
    }
  });

  for (const [stateKey, occurrences] of stateDecls.entries()) {
    const [state, context, targetSelector, property] = stateKey.split("||");
    const themeKey = mapKey([context, targetSelector, property]);
    const themeInfo = themeDecls.get(themeKey);

    if (!themeInfo) {
      continue;
    }

    for (const occurrence of occurrences) {
      if (occurrence.line <= themeInfo.maxLine) {
        continue;
      }

      const combinedKey = mapKey([state, context, targetSelector, property]);
      const coveredThemes = combinedDecls.get(combinedKey) ?? new Set();
      const requiredThemes = [...themeInfo.themes];
      const missingThemes = requiredThemes.filter((theme) => !coveredThemes.has(theme));

      if (missingThemes.length > 0) {
        issues.push({
          file: path.relative(ROOT_DIR, cssPath),
          line: occurrence.line,
          selector: occurrence.selector,
          targetSelector,
          property,
          state,
          context: context || "global",
          missingThemes,
        });
      }
    }
  }

  return { issues, protectedPerfLiteIssues };
}

const explicitFileArg = process.argv[2];
const cssFiles = explicitFileArg
  ? [path.resolve(ROOT_DIR, explicitFileArg)]
  : [
      ...walkDir(path.join(ROOT_DIR, "src/styles"), (candidate) => candidate.endsWith(".css")),
      ...walkDir(path.join(ROOT_DIR, "src"), (candidate) => candidate.endsWith(".module.css")),
    ];

if (cssFiles.length === 0) {
  console.error("Theme cascade lint: no CSS files found.");
  process.exit(1);
}

const missingFiles = cssFiles.filter((candidate) => !fs.existsSync(candidate));
if (missingFiles.length > 0) {
  for (const missing of missingFiles) {
    console.error(`Theme cascade lint: CSS file not found at ${missing}`);
  }
  process.exit(1);
}

const allIssues = [];
const allProtectedIssues = [];

for (const cssFile of cssFiles) {
  const { issues, protectedPerfLiteIssues } = lintCssFile(cssFile);
  allIssues.push(...issues);
  allProtectedIssues.push(...protectedPerfLiteIssues);
}

if (allIssues.length > 0 || allProtectedIssues.length > 0) {
  console.error("Theme cascade lint failed.");

  if (allIssues.length > 0) {
    console.error("Potential state-vs-theme override conflicts:");
  }

  for (const issue of allIssues) {
    console.error(
      `- ${issue.file}:${issue.line} selector "${issue.selector}" may override html.${issue.missingThemes.join("/")}` +
        ` for "${issue.targetSelector}" property "${issue.property}" in ${issue.context}.`,
    );
  }

  if (allProtectedIssues.length > 0) {
    console.error("Protected home SVG animation selectors cannot be targeted by html.perf-lite:");
  }

  for (const issue of allProtectedIssues) {
    console.error(`- ${issue.file}:${issue.line} contains disallowed selector "${issue.selector}".`);
  }

  process.exit(1);
}

console.log(`Theme cascade lint passed: no conflicts found across ${cssFiles.length} CSS file(s).`);
