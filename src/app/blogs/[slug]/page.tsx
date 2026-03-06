import type { Metadata } from "next";
import Link from "next/link";
import { FadeInIframe } from "@/components/ui/fade-in-iframe";
import { FadeInImage } from "@/components/ui/fade-in-image";
import { ArrowLeft, DevToLogo, MediumLogo } from "@phosphor-icons/react/dist/ssr";
import { notFound } from "next/navigation";
import { SketchPageShell } from "@/components/background/sketch-page-shell";
import { FooterAccentText } from "@/components/layout/site-footer-accent";
import { BlogMarkdown } from "@/components/blog/blog-markdown";
import { BlogShareButton } from "@/components/blog/blog-share-button";
import { BlogScrollTopButton } from "@/components/blog/blog-scroll-top-button";
import { getAllBlogPosts, getBlogPostBySlug } from "@/lib/blog";
import { formatBlogDate, getBlogMediaImage, parseYouTubeVideoId } from "@/lib/blog-shared";
import { serializeJsonLd } from "@/lib/json-ld";

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
  const postUrl = `https://www.rahulnsanand.com/blogs/${post.slug}`;
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
      "@id": postUrl,
    },
    keywords: post.tags.join(", "),
    wordCount: post.wordCount,
    image: mediaImage ?? undefined,
  };

  return (
    <SketchPageShell page="blogPost">
      <article className="blog-post-page" aria-labelledby="blog-post-title">
        <FooterAccentText text="read()" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(blogPostingSchema) }}
        />

        <Link href="/blogs" className="blog-post-back-link">
          <ArrowLeft size={14} weight="duotone" aria-hidden="true" />
          <span>Back to blogs</span>
        </Link>

        <div className="blog-post-layout">
          <div className="blog-post-surface" data-sketch-safe-zone="hard">
            {mediaImage || youtubeVideoId ? (
              <section className="blog-post-video" aria-label={post.youtubeUrl ? "Companion video" : "Cover image"}>
                <div className="blog-post-video-thumb">
                  {youtubeVideoId ? (
                    <FadeInIframe
                      src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0`}
                      title={`Companion video for ${post.title}`}
                      frameClassName="blog-post-video-embed-frame"
                      iframeClassName="blog-post-video-embed"
                      placeholderClassName="blog-post-video-placeholder"
                      loading="lazy"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : mediaImage ? (
                    <FadeInImage
                      src={mediaImage}
                      alt="Cover image for blog post"
                      fill
                      sizes="(max-width: 768px) 100vw, 780px"
                      frameClassName="blog-post-video-image-frame"
                      imageClassName="blog-post-video-image"
                      placeholderClassName="blog-post-video-placeholder"
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
              <div className="blog-post-meta-row">
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
                <div className="blog-post-header-actions" role="group" aria-label="Post sharing actions">
                  <BlogShareButton title={post.title} url={postUrl} />
                  {post.mediumUrl ? (
                    <a
                      href={post.mediumUrl}
                      className="blog-post-action-icon-link"
                      aria-label="Read this post on Medium"
                      title="Read on Medium"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <MediumLogo size={16} weight="duotone" aria-hidden="true" />
                    </a>
                  ) : null}
                  {post.devtoUrl ? (
                    <a
                      href={post.devtoUrl}
                      className="blog-post-action-icon-link"
                      aria-label="Read this post on Dev.to"
                      title="Read on Dev.to"
                      target="_blank"
                      rel="noreferrer noopener"
                    >
                      <DevToLogo size={16} weight="duotone" aria-hidden="true" />
                    </a>
                  ) : null}
                </div>
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
          <aside className="blog-post-side-actions" aria-label="Post page controls" data-sketch-safe-zone="soft">
            <BlogScrollTopButton />
          </aside>
        </div>
      </article>
    </SketchPageShell>
  );
}
