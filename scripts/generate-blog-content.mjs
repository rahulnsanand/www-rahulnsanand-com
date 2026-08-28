import { promises as fs } from "node:fs";
import path from "node:path";
import { parseFrontmatter, readString, readStringList } from "./lib/frontmatter.mjs";

const ROOT = process.cwd();
const BLOG_CONTENT_DIR = path.join(ROOT, "src", "content", "blog");
const OUTPUT_FILE = path.join(ROOT, "src", "content", "blog-posts.generated.json");

const OPTIONAL_STRING_KEYS = ["youtubeUrl", "coverImage", "mediumUrl", "devtoUrl"];

function readPostFrontmatter(raw) {
  const { frontmatter, body } = parseFrontmatter(raw);

  const title = readString(frontmatter, "title");
  const description = readString(frontmatter, "description");
  const date = readString(frontmatter, "date");

  if (!title || !description || !date) {
    throw new Error("Front matter requires title, description, and date.");
  }

  const post = { title, description, date, tags: readStringList(frontmatter, "tags") };

  for (const key of OPTIONAL_STRING_KEYS) {
    const value = readString(frontmatter, key);
    if (value) post[key] = value;
  }

  return { frontmatter: post, body: body.trim() };
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
      const { frontmatter, body } = readPostFrontmatter(raw);

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
        mediumUrl: frontmatter.mediumUrl ?? undefined,
        devtoUrl: frontmatter.devtoUrl ?? undefined,
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
