import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "About Rahul NS Anand",
};

export default function AboutPage() {
  return (
    <section className="content-page">
      <h1 className="content-title">About</h1>
      <p className="content-copy">
        I build software products focused on clarity, usability, and long-term
        maintainability.
      </p>
    </section>
  );
}
