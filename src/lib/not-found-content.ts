import notFoundData from "@/content/not-found.json";

export type NotFoundLinkIcon = "house" | "compass" | "arrow-left" | "arrow-up-right" | "envelope";

export type NotFoundLink = {
  label: string;
  href: string;
  icon: NotFoundLinkIcon;
};

export type NotFoundContent = {
  backgroundCode: string;
  kicker: string;
  title: string;
  copy: string;
  pillLabel: string;
  pillCode: string;
  links: NotFoundLink[];
};

export const notFoundContent = notFoundData as NotFoundContent;
