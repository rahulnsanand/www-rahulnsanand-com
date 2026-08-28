import homeData from "@/content/home.json";

export type HomeContent = {
  meta: {
    description: string;
  };
  footerAccent: string;
  backgroundWords: string[];
  titlePrefix: string;
  name: string;
  tldr: string;
  intro: string;
  ctaLabel: string;
  ctaHref: string;
};

export const homeContent = homeData as HomeContent;
