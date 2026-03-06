import projectsConfig from "@/content/projects.json";

export type CardClickTarget = "github" | "website";

export type ProjectLinks = {
  githubUrl: string;
  websiteUrl: string | null;
  youtubeUrl: string | null;
  blogUrl: string | null;
};

export type GithubProject = {
  id: string;
  owner: string;
  fullName: string;
  name: string;
  displayTitle: string;
  description: string | null;
  htmlUrl: string;
  homepage: string | null;
  previewImageUrl: string;
  stars: number;
  language: string | null;
  updatedAt: string;
  fork: boolean;
  archived: boolean;
  links: ProjectLinks;
  cardClickTarget: CardClickTarget;
  cardClickUrl: string;
};

export type HighlightProject = GithubProject & {
  demoGifUrl: string | null;
};

type ProjectsPageData = {
  highlightedProjects: HighlightProject[];
  otherProjects: GithubProject[];
};

type ProjectConfig = {
  repo?: unknown;
  title?: unknown;
  description?: unknown;
  imageUrl?: unknown;
  demoGifUrl?: unknown;
  websiteUrl?: unknown;
  githubUrl?: unknown;
  youtubeUrl?: unknown;
  blogUrl?: unknown;
  language?: unknown;
  updatedAt?: unknown;
  cardClickTarget?: unknown;
};

const CONFIG_RECORD = projectsConfig as Record<string, unknown>;
const PLACEHOLDER_IMAGE_URL = "/projects/project-placeholder.svg";
const DEFAULT_UPDATED_AT = "2026-03-06T00:00:00.000Z";
const REPO_REFERENCE_REGEX = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const DEFAULT_CARD_CLICK_TARGET: CardClickTarget = "github";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeText(value: unknown, maxLength = 240): string {
  return String(value ?? "").trim().slice(0, maxLength);
}

function sanitizeExternalUrl(value: unknown): string | null {
  const normalized = normalizeText(value, 2000);
  if (!normalized) return null;

  try {
    const parsed = new URL(normalized);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;
    return parsed.toString();
  } catch {
    return null;
  }
}

function sanitizeImageUrl(value: unknown): string {
  const normalized = normalizeText(value, 2000);
  if (normalized.startsWith("/")) {
    return normalized;
  }

  return sanitizeExternalUrl(normalized) ?? PLACEHOLDER_IMAGE_URL;
}

function toDisplayTitle(repoName: string): string {
  return repoName
    .replaceAll(/[-_]+/g, " ")
    .replaceAll(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function parseRepo(value: unknown): { owner: string; name: string; fullName: string } | null {
  const repo = normalizeText(value, 180);
  if (!REPO_REFERENCE_REGEX.test(repo)) return null;

  const [owner, name] = repo.split("/", 2);
  if (!owner || !name) return null;

  return { owner, name, fullName: `${owner}/${name}` };
}

function parseProjectConfig(item: unknown): ProjectConfig | null {
  if (typeof item === "string") {
    const repo = normalizeText(item, 180);
    if (!repo) return null;
    return { repo };
  }

  if (!isRecord(item)) return null;
  return item as ProjectConfig;
}

function parseCardClickTarget(value: unknown): CardClickTarget | null {
  const target = normalizeText(value, 20).toLowerCase();
  if (target === "github" || target === "website") {
    return target;
  }
  return null;
}

const configuredDefaultCardClickTarget =
  parseCardClickTarget(CONFIG_RECORD.defaultCardClickTarget) ?? DEFAULT_CARD_CLICK_TARGET;

function resolveCardClick(params: {
  preferredTarget: CardClickTarget;
  githubUrl: string;
  websiteUrl: string | null;
}): { target: CardClickTarget; url: string } {
  if (params.preferredTarget === "website" && params.websiteUrl) {
    return { target: "website", url: params.websiteUrl };
  }

  return { target: "github", url: params.githubUrl };
}

function toProjectBase(item: unknown): GithubProject | null {
  const config = parseProjectConfig(item);
  if (!config) return null;

  const repoInfo = parseRepo(config.repo);
  if (!repoInfo) return null;

  const title = normalizeText(config.title, 160) || toDisplayTitle(repoInfo.name);
  const description = normalizeText(config.description, 400) || "Open-source project by Rahul NS Anand.";
  const githubUrl = sanitizeExternalUrl(config.githubUrl) ?? `https://github.com/${repoInfo.fullName}`;
  const websiteUrl = sanitizeExternalUrl(config.websiteUrl);
  const youtubeUrl = sanitizeExternalUrl(config.youtubeUrl);
  const blogUrl = sanitizeExternalUrl(config.blogUrl);
  const language = normalizeText(config.language, 80) || null;
  const updatedAt = normalizeText(config.updatedAt, 40) || DEFAULT_UPDATED_AT;
  const preferredCardClickTarget = parseCardClickTarget(config.cardClickTarget) ?? configuredDefaultCardClickTarget;
  const cardClick = resolveCardClick({
    preferredTarget: preferredCardClickTarget,
    githubUrl,
    websiteUrl,
  });

  return {
    id: repoInfo.fullName.toLowerCase(),
    owner: repoInfo.owner,
    fullName: repoInfo.fullName,
    name: repoInfo.name,
    displayTitle: title,
    description,
    htmlUrl: githubUrl,
    homepage: websiteUrl,
    previewImageUrl: sanitizeImageUrl(config.imageUrl),
    stars: 0,
    language,
    updatedAt,
    fork: false,
    archived: false,
    cardClickTarget: cardClick.target,
    cardClickUrl: cardClick.url,
    links: {
      githubUrl,
      websiteUrl,
      youtubeUrl,
      blogUrl,
    },
  };
}

function toHighlightedProject(item: unknown): HighlightProject | null {
  const config = parseProjectConfig(item);
  if (!config) return null;

  const base = toProjectBase(config);
  if (!base) return null;

  const demoGifUrl = sanitizeExternalUrl(config.demoGifUrl) ?? null;

  return {
    ...base,
    demoGifUrl,
  };
}

function readList(key: "highlightedProjects" | "otherProjects"): unknown[] {
  const raw = CONFIG_RECORD[key];
  return Array.isArray(raw) ? raw : [];
}

export async function getProjectsPageData(): Promise<ProjectsPageData> {
  const highlightedProjects = readList("highlightedProjects")
    .map(toHighlightedProject)
    .filter((project): project is HighlightProject => project !== null);

  const highlightedIds = new Set(highlightedProjects.map((project) => project.id));

  const otherProjects = readList("otherProjects")
    .map(toProjectBase)
    .filter((project): project is GithubProject => project !== null)
    .filter((project) => !highlightedIds.has(project.id));

  return {
    highlightedProjects,
    otherProjects,
  };
}
