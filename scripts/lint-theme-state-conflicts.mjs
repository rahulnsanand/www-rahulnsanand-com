import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import postcss from "postcss";

const THEME_CLASSES = new Set(["light", "dark"]);
const PERF_LITE_PROTECTED_TARGETS = new Set([
  ".home-name-underline-main",
  ".home-name-underline-detail",
]);
const defaultCssPath = path.resolve(process.cwd(), "src/styles/globals.css");
const cssPath = path.resolve(process.cwd(), process.argv[2] ?? defaultCssPath);

function parseHtmlSelector(selector) {
  const trimmed = selector.trim();
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

if (!fs.existsSync(cssPath)) {
  console.error(`Theme cascade lint: CSS file not found at ${cssPath}`);
  process.exit(1);
}

const cssSource = fs.readFileSync(cssPath, "utf8");
const ast = postcss.parse(cssSource, { from: cssPath });

const themeDecls = new Map();
const stateDecls = new Map();
const combinedDecls = new Map();
const protectedPerfLiteIssues = [];

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
        line,
        selector: selector.trim(),
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
            selector: selector.trim(),
            line,
          });
          stateDecls.set(key, existing);
        }
      }
    });
  }
});

const issues = [];

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

if (issues.length > 0 || protectedPerfLiteIssues.length > 0) {
  console.error("Theme cascade lint failed.");

  if (issues.length > 0) {
    console.error("Potential state-vs-theme override conflicts:");
  }

  for (const issue of issues) {
    console.error(
      `- ${path.relative(process.cwd(), cssPath)}:${issue.line} selector "${issue.selector}"` +
        ` may override html.${issue.missingThemes.join("/")} for "${issue.targetSelector}"` +
        ` property "${issue.property}" in ${issue.context}.`,
    );
  }

  if (protectedPerfLiteIssues.length > 0) {
    console.error("Protected home SVG animation selectors cannot be targeted by html.perf-lite:");
  }

  for (const issue of protectedPerfLiteIssues) {
    console.error(
      `- ${path.relative(process.cwd(), cssPath)}:${issue.line} contains disallowed selector "${issue.selector}".`,
    );
  }

  process.exit(1);
}

console.log(`Theme cascade lint passed: no conflicts found in ${path.relative(process.cwd(), cssPath)}.`);
