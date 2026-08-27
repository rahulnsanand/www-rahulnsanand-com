import type { Metadata } from "next";
import { ProjectsShowcase } from "@/components/projects/projects-showcase";
import { serializeJsonLd } from "@/lib/json-ld";
import { getProjectsPageData, projectsPageCopy } from "@/lib/projects";
import { absoluteUrl, formatPageTitle } from "@/lib/site";

const canonical = absoluteUrl("/projects");

export const metadata: Metadata = {
  title: projectsPageCopy.meta.title,
  description: projectsPageCopy.meta.description,
  alternates: {
    canonical,
  },
  openGraph: {
    title: formatPageTitle(projectsPageCopy.meta.title),
    description: projectsPageCopy.meta.description,
    url: canonical,
    type: "website",
  },
};

export default async function ProjectsPage() {
  const { highlightedProjects, otherProjects } = await getProjectsPageData();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: formatPageTitle(projectsPageCopy.meta.title),
    url: canonical,
    description: projectsPageCopy.meta.description,
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
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(structuredData) }}
      />
      <ProjectsShowcase highlightedProjects={highlightedProjects} otherProjects={otherProjects} />
    </>
  );
}
