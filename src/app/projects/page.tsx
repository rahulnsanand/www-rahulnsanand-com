import type { Metadata } from "next";
import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { getProjectsPageData } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Highlighted and supporting repositories by Rahul NS Anand, spanning frontend systems, tools, and experiments.",
  alternates: {
    canonical: "https://www.rahulnsanand.com/projects",
  },
  openGraph: {
    title: "Projects | Rahul NS Anand",
    description:
      "Highlighted and supporting repositories by Rahul NS Anand, spanning frontend systems, tools, and experiments.",
    url: "https://www.rahulnsanand.com/projects",
    type: "website",
  },
};

export default async function ProjectsPage() {
  const { highlightedProjects, otherProjects } = await getProjectsPageData();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Projects | Rahul NS Anand",
    url: "https://www.rahulnsanand.com/projects",
    description:
      "Highlighted and supporting repositories by Rahul NS Anand, spanning frontend systems, tools, and experiments.",
    hasPart: highlightedProjects.map((project) => ({
      "@type": "SoftwareSourceCode",
      name: project.name,
      codeRepository: project.htmlUrl,
      programmingLanguage: project.language ?? undefined,
      description: project.description ?? undefined,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <ProjectsShowcase highlightedProjects={highlightedProjects} otherProjects={otherProjects} />
    </>
  );
}
