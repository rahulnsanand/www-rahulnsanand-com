import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Projects",
  description: "Projects by Rahul NS Anand",
};

export default function ProjectsPage() {
  return (
    <section className="content-page">
      <h1 className="content-title">Projects</h1>
      <p className="content-copy">
        Selected work across AI tools, personal data systems, and clean product
        experiences.
      </p>
    </section>
  );
}
