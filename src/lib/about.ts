import aboutData from "@/content/about.json";

export type AboutLink = {
  href: string;
  label: string;
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
    avatarUrl: string;
    primaryLinks: AboutLink[];
  };
  sections: ResumeSection[];
};

export const aboutContent = aboutData as AboutContent;