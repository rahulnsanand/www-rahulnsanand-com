import fs from "node:fs";
import path from "node:path";
import postcss from "postcss";

const ROOT_DIR = process.cwd();
const INPUT_PATH = path.join(ROOT_DIR, "src/styles/globals.css");
const UNASSIGNED_PATH = path.join(ROOT_DIR, "src/styles/foundation/_unassigned.css");

const OWNER_FILES = {
  rootLayout: "src/app/root-layout.module.css",
  siteHeader: "src/components/layout/site-header.module.css",
  themeToggle: "src/components/layout/theme-toggle.module.css",
  themeLogo: "src/components/layout/theme-logo.module.css",
  siteFooter: "src/components/layout/site-footer-accent.module.css",
  pageTransition: "src/components/layout/page-transition.module.css",
  mediaFade: "src/components/ui/media-fade.module.css",
  home: "src/components/home/homepage.module.css",
  content: "src/components/content/content-page.module.css",
  contact: "src/components/contact/contact-page.module.css",
  projectsShowcase: "src/components/projects/projects-showcase.module.css",
  projectsCarousel: "src/components/projects/highlighted-projects-carousel.module.css",
  blogDashboard: "src/components/blog/blog-dashboard.module.css",
  blogMarkdown: "src/components/blog/blog-markdown.module.css",
  blogShare: "src/components/blog/blog-share-button.module.css",
  blogScrollTop: "src/components/blog/blog-scroll-top-button.module.css",
  blogPost: "src/app/blogs/[slug]/blog-post-page.module.css",
  aboutBody: "src/app/about/about-body.module.css",
  aboutIntro: "src/app/about/about-intro-panel.module.css",
  aboutProfile: "src/app/about/about-profile-summary.module.css",
  aboutSeparator: "src/app/about/about-separator.module.css",
  notFound: "src/app/not-found.module.css",
};

const FOUNDATIONS = {
  tokens: "src/styles/foundation/tokens-theme.css",
  base: "src/styles/foundation/base-reset.css",
  scrollbar: "src/styles/foundation/scrollbar.css",
  utilities: "src/styles/foundation/global-utilities.css",
};

const THEME_NEUTRAL_CLASSES = new Set(["light", "dark", "perf-lite"]);

function ownerForClassName(className) {
  if (className.startsWith("u-")) return "foundation:utilities";

  if (className === "page-transition-root") return OWNER_FILES.pageTransition;

  if (className.startsWith("site-body") || className.startsWith("site-shell") || className.startsWith("site-main")) {
    return OWNER_FILES.rootLayout;
  }

  if (className.startsWith("site-footer")) return OWNER_FILES.siteFooter;
  if (className.startsWith("site-logo")) return OWNER_FILES.themeLogo;
  if (className.startsWith("theme-toggle")) return OWNER_FILES.themeToggle;

  if (className.startsWith("site-header") || className.startsWith("site-nav")) {
    return OWNER_FILES.siteHeader;
  }

  if (className.startsWith("media-fade")) return OWNER_FILES.mediaFade;
  if (className.startsWith("home-")) return OWNER_FILES.home;
  if (className.startsWith("content-")) return OWNER_FILES.content;
  if (className.startsWith("contact-")) return OWNER_FILES.contact;

  if (className.startsWith("projects-highlight") || className.startsWith("project-highlight")) {
    return OWNER_FILES.projectsCarousel;
  }

  if (className.startsWith("projects-") || className.startsWith("project-card")) {
    return OWNER_FILES.projectsShowcase;
  }

  if (className.startsWith("blog-share-button")) return OWNER_FILES.blogShare;
  if (className.startsWith("blog-scroll-top-button")) return OWNER_FILES.blogScrollTop;
  if (className.startsWith("blog-markdown") || className.startsWith("blog-inline")) return OWNER_FILES.blogMarkdown;
  if (className.startsWith("blog-post-")) return OWNER_FILES.blogPost;
  if (
    className.startsWith("blogs-") ||
    className.startsWith("blog-card") ||
    className.startsWith("blog-row") ||
    className.startsWith("blog-media")
  ) {
    return OWNER_FILES.blogDashboard;
  }

  if (className.startsWith("about-separator")) return OWNER_FILES.aboutSeparator;
  if (className.startsWith("about-intro")) return OWNER_FILES.aboutIntro;
  if (className.startsWith("about-profile") || className.startsWith("about-tool") || className === "about-timezone") {
    return OWNER_FILES.aboutProfile;
  }
  if (className.startsWith("about-")) return OWNER_FILES.aboutBody;

  if (className.startsWith("nf-")) return OWNER_FILES.notFound;

  return null;
}

function keyframeOwner() {
  return null;
}

function classNamesForSelector(selector) {
  return [...selector.matchAll(/\.([A-Za-z0-9_-]+)/g)].map((match) => match[1]);
}

function isScrollbarSelector(selector) {
  return selector.includes("scrollbar");
}

function rootForOwner(ownerRoots, ownerName) {
  if (!ownerRoots.has(ownerName)) {
    ownerRoots.set(ownerName, postcss.root());
  }
  return ownerRoots.get(ownerName);
}

function assignRuleBySelectors(rule) {
  if (!rule.selectors || rule.selectors.length === 0) {
    return { unresolved: [rule.clone()] };
  }

  const perOwnerSelectors = new Map();
  const unresolvedSelectors = [];

  for (const selector of rule.selectors) {
    const classNames = classNamesForSelector(selector);

    if (classNames.length === 0) {
      unresolvedSelectors.push(selector);
      continue;
    }

    if (classNames.every((className) => THEME_NEUTRAL_CLASSES.has(className))) {
      const selectors = perOwnerSelectors.get("foundation:tokens") ?? [];
      selectors.push(selector);
      perOwnerSelectors.set("foundation:tokens", selectors);
      continue;
    }

    const owners = new Set();
    for (const className of classNames) {
      if (THEME_NEUTRAL_CLASSES.has(className)) {
        continue;
      }
      const owner = ownerForClassName(className);
      if (owner) {
        owners.add(owner);
      }
    }

    if (owners.size === 1) {
      const [owner] = [...owners];
      const selectors = perOwnerSelectors.get(owner) ?? [];
      selectors.push(selector);
      perOwnerSelectors.set(owner, selectors);
      continue;
    }

    unresolvedSelectors.push(selector);
  }

  const assigned = [];
  for (const [owner, selectors] of perOwnerSelectors.entries()) {
    const clone = rule.clone();
    clone.selectors = selectors;
    assigned.push({ owner, node: clone });
  }

  const unresolved = [];
  if (unresolvedSelectors.length > 0) {
    const clone = rule.clone();
    clone.selectors = unresolvedSelectors;
    unresolved.push(clone);
  }

  return { assigned, unresolved };
}

function pushNode(ownerRoots, ownerName, node) {
  const root = rootForOwner(ownerRoots, ownerName);
  root.append(node);
}

function pushAssignedNode(ownerRoots, foundationRoots, ownerName, node) {
  if (ownerName === "foundation:tokens") {
    foundationRoots.get(FOUNDATIONS.tokens)?.append(node);
    return;
  }
  if (ownerName === "foundation:utilities") {
    foundationRoots.get(FOUNDATIONS.utilities)?.append(node);
    return;
  }
  pushNode(ownerRoots, ownerName, node);
}

function distributeAtRule(atRule) {
  const ownerChildren = new Map();
  const unresolvedChildren = [];

  for (const child of atRule.nodes ?? []) {
    if (child.type === "rule") {
      const { assigned, unresolved } = assignRuleBySelectors(child);
      for (const entry of assigned ?? []) {
        const children = ownerChildren.get(entry.owner) ?? [];
        children.push(entry.node);
        ownerChildren.set(entry.owner, children);
      }
      unresolvedChildren.push(...(unresolved ?? []));
      continue;
    }

    if (child.type === "atrule" && child.name === "media") {
      const nested = distributeAtRule(child);
      for (const [owner, nodes] of nested.ownerChildren.entries()) {
        const children = ownerChildren.get(owner) ?? [];
        children.push(...nodes);
        ownerChildren.set(owner, children);
      }
      unresolvedChildren.push(...nested.unresolvedChildren);
      continue;
    }

    unresolvedChildren.push(child.clone());
  }

  return { ownerChildren, unresolvedChildren };
}

function wrapSelectorWithGlobal(root) {
  root.walkRules((rule) => {
    let current = rule.parent;
    while (current) {
      if (current.type === "atrule" && current.name === "keyframes") {
        return;
      }
      current = current.parent;
    }

    if (!rule.selectors || rule.selectors.length === 0) {
      return;
    }
    rule.selectors = rule.selectors.map((selector) => `:global(${selector})`);
  });
}

const cssSource = fs.readFileSync(INPUT_PATH, "utf8");
const ast = postcss.parse(cssSource, { from: INPUT_PATH });

const ownerRoots = new Map();
const foundationRoots = new Map([
  [FOUNDATIONS.tokens, postcss.root()],
  [FOUNDATIONS.base, postcss.root()],
  [FOUNDATIONS.scrollbar, postcss.root()],
  [FOUNDATIONS.utilities, postcss.root()],
]);
const unresolvedRoot = postcss.root();

for (const node of ast.nodes) {
  if (node.type === "comment") {
    continue;
  }

  if (node.type === "atrule" && node.name === "keyframes") {
    const owner = keyframeOwner(node.params.trim());
    if (owner) {
      pushNode(ownerRoots, owner, node.clone());
    } else {
      foundationRoots.get(FOUNDATIONS.base)?.append(node.clone());
    }
    continue;
  }

  if (node.type === "rule") {
    const selectorText = node.selectors?.join(", ") ?? "";

    if (selectorText.includes(":root")) {
      foundationRoots.get(FOUNDATIONS.tokens)?.append(node.clone());
      continue;
    }

    if (node.selectors && node.selectors.every((selector) => isScrollbarSelector(selector))) {
      foundationRoots.get(FOUNDATIONS.scrollbar)?.append(node.clone());
      continue;
    }

    if (node.selectors && node.selectors.length === 1 && node.selectors[0].trim() === "html") {
      if (node.toString().includes("scrollbar-")) {
        foundationRoots.get(FOUNDATIONS.scrollbar)?.append(node.clone());
      } else {
        foundationRoots.get(FOUNDATIONS.base)?.append(node.clone());
      }
      continue;
    }

    const { assigned, unresolved } = assignRuleBySelectors(node);
    for (const entry of assigned ?? []) {
      pushAssignedNode(ownerRoots, foundationRoots, entry.owner, entry.node);
    }
    for (const unresolvedRule of unresolved ?? []) {
      unresolvedRoot.append(unresolvedRule);
    }
    continue;
  }

  if (node.type === "atrule" && node.name === "media") {
    const distributed = distributeAtRule(node);
    for (const [owner, children] of distributed.ownerChildren.entries()) {
      if (children.length === 0) continue;
      const mediaClone = postcss.atRule({ name: "media", params: node.params });
      mediaClone.append(...children.map((child) => child.clone()));
      pushAssignedNode(ownerRoots, foundationRoots, owner, mediaClone);
    }
    if (distributed.unresolvedChildren.length > 0) {
      const unresolvedMedia = postcss.atRule({ name: "media", params: node.params });
      unresolvedMedia.append(...distributed.unresolvedChildren.map((child) => child.clone()));
      unresolvedRoot.append(unresolvedMedia);
    }
    continue;
  }

  foundationRoots.get(FOUNDATIONS.base)?.append(node.clone());
}

for (const [owner, root] of ownerRoots.entries()) {
  wrapSelectorWithGlobal(root);
  const outputPath = path.join(ROOT_DIR, owner);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${root.toString()}\n`, "utf8");
}

for (const [filePath, root] of foundationRoots.entries()) {
  const outputPath = path.join(ROOT_DIR, filePath);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, `${root.toString()}\n`, "utf8");
}

fs.mkdirSync(path.dirname(UNASSIGNED_PATH), { recursive: true });
fs.writeFileSync(UNASSIGNED_PATH, `${unresolvedRoot.toString()}\n`, "utf8");

console.log(`Generated ${ownerRoots.size} module CSS file(s).`);
console.log(`Wrote foundation files to src/styles/foundation/*.css.`);
console.log(`Unassigned rules saved to ${path.relative(ROOT_DIR, UNASSIGNED_PATH)}.`);
