import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOG_CONTENT_DIR = path.join(ROOT, "src", "content", "blog");
const ABOUT_CONTENT_FILE = path.join(ROOT, "src", "content", "about.json");
const PUBLIC_DIR = path.join(ROOT, "public");
const SEO_DIR = path.join(PUBLIC_DIR, "seo");
const OUTPUT_LLM_FILE = path.join(PUBLIC_DIR, "llms.txt");
const OUTPUT_LLM_FULL_FILE = path.join(PUBLIC_DIR, "llms-full.txt");
const OUTPUT_CONTENT_INDEX_FILE = path.join(SEO_DIR, "content-index.json");
const OUTPUT_BLOG_INDEX_FILE = path.join(SEO_DIR, "blogs.json");
const OUTPUT_ABOUT_INDEX_FILE = path.join(SEO_DIR, "about.json");
const FALLBACK_BASE_URL = "https://www.rahulnsanand.com";

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing or invalid frontmatter block.");
  }

  const [, frontmatterRaw, bodyRaw] = match;
  const frontmatter = {};
  let activeArrayKey = null;

  for (const line of frontmatterRaw.split(/\r?\n/)) {
    if (!line.trim()) continue;

    const listItemMatch = line.match(/^\s*-\s+(.+)$/);
    if (listItemMatch && activeArrayKey === "tags") {
      const value = listItemMatch[1]?.trim().replace(/^["']|["']$/g, "");
      if (!value) continue;
      if (!frontmatter.tags) frontmatter.tags = [];
      frontmatter.tags.push(value);
      continue;
    }

    const keyValueMatch = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!keyValueMatch) continue;

    const [, key, rawValue = ""] = keyValueMatch;
    const value = rawValue.trim();
    activeArrayKey = null;

    if (key === "tags") {
      activeArrayKey = "tags";
      frontmatter.tags = value
        ? value
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean)
        : [];
      continue;
    }

    if (["title", "description", "date", "youtubeUrl", "coverImage"].includes(key)) {
      const cleaned = value.replace(/^["']|["']$/g, "");
      if (cleaned) {
        frontmatter[key] = cleaned;
      }
    }
  }

  if (!frontmatter.title || !frontmatter.description || !frontmatter.date) {
    throw new Error("Frontmatter requires title, description, and date.");
  }

  if (!frontmatter.tags) {
    frontmatter.tags = [];
  }

  return {
    frontmatter,
    body: (bodyRaw || "").trim(),
  };
}

function markdownToText(markdown) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/^>\s?/gm, "")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/[*_~]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function firstWords(text, count) {
  const words = text.split(/\s+/).filter(Boolean);
  return words.slice(0, count).join(" ");
}

function getReadingTimeMinutes(wordCount) {
  return Math.max(1, Math.ceil(wordCount / 220));
}

function normalizeSiteUrl(url) {
  return (url || FALLBACK_BASE_URL).replace(/\/$/, "");
}

function toIsoStartOfDay(date) {
  return `${date}T00:00:00.000Z`;
}

function flattenAboutText(aboutData) {
  const profileLine = `${aboutData.profile.name}. ${aboutData.profile.primaryLinks.map((link) => `${link.label} (${link.href})`).join(". ")}.`;

  const sectionLines = aboutData.sections.flatMap((section) => {
    const groupLines = section.groups.flatMap((group) =>
      group.items.map((item) => {
        const bullets = item.bullets.join(" ");
        return `${item.title} - ${item.role} (${item.period}). ${bullets}`;
      }),
    );
    return [`${section.heading}: ${groupLines.join(" ")}`];
  });

  return `${profileLine} ${sectionLines.join(" ")}`.replace(/\s+/g, " ").trim();
}

async function readBlogPosts(siteUrl) {
  const entries = await fs.readdir(BLOG_CONTENT_DIR, { withFileTypes: true });
  const blogFiles = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  const posts = await Promise.all(
    blogFiles.map(async (entry) => {
      const fullPath = path.join(BLOG_CONTENT_DIR, entry.name);
      const slug = entry.name.replace(/\.md$/i, "");
      const raw = await fs.readFile(fullPath, "utf8");
      const stat = await fs.stat(fullPath);
      const { frontmatter, body } = parseFrontmatter(raw);
      const text = markdownToText(body);
      const wordCount = text.split(/\s+/).filter(Boolean).length;

      return {
        slug,
        url: `${siteUrl}/blogs/${slug}`,
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        publishedAt: toIsoStartOfDay(frontmatter.date),
        updatedAt: stat.mtime.toISOString(),
        tags: frontmatter.tags,
        coverImage: frontmatter.coverImage || null,
        youtubeUrl: frontmatter.youtubeUrl || null,
        wordCount,
        readingTimeMinutes: getReadingTimeMinutes(wordCount),
        excerpt: firstWords(text, 56),
        content: body,
        text,
      };
    }),
  );

  posts.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
  return posts;
}

async function main() {
  const siteUrl = normalizeSiteUrl(process.env.SITE_URL || process.env.NEXT_PUBLIC_SITE_URL);
  const generatedAt = new Date().toISOString();

  const aboutData = JSON.parse(await fs.readFile(ABOUT_CONTENT_FILE, "utf8"));
  const blogPosts = await readBlogPosts(siteUrl);

  const uniqueTags = [...new Set(blogPosts.flatMap((post) => post.tags))].sort((a, b) => a.localeCompare(b));

  const contentIndex = {
    generatedAt,
    site: {
      url: siteUrl,
      name: aboutData.profile.name,
      llms: {
        concise: `${siteUrl}/llms.txt`,
        full: `${siteUrl}/llms-full.txt`,
      },
    },
    stats: {
      blogCount: blogPosts.length,
      totalBlogWords: blogPosts.reduce((sum, post) => sum + post.wordCount, 0),
      tags: uniqueTags,
    },
    about: {
      profile: aboutData.profile,
      sections: aboutData.sections,
      text: flattenAboutText(aboutData),
    },
    blogs: blogPosts,
  };

  const llmsLines = [];
  llmsLines.push("# llms.txt");
  llmsLines.push("# Auto-generated by scripts/generate-llms-txt.mjs");
  llmsLines.push("");
  llmsLines.push(`Site: ${siteUrl}`);
  llmsLines.push(`Generated: ${generatedAt}`);
  llmsLines.push(`Primary Data Index: ${siteUrl}/seo/content-index.json`);
  llmsLines.push("");
  llmsLines.push("## About");
  llmsLines.push(`- Name: ${aboutData.profile.name}`);
  llmsLines.push(`- Summary: ${firstWords(flattenAboutText(aboutData), 80)}`);
  llmsLines.push("");
  llmsLines.push("## Latest Blogs");

  for (const post of blogPosts.slice(0, 10)) {
    llmsLines.push(`- ${post.title} (${post.date})`);
    llmsLines.push(`  URL: ${post.url}`);
    llmsLines.push(`  Tags: ${post.tags.join(", ") || "none"}`);
    llmsLines.push(`  Description: ${post.description}`);
    llmsLines.push(`  Excerpt: ${post.excerpt}`);
  }

  llmsLines.push("");
  llmsLines.push("## All Blog URLs");
  for (const post of blogPosts) {
    llmsLines.push(`- ${post.url}`);
  }

  llmsLines.push("");
  llmsLines.push("## Notes");
  llmsLines.push("- Rebuilt on every deployment via sync:content.");
  llmsLines.push("- Use /seo/content-index.json for structured full data.");

  const fullLines = [];
  fullLines.push("# llms-full.txt");
  fullLines.push("# Auto-generated by scripts/generate-llms-txt.mjs");
  fullLines.push("");
  fullLines.push(`Site: ${siteUrl}`);
  fullLines.push(`Generated: ${generatedAt}`);
  fullLines.push("");
  fullLines.push("## About (Full Text)");
  fullLines.push(flattenAboutText(aboutData));

  for (const post of blogPosts) {
    fullLines.push("");
    fullLines.push(`## Blog: ${post.title}`);
    fullLines.push(`URL: ${post.url}`);
    fullLines.push(`Published: ${post.date}`);
    fullLines.push(`Updated: ${post.updatedAt}`);
    fullLines.push(`Tags: ${post.tags.join(", ") || "none"}`);
    fullLines.push(`Description: ${post.description}`);
    fullLines.push("");
    fullLines.push(post.text);
  }

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.mkdir(SEO_DIR, { recursive: true });

  await Promise.all([
    fs.writeFile(OUTPUT_LLM_FILE, `${llmsLines.join("\n")}\n`, "utf8"),
    fs.writeFile(OUTPUT_LLM_FULL_FILE, `${fullLines.join("\n")}\n`, "utf8"),
    fs.writeFile(OUTPUT_CONTENT_INDEX_FILE, `${JSON.stringify(contentIndex, null, 2)}\n`, "utf8"),
    fs.writeFile(
      OUTPUT_BLOG_INDEX_FILE,
      `${JSON.stringify({ generatedAt, siteUrl, blogs: blogPosts.map((post) => ({ ...post })) }, null, 2)}\n`,
      "utf8",
    ),
    fs.writeFile(
      OUTPUT_ABOUT_INDEX_FILE,
      `${JSON.stringify(
        {
          generatedAt,
          siteUrl,
          about: {
            profile: aboutData.profile,
            sections: aboutData.sections,
            text: flattenAboutText(aboutData),
          },
        },
        null,
        2,
      )}\n`,
      "utf8",
    ),
  ]);

  console.log(
    `Updated ${path.relative(ROOT, OUTPUT_LLM_FILE)}, ${path.relative(ROOT, OUTPUT_LLM_FULL_FILE)}, and SEO indexes with ${blogPosts.length} blog post(s).`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});