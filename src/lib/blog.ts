import { cache } from "react";
import { promises as fs } from "node:fs";
import path from "node:path";

const BLOG_CONTENT_DIR = path.join(process.cwd(), "src", "content", "blog");

type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  youtubeUrl?: string;
  coverImage?: string;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
  updatedAt: string;
};

function parseFrontmatter(raw: string): { frontmatter: BlogFrontmatter; body: string } {
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
  const frontmatter: Partial<BlogFrontmatter> = {};

  let activeArrayKey: keyof BlogFrontmatter | null = null;

  for (const line of lines) {
    if (!line.trim()) continue;

    const listItemMatch = line.match(/^\s*-\s+(.+)$/);
    if (listItemMatch && activeArrayKey === "tags") {
      const listItemValue = listItemMatch[1];
      if (!listItemValue) continue;
      if (!frontmatter.tags) frontmatter.tags = [];
      frontmatter.tags.push(listItemValue.trim().replace(/^["']|["']$/g, ""));
      continue;
    }

    const keyValueMatch = line.match(/^([a-zA-Z][a-zA-Z0-9_-]*):\s*(.*)$/);
    if (!keyValueMatch) {
      throw new Error(`Invalid frontmatter line: "${line}"`);
    }

    const keyName = keyValueMatch[1];
    const keyValue = keyValueMatch[2];
    if (!keyName || keyValue === undefined) {
      continue;
    }

    const key = keyName as keyof BlogFrontmatter;
    const value = keyValue.trim();
    activeArrayKey = null;

    if (key === "tags") {
      activeArrayKey = "tags";
      if (value) {
        frontmatter.tags = value
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean);
      } else {
        frontmatter.tags = [];
      }
      continue;
    }

    if (key === "title" || key === "description" || key === "date") {
      frontmatter[key] = value.replace(/^["']|["']$/g, "");
      continue;
    }

    if (key === "youtubeUrl" || key === "coverImage") {
      const cleaned = value.replace(/^["']|["']$/g, "");
      if (cleaned) {
        frontmatter[key] = cleaned;
      }
      continue;
    }
  }

  if (!frontmatter.title || !frontmatter.description || !frontmatter.date || !frontmatter.tags) {
    throw new Error("Frontmatter requires title, description, date, and tags.");
  }

  return {
    frontmatter: {
      title: frontmatter.title,
      description: frontmatter.description,
      date: frontmatter.date,
      tags: frontmatter.tags,
      youtubeUrl: frontmatter.youtubeUrl,
      coverImage: frontmatter.coverImage,
    },
    body: body.trim(),
  };
}

function getReadingTimeMinutes(content: string): number {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function isValidDate(dateString: string): boolean {
  return !Number.isNaN(Date.parse(`${dateString}T00:00:00.000Z`));
}

export const getAllBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const directoryEntries = await fs.readdir(BLOG_CONTENT_DIR, { withFileTypes: true });
  const blogFiles = directoryEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));

  const blogPosts = await Promise.all(
    blogFiles.map(async (entry) => {
      const fullPath = path.join(BLOG_CONTENT_DIR, entry.name);
      const raw = await fs.readFile(fullPath, "utf8");
      const stat = await fs.stat(fullPath);
      const slug = entry.name.replace(/\.md$/i, "");
      const { frontmatter, body } = parseFrontmatter(raw);

      if (!isValidDate(frontmatter.date)) {
        throw new Error(`Invalid date "${frontmatter.date}" in ${entry.name}.`);
      }

      const wordCount = body.split(/\s+/).filter(Boolean).length;

      return {
        slug,
        ...frontmatter,
        content: body,
        wordCount,
        readingTimeMinutes: getReadingTimeMinutes(body),
        updatedAt: stat.mtime.toISOString(),
      } satisfies BlogPost;
    }),
  );

  blogPosts.sort((a, b) => Date.parse(`${b.date}T00:00:00.000Z`) - Date.parse(`${a.date}T00:00:00.000Z`));
  return blogPosts;
});

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const posts = await getAllBlogPosts();
  return posts.find((post) => post.slug === slug) ?? null;
}

export async function getTopRecentBlogPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.slice(0, limit);
}

export async function getEarlierBlogPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await getAllBlogPosts();
  return posts.slice(limit);
}

export { formatBlogDate } from "@/lib/blog-shared";
