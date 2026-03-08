"use client"

import "./blog-dashboard.module.css"
import { useDeferredValue, useMemo, useState } from "react"
import Fuse from "fuse.js"
import Link from "next/link"
import { ArrowUpRight, MagnifyingGlass } from "@phosphor-icons/react"
import { FooterAccentText } from "@/components/layout/site-footer-accent"
import { FadeInImage } from "@/components/ui/fade-in-image"
import { type BlogPostSummary } from "@/lib/blog"
import { formatBlogDate, getBlogMediaImage } from "@/lib/blog-shared"

type BlogDashboardProps = {
  posts: BlogPostSummary[]
}

function BlogMedia({
  post,
  className,
  priority = false,
}: {
  post: Pick<BlogPostSummary, "title" | "coverImage" | "youtubeUrl">
  className: string
  priority?: boolean
}) {
  const imageSrc = getBlogMediaImage(post)
  const alt = imageSrc ? `Cover image for ${post.title}` : ""

  if (!imageSrc) {
    return (
      <div className={`${className} blog-media blog-media--fallback`} aria-hidden="true">
        <span>NO PREVIEW</span>
      </div>
    )
  }

  return (
    <FadeInImage
      src={imageSrc}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      frameClassName={`${className} blog-media`}
      imageClassName="blog-media-image"
      placeholderClassName="blog-media-placeholder"
      priority={priority}
    />
  )
}

function BlogCard({
  post,
  priority = false,
}: {
  post: BlogPostSummary
  priority?: boolean
}) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="blog-card-shell u-theme-fade-target u-focus-ring-target"
      aria-label={`Read blog: ${post.title}`}
    >
      <article className="blog-card blog-card--recent u-frosted-surface u-frosted-surface--hoverable">
        <BlogMedia post={post} className="blog-card-media" priority={priority} />
        <p className="blog-card-meta">
          <span>{formatBlogDate(post.date)}</span>
          <span aria-hidden="true">-</span>
          <span>{`${post.readingTimeMinutes} min read`}</span>
        </p>
        <p className="blog-card-author">Rahul Anand</p>
        <h3 className="blog-card-title">
          <span className="blog-card-link u-theme-fade-target">{post.title}</span>
        </h3>
        <p className="blog-card-description">{post.description}</p>
        <p className="blog-card-read-more u-theme-fade-target" aria-hidden="true">
          <span>Read full blog</span>
          <ArrowUpRight size={16} weight="duotone" aria-hidden="true" />
        </p>
      </article>
    </Link>
  )
}

function BlogRow({ post }: { post: BlogPostSummary }) {
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="blog-row-shell u-theme-fade-target u-focus-ring-target u-frosted-surface u-frosted-surface--hoverable"
      aria-label={`Read blog: ${post.title}`}
    >
      <article className="blog-row">
        <BlogMedia post={post} className="blog-row-media" />
        <div className="blog-row-main">
          <h3 className="blog-row-title">
            <span className="blog-row-link u-theme-fade-target">{post.title}</span>
          </h3>
          <p className="blog-row-description">{post.description}</p>
        </div>
        <p className="blog-row-meta">
          <span>{formatBlogDate(post.date)}</span>
          <span aria-hidden="true">-</span>
          <span>{`${post.readingTimeMinutes} min`}</span>
          <span aria-hidden="true">-</span>
          <span>Rahul Anand</span>
        </p>
      </article>
    </Link>
  )
}

export function BlogDashboard({ posts }: BlogDashboardProps) {
  const PREVIOUS_BATCH_SIZE = 5
  const [query, setQuery] = useState("")
  const [visiblePreviousCount, setVisiblePreviousCount] = useState(PREVIOUS_BATCH_SIZE)
  const deferredQuery = useDeferredValue(query)
  const normalizedQuery = deferredQuery.trim()

  const fuse = useMemo(
    () =>
      new Fuse(posts, {
        includeScore: true,
        threshold: 0.32,
        ignoreLocation: true,
        minMatchCharLength: 2,
        keys: [
          { name: "title", weight: 0.35 },
          { name: "description", weight: 0.25 },
          { name: "tags", weight: 0.1 },
          { name: "searchText", weight: 0.3 },
        ],
      }),
    [posts]
  )

  const searchResults = useMemo(() => {
    if (!normalizedQuery) return posts
    return fuse.search(normalizedQuery).map((result) => result.item)
  }, [fuse, normalizedQuery, posts])

  const recentPosts = normalizedQuery ? searchResults.slice(0, 3) : posts.slice(0, 3)
  const previousPostsAll = posts.slice(3)
  const previousPosts = previousPostsAll.slice(0, visiblePreviousCount)
  const hasMorePreviousPosts = visiblePreviousCount < previousPostsAll.length

  return (
    <section className="blogs-page">
      <FooterAccentText text="publish()" />

      <header className="blogs-header">
        <h1 className="blogs-page-sr-title">Blogs</h1>

        <div className="blogs-search-wrap">
          <div className="blogs-search-field-wrap">
            <MagnifyingGlass size={18} aria-hidden="true" className="blogs-search-icon" />
            <input
              id="blogs-search"
              type="search"
              className="blogs-search-field u-theme-fade-target"
              aria-label="Search blog posts"
              placeholder="Search blogs..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>
        </div>
      </header>

      {normalizedQuery ? (
        <section className="blogs-section" aria-labelledby="blogs-results-heading">
          <div className="blogs-section-head">
            <h2 id="blogs-results-heading" className="blogs-section-title">
              Search results
            </h2>
            <p className="blogs-section-copy">{`${searchResults.length} match${searchResults.length === 1 ? "" : "es"}`}</p>
          </div>

          {searchResults.length === 0 ? (
            <p className="blogs-empty-state">
              No posts matched your query. Try searching with a broader keyword.
            </p>
          ) : (
            <ol className="blogs-recent-grid">
              {searchResults.map((post, index) => (
                <li key={post.slug} className="blogs-card-item">
                  <BlogCard post={post} priority={index === 0} />
                </li>
              ))}
            </ol>
          )}
        </section>
      ) : (
        <>
          <section className="blogs-section" aria-labelledby="blogs-most-recent-heading">
            <div className="blogs-section-head">
              <h2 id="blogs-most-recent-heading" className="blogs-section-title">
                Recent blogs
              </h2>
            </div>

            <ol className="blogs-recent-grid">
              {recentPosts.map((post, index) => (
                <li key={post.slug} className="blogs-card-item">
                  <BlogCard post={post} priority={index === 0} />
                </li>
              ))}
            </ol>
          </section>

          <section className="blogs-section" aria-labelledby="blogs-earlier-heading">
            <div className="blogs-section-head">
              <h2 id="blogs-earlier-heading" className="blogs-section-title">
                Previous blogs
              </h2>
            </div>

            <ol className="blogs-earlier-list">
              {previousPosts.map((post) => (
                <li key={post.slug} className="blogs-earlier-item">
                  <BlogRow post={post} />
                </li>
              ))}
            </ol>

            {hasMorePreviousPosts ? (
              <div className="blogs-load-more-wrap">
                <button
                  type="button"
                  className="blogs-load-more-button u-theme-fade-target u-focus-ring-target"
                  onClick={() =>
                    setVisiblePreviousCount((count) => count + PREVIOUS_BATCH_SIZE)
                  }
                >
                  Load more blogs
                </button>
              </div>
            ) : null}
          </section>
        </>
      )}
    </section>
  )
}
