import Link from "next/link";
import type { ReactNode } from "react";

type MarkdownBlock =
  | { type: "heading"; level: 2 | 3; content: string }
  | { type: "paragraph"; content: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; content: string }
  | { type: "code"; language: string | null; code: string };

const HEADING_PATTERN = /^(#{2,3})\s+(.+)$/;
const UNORDERED_LIST_PATTERN = /^\s*-\s+(.+)$/;
const ORDERED_LIST_PATTERN = /^\s*\d+\.\s+(.+)$/;
const BLOCKQUOTE_PATTERN = /^>\s?(.+)$/;
const CODE_FENCE_PATTERN = /^```([a-zA-Z0-9_-]+)?\s*$/;

function isBlockBoundary(line: string): boolean {
  return (
    !line.trim() ||
    HEADING_PATTERN.test(line) ||
    UNORDERED_LIST_PATTERN.test(line) ||
    ORDERED_LIST_PATTERN.test(line) ||
    BLOCKQUOTE_PATTERN.test(line) ||
    CODE_FENCE_PATTERN.test(line)
  );
}

function parseMarkdown(markdown: string): MarkdownBlock[] {
  const lines = markdown.split(/\r?\n/);
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (line === undefined) {
      break;
    }

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const headingMatch = line.match(HEADING_PATTERN);
    if (headingMatch) {
      const hashes = headingMatch[1];
      const headingText = headingMatch[2];
      if (!hashes || !headingText) {
        index += 1;
        continue;
      }

      const level = hashes.length as 2 | 3;
      blocks.push({ type: "heading", level, content: headingText.trim() });
      index += 1;
      continue;
    }

    const codeFenceMatch = line.match(CODE_FENCE_PATTERN);
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

    const unorderedMatch = line.match(UNORDERED_LIST_PATTERN);
    if (unorderedMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        const itemMatch = currentLine.match(UNORDERED_LIST_PATTERN);
        if (!itemMatch) break;
        const itemText = itemMatch[1];
        if (!itemText) break;
        items.push(itemText.trim());
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    const orderedMatch = line.match(ORDERED_LIST_PATTERN);
    if (orderedMatch) {
      const items: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        const itemMatch = currentLine.match(ORDERED_LIST_PATTERN);
        if (!itemMatch) break;
        const itemText = itemMatch[1];
        if (!itemText) break;
        items.push(itemText.trim());
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    const blockquoteMatch = line.match(BLOCKQUOTE_PATTERN);
    if (blockquoteMatch) {
      const quoteLines: string[] = [];

      while (index < lines.length) {
        const currentLine = lines[index];
        if (currentLine === undefined) break;
        const quoteMatch = currentLine.match(BLOCKQUOTE_PATTERN);
        if (!quoteMatch) break;
        const quoteLine = quoteMatch[1];
        if (!quoteLine) break;
        quoteLines.push(quoteLine.trim());
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
      paragraphLines.push(currentLine.trim());
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
  const pattern = /(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = input.split(pattern).filter(Boolean);

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

    const strongMatch = part.match(/^\*\*([^*]+)\*\*$/);
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

    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const label = linkMatch[1];
      const href = linkMatch[2];
      if (!label || !href) {
        return <span key={`inline-text-${index}`}>{part}</span>;
      }

      const isExternal = /^https?:\/\//i.test(href);
      const className = "blog-inline-link";

      if (isExternal) {
        return (
          <a
            key={`inline-link-${index}`}
            href={href}
            target="_blank"
            rel="noreferrer noopener"
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

    return <span key={`inline-text-${index}`}>{part}</span>;
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

        return (
          <p key={`paragraph-${index}`} className="blog-markdown-paragraph">
            {renderInlineMarkdown(block.content)}
          </p>
        );
      })}
    </div>
  );
}
