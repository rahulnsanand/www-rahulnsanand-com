import type { Metadata } from "next";
import { ContactPageBody } from "@/components/contact/contact-page";
import { aboutContent } from "@/lib/about";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Contact Rahul NS Anand for collaborations, product engineering opportunities, and technical discussions.",
  alternates: {
    canonical: "https://www.rahulnsanand.com/contact",
  },
  openGraph: {
    title: "Contact | Rahul NS Anand",
    description:
      "Contact Rahul NS Anand for collaborations, product engineering opportunities, and technical discussions.",
    url: "https://www.rahulnsanand.com/contact",
    type: "website",
  },
};

export default function ContactPage() {
  return <ContactPageBody socialLinks={aboutContent.profile.socialLinks} />;
}
