import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "About",
  description: "About Rahul NS Anand",
};

export default function AboutPage() {
  return (
    <ContentPage
      title="About"
      copy="I build software products focused on clarity, usability, and long-term maintainability."
    />
  );
}
