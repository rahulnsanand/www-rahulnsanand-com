import { promises as fs } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BLOG_CONTENT_DIR = path.join(ROOT, "src", "content", "blog");
const OUTPUT_FILE = path.join(ROOT, "src", "content", "blog-posts.generated.json");

function parseFrontmatter(raw) {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    throw new Error("Missing or invalid frontmatter block.");
  }

  const frontmatterRaw = match[1];
  const body = match[2];
  if (frontmatterRaw === undefined || body === undefined) {
    throw new Error("Frontmatter capture groups are invalid.");
  }

  const lines = frontmatterRaw.split(/\r?\n/);
  const frontmatter = {};
  let activeArrayKey = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const listItemMatch = line.match(/^\s*-\s+(.+)$/);
    if (listItemMatch && activeArrayKey === "tags") {
      const listItemValue = listItemMatch[1];
      if (!listItemValue) continue;
      if (!Array.isArray(frontmatter.tags)) frontmatter.tags = [];
      frontmatter.tags.push(listItemValue.trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    const keyValueMatch = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!keyValueMatch) {
      throw new Error(`Invalid frontmatter line: "${line}"`);
    }

    const key = keyValueMatch[1];
    const value = keyValueMatch[2]?.trim();
    if (!key || value === undefined) continue;
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

    if (key === "title" || key === "description" || key === "date" || key === "youtubeUrl" || key === "coverImage") {
      const cleaned = value.replace(/^["']|["']$/g, "");
      if (cleaned) {
        frontmatter[key] = cleaned;
      }
      continue;
    }
  }

  if (!frontmatter.title || !frontmatter.description || !frontmatter.date || !Array.isArray(frontmatter.tags)) {
    throw new Error("Frontmatter requires title, description, date, and tags.");
  }

  return { frontmatter, body: body.trim() };
}

function getReadingTimeMinutes(content) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function isValidDate(dateString) {
  return !Number.isNaN(Date.parse(`${dateString}T00:00:00.000Z`));
}

async function main() {
  const entries = await fs.readdir(BLOG_CONTENT_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  const posts = await Promise.all(
    files.map(async (entry) => {
      const fullPath = path.join(BLOG_CONTENT_DIR, entry.name);
      const raw = await fs.readFile(fullPath, "utf8");
      const stat = await fs.stat(fullPath);
      const { frontmatter, body } = parseFrontmatter(raw);

      if (!isValidDate(frontmatter.date)) {
        throw new Error(`Invalid date "${frontmatter.date}" in ${entry.name}.`);
      }

      const slug = entry.name.replace(/\.md$/i, "");
      const wordCount = body.split(/\s+/).filter(Boolean).length;

      return {
        slug,
        title: frontmatter.title,
        description: frontmatter.description,
        date: frontmatter.date,
        tags: frontmatter.tags,
        youtubeUrl: frontmatter.youtubeUrl ?? undefined,
        coverImage: frontmatter.coverImage ?? undefined,
        content: body,
        wordCount,
        readingTimeMinutes: getReadingTimeMinutes(body),
        updatedAt: stat.mtime.toISOString(),
      };
    }),
  );

  posts.sort((a, b) => Date.parse(`${b.date}T00:00:00.000Z`) - Date.parse(`${a.date}T00:00:00.000Z`));

  await fs.writeFile(OUTPUT_FILE, `${JSON.stringify(posts, null, 2)}\n`, "utf8");
  console.log(`Updated ${path.relative(ROOT, OUTPUT_FILE)} with ${posts.length} post(s).`);
}

main().catch((error) => {
  console.error("Failed to generate blog content index.", error);
  process.exitCode = 1;
});
