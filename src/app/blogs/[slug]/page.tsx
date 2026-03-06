import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { FooterAccentText } from "@/components/layout/site-footer-accent";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { BlogScrollTopButton } from "@/components/blog/blog-scroll-top-button";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import { formatBlogDate, getBlogMediaImage, parseYouTubeVideoId } from "@/lib/blog-shared";

type BlogPostPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Blog not found",
    };
  }

  const url = `https://www.rahulnsanand.com/blogs/${post.slug}`;
  const socialImage = getBlogMediaImage(post);
  const imageUrl = socialImage
    ? socialImage.startsWith("http")
      ? socialImage
      : `https://www.rahulnsanand.com${socialImage}`
    : undefined;

  return {
    title: post.title,
    description: post.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${post.title} | Rahul NS Anand`,
      description: post.description,
      url,
      type: "article",
      publishedTime: `${post.date}T00:00:00.000Z`,
      modifiedTime: post.updatedAt,
      tags: post.tags,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} | Rahul NS Anand`,
      description: post.description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const mediaImage = getBlogMediaImage(post);
  const youtubeVideoId = post.youtubeUrl ? parseYouTubeVideoId(post.youtubeUrl) : null;
  const blogPostingSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: `${post.date}T00:00:00.000Z`,
    dateModified: post.updatedAt,
    author: {
      "@type": "Person",
      name: "Rahul NS Anand",
      url: "https://www.rahulnsanand.com",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://www.rahulnsanand.com/blogs/${post.slug}`,
    },
    keywords: post.tags.join(", "),
    wordCount: post.wordCount,
    image: mediaImage ?? undefined,
  };

  return (
    <article className="blog-post-page" aria-labelledby="blog-post-title">
      <FooterAccentText text="read()" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />

      <Link href="/blogs" className="blog-post-back-link">
        <ArrowLeft size={14} weight="duotone" aria-hidden="true" />
        <span>Back to blogs</span>
      </Link>

      <div className="blog-post-layout">
        <div className="blog-post-surface">
          {mediaImage || youtubeVideoId ? (
            <section className="blog-post-video" aria-label={post.youtubeUrl ? "Companion video" : "Cover image"}>
              <div className="blog-post-video-thumb">
                {youtubeVideoId ? (
                  <iframe
                    src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                    title={`Companion video for ${post.title}`}
                    className="blog-post-video-embed"
                    loading="lazy"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                ) : mediaImage ? (
                  <Image
                    src={mediaImage}
                    alt="Cover image for blog post"
                    fill
                    sizes="(max-width: 768px) 100vw, 780px"
                    className="blog-post-video-image"
                  />
                ) : null}
              </div>
            </section>
          ) : null}

          <header className="blog-post-header">
            <h1 id="blog-post-title" className="blog-post-title">
              {post.title}
            </h1>
            <p className="blog-post-description">{post.description}</p>

          <div className="blog-post-meta">
            <span>{formatBlogDate(post.date)}</span>
            <span aria-hidden="true">-</span>
            <span>{`${post.readingTimeMinutes} min read`}</span>
            <span aria-hidden="true">-</span>
            <span className="blog-post-meta-author">
              <Link href="/about" className="blog-post-meta-author-name">
                Rahul Anand
              </Link>
            </span>
          </div>
        </header>

          <BlogMarkdown markdown={post.content} />

          <footer className="blog-post-footer">
            <ul className="blog-post-tags" aria-label="Post tags">
              {post.tags.map((tag) => (
                <li key={tag} className="blog-post-tag">
                  {tag}
                </li>
              ))}
            </ul>
          </footer>
        </div>
        <div className="blog-post-side-rail">
          <BlogScrollTopButton />
        </div>
      </div>
    </article>
  );
}
