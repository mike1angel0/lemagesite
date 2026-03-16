"use client";

import Markdown from "react-markdown";

export function MarkdownBody({ content, className }: { content: string; className?: string }) {
  return (
    <div className={className} style={{ fontSize: "var(--article-font-size, 1rem)" }}>
    <Markdown
      components={{
        h1: ({ children }) => (
          <h1 className="font-serif text-3xl md:text-[36px] font-semibold text-text-primary mt-10 mb-4">
            {children}
          </h1>
        ),
        h2: ({ children }) => {
          const text = typeof children === "string" ? children : "";
          const id = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^a-z0-9-]/g, "");
          return (
            <h2
              id={id}
              className="font-serif text-2xl md:text-[28px] text-text-primary mt-10 mb-4"
            >
              {children}
            </h2>
          );
        },
        h3: ({ children }) => (
          <h3 className="font-serif text-xl font-semibold text-text-primary mt-6 mb-2">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="font-sans text-text-primary leading-[1.8] mt-6">
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className="font-semibold text-text-primary">{children}</strong>
        ),
        em: ({ children }) => (
          <em className="italic">{children}</em>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-2 border-accent pl-4 my-6 italic text-text-muted">
            {children}
          </blockquote>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside mt-4 text-text-primary space-y-1 leading-[1.8] [font-size:inherit]">
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal list-inside mt-4 text-text-primary space-y-1 leading-[1.8] [font-size:inherit]">
            {children}
          </ol>
        ),
        code: ({ children, className }) => {
          const isBlock = className?.includes("language-");
          return isBlock ? (
            <pre className="bg-bg-surface rounded p-4 my-4 overflow-x-auto">
              <code className="font-mono text-sm text-text-secondary">
                {children}
              </code>
            </pre>
          ) : (
            <code className="font-mono text-sm bg-bg-surface rounded px-1.5 py-0.5 text-accent">
              {children}
            </code>
          );
        },
        a: ({ children, href }) => (
          <a
            href={href}
            className="text-accent underline hover:text-text-primary transition-colors"
          >
            {children}
          </a>
        ),
        hr: () => <hr className="border-border my-8" />,
        img: ({ src, alt }) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={alt ?? ""} className="rounded max-w-full my-4" />
        ),
      }}
    >
      {content}
    </Markdown>
    </div>
  );
}
