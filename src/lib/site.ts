import siteData from "@/content/site.json";

export type SiteNavItem = {
  label: string;
  href: string;
};

export type SiteContent = {
  name: string;
  shortName: string;
  url: string;
  defaultTitle: string;
  titleTemplate: string;
  defaultDescription: string;
  logoAlt: string;
  homeAriaLabel: string;
  nav: SiteNavItem[];
  footer: {
    licenseLabel: string;
    domainLabel: string;
  };
};

export const siteContent = siteData as SiteContent;

/** Site origin without a trailing slash, safe to concatenate with a route path. */
export const siteUrl = siteContent.url.replace(/\/$/, "");

/** Build an absolute canonical URL for a route path such as `/about`. */
export function absoluteUrl(pathname: string): string {
  return `${siteUrl}${pathname.startsWith("/") ? pathname : `/${pathname}`}`;
}

/** Apply the configured title template, e.g. `About` -> `About | Rahul NS Anand`. */
export function formatPageTitle(title: string): string {
  return siteContent.titleTemplate.replace("%s", title);
}
