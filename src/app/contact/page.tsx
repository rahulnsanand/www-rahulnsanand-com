import type { Metadata } from "next";
import { ContactPageBody } from "@/components/contact/contact-page";
import { aboutContent } from "@/lib/about";
import { contactContent } from "@/lib/contact-content";
import { absoluteUrl, formatPageTitle } from "@/lib/site";

const canonical = absoluteUrl("/contact");

export const metadata: Metadata = {
  title: contactContent.meta.title,
  description: contactContent.meta.description,
  alternates: {
    canonical,
  },
  openGraph: {
    title: formatPageTitle(contactContent.meta.title),
    description: contactContent.meta.description,
    url: canonical,
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactPageBody socialLinks={aboutContent.profile.socialLinks} />;
}
