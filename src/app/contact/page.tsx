import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Rahul NS Anand",
};

export default function ContactPage() {
  return (
    <ContentPage
      title="Contact"
      copy="Reach out for collaborations, product engineering work, or discussions around AI and design-led software."
    />
  );
}
