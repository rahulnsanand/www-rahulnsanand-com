import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Rahul NS Anand",
};

export default function ProjectsPage() {
  return (
    <ContentPage
      title="src/deployed"
      accentText="src/deployed"
      copy="Selected work across AI tools, personal data systems, and clean product experiences."
    />
  );
}
