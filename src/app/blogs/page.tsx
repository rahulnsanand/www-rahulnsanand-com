import type { Metadata } from "next";
import { ContentPage } from "@/components/content/content-page";

export const metadata: Metadata = {
  title: "Blogs",
  description: "Blogs by Rahul NS Anand",
};

export default function BlogsPage() {
  return (
    <ContentPage
      title={'System.out.println("ideas")'}
      accentText={'System.out.println("ideas")'}
      copy="Writing on engineering, systems design, and practical AI product development."
    />
  );
}
