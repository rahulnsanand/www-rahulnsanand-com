import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Rahul NS Anand",
};

export default function ContactPage() {
  return (
    <section className="content-page">
      <h1 className="content-title">Contact</h1>
      <p className="content-copy">
        Reach out for collaborations, product engineering work, or discussions
        around AI and design-led software.
      </p>
    </section>
  );
}
