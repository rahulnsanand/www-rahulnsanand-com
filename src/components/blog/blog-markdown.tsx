import "./blog-markdown.module.css";
import Link from "next/link";
import type { ReactNode } from "react";

type HeadingLevel = 2 | 3 | 4 | 5;

type MarkdownBlock =
  | { type: "heading"; level: HeadingLevel; content: string }
  | { type: "paragraph"; content: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; content: string }
  | { type: "code"; language: string | null; code: string }
  | { type: "image"; alt: string; src: string }
  | { type: "figcaption"; content: string; href?: string }
  | { type: "horizontal-rule" }
  | { type: "gist"; url: string };

const HEADING_PATTERN = /^(#{2,5})\s*(.+)$/;
const UNORDERED_LIST_PATTERN = /^\s*[-*]\s+(.+)$/;
const ORDERED_LIST_PATTERN = /^\s*\d+\.\s+(.+)$/;
const BLOCKQUOTE_PATTERN = /^>\s?(.+)$/;
const CODE_FENCE_PATTERN = /^```([a-zA-Z0-9_-]+)?\s*$/;
const HORIZONTAL_RULE_PATTERN = /^([-*_])\1{2,}\s*$/;
const IMAGE_PATTERN = /^!\[([^\]]*)\]\(([^)]+)\)\s*$/;
const FIGCAPTION_PATTERN = /^<figcaption>([\s\S]*?)<\/figcaption>\s*$/i;
const FIGCAPTION_LINK_PATTERN = /^\[\s*<figcaption>([\s\S]*?)<\/figcaption>\s*\]\(([^)]+)\)\s*$/i;
const QUOTED_CAPTION_PATTERN = /^"([^"]+)"(?:\s+(.+))?$/;
const ITALIC_CAPTION_PATTERN = /^\*([\s\S]+)\*$/;
const GIST_PATTERN = /^\{%\s*gist\s+([^\s%]+)\s*%\}\s*$/i;
const HTML_UL_OPEN_PATTERN = /^<ul>\s*$/i;
const HTML_UL_CLOSE_PATTERN = /^<\/ul>\s*$/i;
const HTML_OL_OPEN_PATTERN = /^<ol>\s*$/i;
const HTML_OL_CLOSE_PATTERN = /^<\/ol>\s*$/i;

const MOJIBAKE_REPLACEMENTS: Array<[RegExp, string]> = [
  [/â€™/g, "’"],
  [/â€˜/g, "‘"],
  [/â€œ/g, "“"],
  [/â€\u009d/g, "”"],
  [/â€¦/g, "…"],
  [/Â/g, ""],
  [/\u00a0/g, " "],
];

function normalizeMojibake(input: string): string {
  return MOJIBAKE_REPLACEMENTS.reduce((value, [pattern, replacement]) => value.replace(pattern, replacement), input);
}

function decodeHtmlEntities(input: string): string {
  return input
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'");
}

function normalizeInlineContent(input: string): string {
  return decodeHtmlEntities(normalizeMojibake(input));
}

function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]+>/g, "");
}

function sanitizeHeadingContent(input: string): string {
  return normalizeInlineContent(input).replace(/<a\s+name=["'][^"']+["']\s*>\s*<\/a>/gi, "").trim();
}

function extractHtmlListItems(block: string): string[] {
  return [...block.matchAll(/<li>([\s\S]*?)<\/li>/gi)]
    .map((match) => normalizeInlineContent(match[1] ?? "").trim())
    .filter(Boolean);
}

function isBlockBoundary(line: string): boolean {
  const trimmed = line.trim();
  return (
    !trimmed ||
    HEADING_PATTERN.test(trimmed) ||
    UNORDERED_LIST_PATTERN.test(trimmed) ||
    ORDERED_LIST_PATTERN.test(trimmed) ||
    BLOCKQUOTE_PATTERN.test(trimmed) ||
    CODE_FENCE_PATTERN.test(trimmed) ||
    HORIZONTAL_RULE_PATTERN.test(trimmed) ||
    IMAGE_PATTERN.test(trimmed) ||
    FIGCAPTION_PATTERN.test(trimmed) ||
    FIGCAPTION_LINK_PATTERN.test(trimmed) ||
    GIST_PATTERN.test(trimmed) ||
    HTML_UL_OPEN_PATTERN.test(trimmed) ||
    HTML_OL_OPEN_PATTERN.test(trimmed)
  );
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = normalizeMojibake(markdown).split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line === undefined) {
      break;
    }

    const trimmedLine = line.trim();
    const previousRawLine = (lines[index - 1] ?? "").trim();
    const imageImmediatelyAbove = IMAGE_PATTERN.test(previousRawLine);

    if (!trimmedLine) {
      index += 1;
      continue;
    }

    const headingMatch = trimmedLine.match(HEADING_PATTERN);
    if (headingMatch) {
      const hashes = headingMatch[1];
      const headingText = sanitizeHeadingContent(headingMatch[2] ?? "");
      if (!hashes || !headingText) {
        index += 1;
        continue;
      }

      const level = hashes.length as HeadingLevel;
      blocks.push({ type: "heading", level, content: headingText.trim() });
      index += 1;
      continue;
    }

    const codeFenceMatch = trimmedLine.match(CODE_FENCE_PATTERN);
    if (codeFenceMatch) {
      const language = codeFenceMatch[1] ?? null;
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !CODE_FENCE_PATTERN.test(lines[index] ?? "")) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        codeLines.push(currentLine);
        index += 1;
      }

      if (index < lines.length && CODE_FENCE_PATTERN.test(lines[index] ?? "")) {
        index += 1;
      }

      blocks.push({
        type: "code",
        language,
        code: codeLines.join("\n"),
      });
      continue;
    }

    if (HORIZONTAL_RULE_PATTERN.test(trimmedLine)) {
      blocks.push({ type: "horizontal-rule" });
      index += 1;
      continue;
    }

    const gistMatch = trimmedLine.match(GIST_PATTERN);
    if (gistMatch) {
      const gistUrl = normalizeInlineContent(gistMatch[1] ?? "").trim();
      if (gistUrl) {
        blocks.push({ type: "gist", url: gistUrl });
      }
      index += 1;
      continue;
    }

    const imageMatch = trimmedLine.match(IMAGE_PATTERN);
    if (imageMatch) {
      blocks.push({
        type: "image",
        alt: normalizeInlineContent(imageMatch[1] ?? "").trim(),
        src: normalizeInlineContent(imageMatch[2] ?? "").trim(),
      });
      index += 1;
      continue;
    }

    const figcaptionMatch =
      blocks[blocks.length - 1]?.type === "image" && imageImmediatelyAbove ? trimmedLine.match(FIGCAPTION_PATTERN) : null;
    if (figcaptionMatch) {
      const content = normalizeInlineContent(figcaptionMatch[1] ?? "").trim();
      if (content) {
        blocks.push({ type: "figcaption", content });
      }
      index += 1;
      continue;
    }

    const figcaptionLinkMatch =
      blocks[blocks.length - 1]?.type === "image" && imageImmediatelyAbove ? trimmedLine.match(FIGCAPTION_LINK_PATTERN) : null;
    if (figcaptionLinkMatch) {
      const content = normalizeInlineContent(figcaptionLinkMatch[1] ?? "").trim();
      const href = normalizeInlineContent(figcaptionLinkMatch[2] ?? "").trim();
      if (content) {
        blocks.push({ type: "figcaption", content, href: href || undefined });
      }
      index += 1;
      continue;
    }

    const previousBlock = blocks[blocks.length - 1];
    const quotedCaptionMatch =
      previousBlock?.type === "image" && imageImmediatelyAbove ? trimmedLine.match(QUOTED_CAPTION_PATTERN) : null;
    if (quotedCaptionMatch) {
      const quoted = normalizeInlineContent(quotedCaptionMatch[1] ?? "").trim();
      const trailing = normalizeInlineContent(quotedCaptionMatch[2] ?? "").trim();
      const trailingIsPositional = trailing.toLowerCase() === "here";
      const content = `${quoted}${trailing && !trailingIsPositional ? ` ${trailing}` : ""}`.trim();
      if (content) {
        blocks.push({ type: "figcaption", content });
      }
      index += 1;
      continue;
    }

    const italicCaptionMatch =
      previousBlock?.type === "image" && imageImmediatelyAbove ? trimmedLine.match(ITALIC_CAPTION_PATTERN) : null;
    if (italicCaptionMatch) {
      const content = normalizeInlineContent(italicCaptionMatch[1] ?? "").trim();
      if (content) {
        blocks.push({ type: "figcaption", content });
      }
      index += 1;
      continue;
    }

    if (HTML_UL_OPEN_PATTERN.test(trimmedLine) || HTML_OL_OPEN_PATTERN.test(trimmedLine)) {
      const isOrderedList = HTML_OL_OPEN_PATTERN.test(trimmedLine);
      const closePattern = isOrderedList ? HTML_OL_CLOSE_PATTERN : HTML_UL_CLOSE_PATTERN;
      let htmlBlock = trimmedLine;
      index += 1;

      while (index < lines.length) {
        const currentLine = (lines[index] ?? "").trim();
        htmlBlock += `\n${currentLine}`;
        index += 1;
        if (closePattern.test(currentLine)) {
          break;
        }
      }

      const items = extractHtmlListItems(htmlBlock);
      if (items.length > 0) {
        blocks.push({ type: isOrderedList ? "ordered-list" : "unordered-list", items });
      }
      continue;
    }

    const unorderedMatch = trimmedLine.match(UNORDERED_LIST_PATTERN);
    if (unorderedMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        const itemMatch = currentLine.match(UNORDERED_LIST_PATTERN);
        if (!itemMatch) break;
        const itemText = itemMatch[1];
        if (!itemText) break;
        items.push(normalizeInlineContent(itemText).trim());
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    const orderedMatch = trimmedLine.match(ORDERED_LIST_PATTERN);
    if (orderedMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        const itemMatch = currentLine.match(ORDERED_LIST_PATTERN);
        if (!itemMatch) break;
        const itemText = itemMatch[1];
        if (!itemText) break;
        items.push(normalizeInlineContent(itemText).trim());
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const blockquoteMatch = trimmedLine.match(BLOCKQUOTE_PATTERN);
    if (blockquoteMatch) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        const quoteMatch = currentLine.match(BLOCKQUOTE_PATTERN);
        if (!quoteMatch) break;
        const quoteLine = quoteMatch[1];
        if (!quoteLine) break;
        quoteLines.push(normalizeInlineContent(quoteLine).trim());
        index += 1;
      }

      blocks.push({
        type: "blockquote",
        content: quoteLines.join(" "),
      });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length && !isBlockBoundary(lines[index] ?? "")) {
      const currentLine = lines[index];
      if (currentLine === undefined) break;
      paragraphLines.push(normalizeInlineContent(currentLine).trim());
      index += 1;
    }

    blocks.push({
      type: "paragraph",
      content: paragraphLines.join(" "),
    });
  }

  return blocks;
}

function renderInlineMarkdown(input: string): ReactNode[] {
  const pattern =
    /(`[^`]+`|\[[^\]]+\]\([^)]+\)|<a\s+href=['"][^'"]+['"][^>]*>[\s\S]*?<\/a>|<b>[\s\S]*?<\/b>|<i>[\s\S]*?<\/i>|\*__[\s\S]+?__\*|(?:\*\*|__)[\s\S]+?(?:\*\*|__)|(?:\*|_)[^*_][\s\S]*?(?:\*|_))/gi;
  const parts = normalizeInlineContent(input).split(pattern).filter(Boolean);

  return parts.map((part, index) => {
    const codeMatch = part.match(/^`([^`]+)`$/);
    if (codeMatch) {
      const codeText = codeMatch[1];
      if (!codeText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <code key={`inline-code-${index}`} className="blog-inline-code">
          {codeText}
        </code>
      );
    }

    const htmlAnchorMatch = part.match(/^<a\s+[^>]*href=['"]([^'"]+)['"][^>]*>([\s\S]*?)<\/a>$/i);
    if (htmlAnchorMatch) {
      const href = normalizeInlineContent(htmlAnchorMatch[1] ?? "").trim();
      const label = stripHtmlTags(normalizeInlineContent(htmlAnchorMatch[2] ?? "")).trim() || href;
      if (!href) {
        return <span key={`inline-text-${index}`}>{label}</span>;
      }

      const isExternal = /^(https?:\/\/|mailto:|tel:)/i.test(href);
      const className = "blog-inline-link u-theme-fade-target u-focus-ring-target";

      if (isExternal || href.startsWith("#")) {
        return (
          <a
            key={`inline-html-link-${index}`}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer noopener" : undefined}
            className={className}
          >
            {label}
          </a>
        );
      }

      return (
        <Link key={`inline-html-link-${index}`} href={href} className={className}>
          {label}
        </Link>
      );
    }

    const htmlBoldMatch = part.match(/^<b>([\s\S]+)<\/b>$/i);
    if (htmlBoldMatch) {
      const strongText = htmlBoldMatch[1];
      if (!strongText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <strong key={`inline-html-strong-${index}`} className="blog-inline-strong">
          {renderInlineMarkdown(strongText)}
        </strong>
      );
    }

    const htmlItalicMatch = part.match(/^<i>([\s\S]+)<\/i>$/i);
    if (htmlItalicMatch) {
      const italicText = htmlItalicMatch[1];
      if (!italicText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <em key={`inline-html-emphasis-${index}`} className="blog-inline-emphasis">
          {renderInlineMarkdown(italicText)}
        </em>
      );
    }

    const emphasisStrongMatch = part.match(/^\*__([\s\S]+)__\*$/);
    if (emphasisStrongMatch) {
      const emphasisStrongText = emphasisStrongMatch[1];
      if (!emphasisStrongText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <em key={`inline-emphasis-strong-${index}`} className="blog-inline-emphasis">
          <strong className="blog-inline-strong">{renderInlineMarkdown(emphasisStrongText)}</strong>
        </em>
      );
    }

    const strongMatch = part.match(/^\*\*([\s\S]+)\*\*$/);
    if (strongMatch) {
      const strongText = strongMatch[1];
      if (!strongText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <strong key={`inline-strong-${index}`} className="blog-inline-strong">
          {strongText}
        </strong>
      );
    }

    const strongUnderscoreMatch = part.match(/^__([\s\S]+)__$/);
    if (strongUnderscoreMatch) {
      const strongText = strongUnderscoreMatch[1];
      if (!strongText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <strong key={`inline-strong-underscore-${index}`} className="blog-inline-strong">
          {renderInlineMarkdown(strongText)}
        </strong>
      );
    }

    const emphasisMatch = part.match(/^\*([\s\S]+)\*$/);
    if (emphasisMatch) {
      const emphasisText = emphasisMatch[1];
      if (!emphasisText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <em key={`inline-emphasis-${index}`} className="blog-inline-emphasis">
          {renderInlineMarkdown(emphasisText)}
        </em>
      );
    }

    const emphasisUnderscoreMatch = part.match(/^_([\s\S]+)_$/);
    if (emphasisUnderscoreMatch) {
      const emphasisText = emphasisUnderscoreMatch[1];
      if (!emphasisText) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      return (
        <em key={`inline-emphasis-underscore-${index}`} className="blog-inline-emphasis">
          {renderInlineMarkdown(emphasisText)}
        </em>
      );
    }

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = stripHtmlTags(normalizeInlineContent(linkMatch[1] ?? "")).trim();
      const href = normalizeInlineContent(linkMatch[2] ?? "").trim();
      if (!label || !href) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      const isExternal = /^(https?:\/\/|mailto:|tel:)/i.test(href);
      const className = "blog-inline-link u-theme-fade-target u-focus-ring-target";

      if (isExternal || href.startsWith("#")) {
        return (
          <a
            key={`inline-link-${index}`}
            href={href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noreferrer noopener" : undefined}
            className={className}
          >
            {label}
          </a>
        );
      }

      return (
        <Link key={`inline-link-${index}`} href={href} className={className}>
          {label}
        </Link>
      );
    }

    const plainText = stripHtmlTags(part);
    if (!plainText) {
      return null;
    }

    return <span key={`inline-text-${index}`}>{plainText}</span>;
  });
}

export function BlogMarkdown({ markdown }: { markdown: string }) {
  const blocks = parseMarkdown(markdown);

  return (
    <div className="blog-markdown">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          if (block.level === 2) {
            return (
              <h2 key={`heading-${index}`} className="blog-markdown-h2">
                {renderInlineMarkdown(block.content)}
              </h2>
            );
          }

          if (block.level === 4) {
            return (
              <h4 key={`heading-${index}`} className="blog-markdown-h4">
                {renderInlineMarkdown(block.content)}
              </h4>
            );
          }

          if (block.level === 5) {
            return (
              <h5 key={`heading-${index}`} className="blog-markdown-h5">
                {renderInlineMarkdown(block.content)}
              </h5>
            );
          }

          return (
            <h3 key={`heading-${index}`} className="blog-markdown-h3">
              {renderInlineMarkdown(block.content)}
            </h3>
          );
        }

        if (block.type === "unordered-list") {
          return (
            <ul key={`ul-${index}`} className="blog-markdown-list">
              {block.items.map((item, itemIndex) => (
                <li key={`ul-item-${itemIndex}`} className="blog-markdown-list-item">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "ordered-list") {
          return (
            <ol key={`ol-${index}`} className="blog-markdown-ordered-list">
              {block.items.map((item, itemIndex) => (
                <li key={`ol-item-${itemIndex}`} className="blog-markdown-list-item">
                  {renderInlineMarkdown(item)}
                </li>
              ))}
            </ol>
          );
        }

        if (block.type === "blockquote") {
          return (
            <blockquote key={`quote-${index}`} className="blog-markdown-quote">
              <p>{renderInlineMarkdown(block.content)}</p>
            </blockquote>
          );
        }

        if (block.type === "code") {
          return (
            <figure key={`code-${index}`} className="blog-markdown-code-wrap">
              {block.language ? <figcaption className="blog-markdown-code-language">{block.language}</figcaption> : null}
              <pre className="blog-markdown-code">
                <code>{block.code}</code>
              </pre>
            </figure>
          );
        }

        if (block.type === "image") {
          return (
            <figure key={`image-${index}`} className="blog-markdown-image-wrap">
              <img
                src={block.src}
                alt={block.alt}
                loading="lazy"
                decoding="async"
                className="blog-markdown-image"
              />
            </figure>
          );
        }

        if (block.type === "figcaption") {
          return (
            <p key={`figcaption-${index}`} className="blog-markdown-figcaption">
              {block.href ? (
                <a
                  href={block.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="blog-markdown-figcaption-link u-theme-fade-target u-focus-ring-target"
                >
                  {renderInlineMarkdown(block.content)}
                </a>
              ) : (
                renderInlineMarkdown(block.content)
              )}
            </p>
          );
        }

        if (block.type === "horizontal-rule") {
          return <hr key={`hr-${index}`} className="blog-markdown-hr" />;
        }

        if (block.type === "gist") {
          const gistUrl = block.url.endsWith(".js") ? block.url.replace(/\.js$/i, "") : block.url;
          const gistEmbedUrl = `${gistUrl.replace(/\/+$/g, "")}.pibb`;
          return (
            <figure key={`gist-${index}`} className="blog-markdown-gist-wrap">
              <iframe
                src={gistEmbedUrl}
                title="Embedded gist"
                loading="lazy"
                className="blog-markdown-gist-embed"
              />
              <figcaption className="blog-markdown-gist-fallback">
                <a
                  href={gistUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="blog-inline-link u-theme-fade-target u-focus-ring-target"
                >
                  Open gist in new tab
                </a>
              </figcaption>
            </figure>
          );
        }

        return (
          <p key={`paragraph-${index}`} className="blog-markdown-paragraph">
            {renderInlineMarkdown(block.content)}
          </p>
        );
      })}
    </div>
  );
}
