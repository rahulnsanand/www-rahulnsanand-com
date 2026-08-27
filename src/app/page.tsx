import type { Metadata } from "next";
import { Homepage } from "@/components/home/homepage";
import { homeContent } from "@/lib/home";
import { absoluteUrl, siteContent } from "@/lib/site";

const canonical = absoluteUrl("/");

export const metadata: Metadata = {
  description: homeContent.meta.description,
  alternates: {
    canonical,
  },
  openGraph: {
    title: siteContent.defaultTitle,
    description: homeContent.meta.description,
    url: canonical,
    type: "website",
  },
};

export default function Home() {
  return <Homepage />;
}
