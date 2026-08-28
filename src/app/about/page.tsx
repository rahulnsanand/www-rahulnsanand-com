import type { Metadata } from "next";
import { AboutBody } from "./about-body";
import { aboutContent } from "@/lib/about";
import { absoluteUrl, formatPageTitle } from "@/lib/site";

const canonical = absoluteUrl("/about");

export const metadata: Metadata = {
  title: aboutContent.meta.title,
  description: aboutContent.meta.description,
  alternates: {
    canonical,
  },
  openGraph: {
    title: formatPageTitle(aboutContent.meta.title),
    description: aboutContent.meta.description,
    url: canonical,
    type: "profile",
  },
};

export default function AboutPage() {
  return <AboutBody />;
}
