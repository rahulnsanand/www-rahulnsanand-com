import projectsConfig from "@/content/projects.json";

export type GithubProject = {
  id: number;
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
};

export type HighlightProject = GithubProject & {
  demoGifUrl: string | null;
};

type ProjectsPageData = {
  highlightedProjects: HighlightProject[];
  otherProjects: GithubProject[];
};

type ProjectItemConfig = {
  repo: string;
  demoGifUrl?: string;
  description?: string;
  websiteUrl?: string;
  imageUrl?: string;
  title?: string;
};

const DEFAULT_OWNER = "rahulnsanand";
const CONFIG_RECORD = projectsConfig as Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
}

const configuredOwners = (() => {
  const fromOwners = toStringArray(CONFIG_RECORD["githubOwners"]);
  if (fromOwners.length > 0) {
    return Array.from(new Set(fromOwners));
  }

  const maybeUsername = CONFIG_RECORD["githubUsername"];
  if (typeof maybeUsername === "string" && maybeUsername.trim().length > 0) {
    return [maybeUsername.trim()];
  }

  return [DEFAULT_OWNER];
})();

const primaryOwner = configuredOwners[0] ?? DEFAULT_OWNER;

function parseProjectItemConfig(item: unknown): ProjectItemConfig | null {
  if (typeof item === "string" && item.trim().length > 0) {
    return { repo: item.trim() };
  }

  if (!isRecord(item)) return null;
  const repo = item["repo"];
  if (typeof repo !== "string" || repo.trim().length === 0) return null;

  const demoGifUrl = item["demoGifUrl"];
  const description = item["description"];
  const websiteUrl = item["websiteUrl"];
  const imageUrl = item["imageUrl"];
  const title = item["title"];

  return {
    repo: repo.trim(),
    demoGifUrl: typeof demoGifUrl === "string" ? demoGifUrl.trim() : undefined,
    description: typeof description === "string" ? description.trim() : undefined,
    websiteUrl: typeof websiteUrl === "string" ? websiteUrl.trim() : undefined,
    imageUrl: typeof imageUrl === "string" ? imageUrl.trim() : undefined,
    title: typeof title === "string" ? title.trim() : undefined,
  };
}

const configuredHighlights: ProjectItemConfig[] = Array.isArray(CONFIG_RECORD["highlightedProjects"])
  ? CONFIG_RECORD["highlightedProjects"].flatMap((item) => {
      const parsed = parseProjectItemConfig(item);
      return parsed ? [parsed] : [];
    })
  : [];

const configuredOtherProjects: ProjectItemConfig[] = Array.isArray(CONFIG_RECORD["otherProjects"])
  ? CONFIG_RECORD["otherProjects"].flatMap((item) => {
      const parsed = parseProjectItemConfig(item);
      return parsed ? [parsed] : [];
    })
  : [];

function parseRepoReference(value: string, fallbackOwner: string): { owner: string; repo: string; key: string } {
  const normalized = value.trim();
  if (normalized.includes("/")) {
    const [ownerPart, repoPart] = normalized.split("/");
    const owner = ownerPart?.trim() || fallbackOwner;
    const repo = repoPart?.trim() || normalized;
    return {
      owner,
      repo,
      key: `${owner}/${repo}`,
    };
  }

  return {
    owner: fallbackOwner,
    repo: normalized,
    key: `${fallbackOwner}/${normalized}`,
  };
}

function getGithubReposEndpoint(owner: string): string {
  return `https://api.github.com/users/${owner}/repos?per_page=100&sort=updated`;
}

function getPosterImageUrl(owner: string, repoName: string): string {
  const cacheKey = `${owner}-${repoName}-showcase`;
  return `https://opengraph.githubassets.com/${cacheKey}/${owner}/${repoName}`;
}

function toProject(repo: unknown): GithubProject | null {
  if (!isRecord(repo)) return null;

  const id = repo["id"];
  const name = repo["name"];
  const fullName = repo["full_name"];
  const htmlUrl = repo["html_url"];
  const description = repo["description"];
  const stars = repo["stargazers_count"];
  const language = repo["language"];
  const updatedAt = repo["updated_at"];
  const fork = repo["fork"];
  const archived = repo["archived"];
  const homepage = repo["homepage"];
  const ownerRecord = repo["owner"];
  const owner = isRecord(ownerRecord) && typeof ownerRecord["login"] === "string" ? ownerRecord["login"] : null;

  if (
    typeof id !== "number" ||
    typeof name !== "string" ||
    typeof fullName !== "string" ||
    typeof htmlUrl !== "string" ||
    typeof stars !== "number" ||
    typeof updatedAt !== "string" ||
    typeof fork !== "boolean" ||
    typeof archived !== "boolean" ||
    typeof owner !== "string"
  ) {
    return null;
  }

  return {
    id,
    owner,
    fullName,
    name,
    displayTitle: fullName,
    description: typeof description === "string" ? description : null,
    htmlUrl,
    homepage: typeof homepage === "string" && homepage.trim().length > 0 ? homepage.trim() : null,
    previewImageUrl: getPosterImageUrl(owner, name),
    stars,
    language: typeof language === "string" ? language : null,
    updatedAt,
    fork,
    archived,
  };
}

function byRecency(a: GithubProject, b: GithubProject): number {
  return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
}

function applyProjectOverrides(project: GithubProject, overrides: ProjectItemConfig): GithubProject {
  const titleOverride =
    typeof overrides.title === "string" && overrides.title.trim().length > 0
      ? overrides.title.trim()
      : project.displayTitle;
  const descriptionOverride =
    typeof overrides.description === "string" && overrides.description.trim().length > 0
      ? overrides.description.trim()
      : project.description;
  const imageOverride =
    typeof overrides.imageUrl === "string" && overrides.imageUrl.trim().length > 0
      ? overrides.imageUrl.trim()
      : project.previewImageUrl;
  const websiteOverride =
    typeof overrides.websiteUrl === "string"
      ? overrides.websiteUrl.trim().length > 0
        ? overrides.websiteUrl.trim()
        : null
      : project.homepage;

  return {
    ...project,
    displayTitle: titleOverride,
    description: descriptionOverride,
    previewImageUrl: imageOverride,
    homepage: websiteOverride,
  };
}

function buildProjectIndexes(allProjects: GithubProject[]) {
  const byFullName = new Map<string, GithubProject>();
  const byOwnerAndName = new Map<string, GithubProject>();

  for (const project of allProjects) {
    byFullName.set(project.fullName.toLowerCase(), project);
    byOwnerAndName.set(`${project.owner}/${project.name}`.toLowerCase(), project);
  }

  return { byFullName, byOwnerAndName };
}

function buildHighlightedProjects(allProjects: GithubProject[]): HighlightProject[] {
  const { byFullName, byOwnerAndName } = buildProjectIndexes(allProjects);
  const usedIds = new Set<number>();

  return configuredHighlights.flatMap((entryConfig) => {
    const parsed = parseRepoReference(entryConfig.repo, primaryOwner);
    const key = parsed.key.toLowerCase();

    const project = byFullName.get(key) ?? byOwnerAndName.get(key);
    if (!project || usedIds.has(project.id)) {
      return [];
    }

    usedIds.add(project.id);

    return [
      {
        ...applyProjectOverrides(project, entryConfig),
        demoGifUrl:
          entryConfig.demoGifUrl && entryConfig.demoGifUrl.length > 0 ? entryConfig.demoGifUrl : null,
      },
    ];
  });
}

function buildOtherProjects(allProjects: GithubProject[], highlightedProjects: HighlightProject[]): GithubProject[] {
  const highlightedIds = new Set(highlightedProjects.map((project) => project.id));
  const { byFullName, byOwnerAndName } = buildProjectIndexes(allProjects);

  if (configuredOtherProjects.length > 0) {
    const usedIds = new Set<number>();

    return configuredOtherProjects.flatMap((projectConfig) => {
      const parsed = parseRepoReference(projectConfig.repo, primaryOwner);
      const key = parsed.key.toLowerCase();
      const project = byFullName.get(key) ?? byOwnerAndName.get(key);

      if (!project || highlightedIds.has(project.id) || usedIds.has(project.id)) {
        return [];
      }

      usedIds.add(project.id);
      return [applyProjectOverrides(project, projectConfig)];
    });
  }

  return allProjects
    .filter((project) => !highlightedIds.has(project.id))
    .sort(byRecency);
}

async function fetchOwnerRepos(owner: string): Promise<GithubProject[]> {
  const response = await fetch(getGithubReposEndpoint(owner), {
    next: { revalidate: 60 * 60 },
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    return [];
  }

  const payload: unknown = await response.json();
  if (!Array.isArray(payload)) {
    return [];
  }

  return payload
    .map(toProject)
    .filter((project): project is GithubProject => project !== null)
    .filter((project) => !project.archived);
}

export async function getProjectsPageData(): Promise<ProjectsPageData> {
  try {
    const ownerRepoLists = await Promise.all(configuredOwners.map((owner) => fetchOwnerRepos(owner)));

    const dedupedById = new Map<number, GithubProject>();
    for (const repoList of ownerRepoLists) {
      for (const project of repoList) {
        dedupedById.set(project.id, project);
      }
    }

    const projects = Array.from(dedupedById.values());
    const highlightedProjects = buildHighlightedProjects(projects);
    const otherProjects = buildOtherProjects(projects, highlightedProjects);

    return {
      highlightedProjects,
      otherProjects,
    };
  } catch {
    return {
      highlightedProjects: [],
      otherProjects: [],
    };
  }
}
