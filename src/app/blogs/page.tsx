import type { Metadata } from "next";
import { BlogDashboard } from "@/components/blog/blog-dashboard";
import { getAllBlogPostSummaries } from "@/lib/blog";
import { blogsPageContent } from "@/lib/blogs-page";
import { absoluteUrl, formatPageTitle } from "@/lib/site";

const canonical = absoluteUrl("/blogs");

export const metadata: Metadata = {
  title: blogsPageContent.meta.title,
  description: blogsPageContent.meta.description,
  alternates: {
    canonical,
  },
  openGraph: {
    title: formatPageTitle(blogsPageContent.meta.title),
    description: blogsPageContent.meta.description,
    url: canonical,
    type: "website",
  },
};

export default async function BlogsPage() {
  const posts = await getAllBlogPostSummaries();
  return <BlogDashboard posts={posts} />;
}
