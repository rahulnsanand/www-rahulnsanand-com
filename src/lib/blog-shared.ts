export type BlogMediaFields = {
  coverImage?: string;
  youtubeUrl?: string;
};

export function formatBlogDate(date: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00.000Z`));
}

export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./i, "");

    if (host === "youtu.be") {
      const slug = parsed.pathname.split("/").filter(Boolean)[0];
      return slug && slug.length >= 6 ? slug : null;
    }

    if (host === "youtube.com" || host === "m.youtube.com") {
      const v = parsed.searchParams.get("v");
      if (v) return v;

      const pathSegments = parsed.pathname.split("/").filter(Boolean);
      if (pathSegments[0] === "shorts" || pathSegments[0] === "embed") {
        return pathSegments[1] ?? null;
      }
    }

    return null;
  } catch {
    return null;
  }
}

export function getYouTubeThumbnail(url: string): string | null {
  const videoId = parseYouTubeVideoId(url);
  if (!videoId) return null;
  return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
}

export function getBlogMediaImage(post: BlogMediaFields): string | null {
  if (post.coverImage) return post.coverImage;
  if (post.youtubeUrl) return getYouTubeThumbnail(post.youtubeUrl);
  return null;
}
