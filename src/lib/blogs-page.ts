import blogsPageData from "@/content/blogs-page.json";

export type BlogsPageContent = {
  meta: {
    title: string;
    description: string;
  };
  footerAccent: string;
  srTitle: string;
  searchPlaceholder: string;
  searchAriaLabel: string;
  recentHeading: string;
  previousHeading: string;
  searchResultsHeading: string;
  emptyState: string;
  loadMoreLabel: string;
  readMoreLabel: string;
  noPreviewLabel: string;
  authorName: string;
  post: {
    footerAccent: string;
    backLabel: string;
    notFoundTitle: string;
  };
};

export const blogsPageContent = blogsPageData as BlogsPageContent;
