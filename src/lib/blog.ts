import { cache } from "react";
import generatedBlogPosts from "@/content/blog-posts.generated.json";

type BlogFrontmatter = {
  title: string;
  description: string;
  date: string;
  tags: string[];
  youtubeUrl?: string;
  coverImage?: string;
  mediumUrl?: string;
  devtoUrl?: string;
};

export type BlogPost = BlogFrontmatter & {
  slug: string;
  content: string;
  wordCount: number;
  readingTimeMinutes: number;
  updatedAt: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

function asStringArray(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const tags = value.filter((tag): tag is string => typeof tag === "string").map((tag) => tag.trim()).filter(Boolean);
  return tags;
}

function toBlogPost(value: unknown): BlogPost | null {
  if (!isRecord(value)) return null;

  const slug = asString(value.slug);
  const title = asString(value.title);
  const description = asString(value.description);
  const date = asString(value.date);
  const tags = asStringArray(value.tags);
  const content = asString(value.content);
  const wordCount = typeof value.wordCount === "number" ? value.wordCount : null;
  const readingTimeMinutes = typeof value.readingTimeMinutes === "number" ? value.readingTimeMinutes : null;
  const updatedAt = asString(value.updatedAt);
  const youtubeUrl = asString(value.youtubeUrl) ?? undefined;
  const coverImage = asString(value.coverImage) ?? undefined;
  const mediumUrl = asString(value.mediumUrl) ?? undefined;
  const devtoUrl = asString(value.devtoUrl) ?? undefined;

  if (!slug || !title || !description || !date || !tags || !content || !wordCount || !readingTimeMinutes || !updatedAt) {
    return null;
  }

  return {
    slug,
    title,
    description,
    date,
    tags,
    youtubeUrl,
    coverImage,
    mediumUrl,
    devtoUrl,
    content,
    wordCount,
    readingTimeMinutes,
    updatedAt,
  };
}

export const getAllBlogPosts = cache(async (): Promise<BlogPost[]> => {
  const source = Array.isArray(generatedBlogPosts) ? generatedBlogPosts : [];
  return source
    .map(toBlogPost)
    .filter((post): post is BlogPost => post !== null);
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
