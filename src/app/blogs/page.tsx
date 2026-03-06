import type { Metadata } from "next";
import { BlogDashboard } from "@/components/blog/blog-dashboard";
import { getAllBlogPostSummaries } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blogs",
  description:
    "Engineering notes by Rahul NS Anand, featuring the latest three posts and an archive of earlier writing.",
  alternates: {
    canonical: "https://www.rahulnsanand.com/blogs",
  },
  openGraph: {
    title: "Blogs | Rahul NS Anand",
    description:
      "Engineering notes by Rahul NS Anand, featuring the latest three posts and an archive of earlier writing.",
    url: "https://www.rahulnsanand.com/blogs",
    type: "website",
  },
};

export default async function BlogsPage() {
  const posts = await getAllBlogPostSummaries();
  return <BlogDashboard posts={posts} />;
}

