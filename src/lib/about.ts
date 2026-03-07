import aboutData from "@/content/about.json";

export type AboutLink = {
  href: string;
  label: string;
};

export type AboutSocialIcon = "github" | "youtube" | "linkedin" | "medium" | "devto" | "leetcode";

export type AboutSocialLink = AboutLink & {
  icon: AboutSocialIcon;
};

export type ResumeNode = {
  id: string;
  title: string;
  role: string;
  period: string;
  bullets: string[];
};

export type ResumeGroup = {
  id: string;
  heading?: string;
  items: ResumeNode[];
};

export type ResumeSection = {
  id: string;
  heading: string;
  groups: ResumeGroup[];
};

export type AboutContent = {
  profile: {
    name: string;
    headline: string;
    avatarUrl: string;
    socialLinks: AboutSocialLink[];
    primaryLinks: AboutLink[];
  };
  sections: ResumeSection[];
};

type ResumeNodeSource = Omit<ResumeNode, "id">;
type ResumeGroupSource = Omit<ResumeGroup, "id" | "items"> & {
  items: ResumeNodeSource[];
};
type ResumeSectionSource = Omit<ResumeSection, "id" | "groups"> & {
  groups: ResumeGroupSource[];
};
type AboutContentSource = Omit<AboutContent, "sections"> & {
  sections: ResumeSectionSource[];
};

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function createUniqueId(seed: string, seen: Map<string, number>): string {
  const normalizedSeed = slugify(seed) || "item";
  const count = (seen.get(normalizedSeed) ?? 0) + 1;
  seen.set(normalizedSeed, count);
  return count === 1 ? normalizedSeed : `${normalizedSeed}-${count}`;
}

function buildSections(sections: ResumeSectionSource[]): ResumeSection[] {
  const sectionIds = new Map<string, number>();

  return sections.map((section, sectionIndex) => {
    const sectionId = createUniqueId(section.heading || `section-${sectionIndex + 1}`, sectionIds);
    const groupIds = new Map<string, number>();

    return {
      ...section,
      id: sectionId,
      groups: section.groups.map((group, groupIndex) => {
        const groupId = createUniqueId(group.heading || `group-${groupIndex + 1}`, groupIds);
        const itemIds = new Map<string, number>();

        return {
          ...group,
          id: groupId,
          items: group.items.map((item, itemIndex) => ({
            ...item,
            id: createUniqueId(item.title || `item-${itemIndex + 1}`, itemIds),
          })),
        };
      }),
    };
  });
}

const aboutSource = aboutData as AboutContentSource;

export const aboutContent: AboutContent = {
  ...aboutSource,
  sections: buildSections(aboutSource.sections),
};
