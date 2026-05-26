import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function MarkdownContent({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        h1: ({ children }) => (
          <h1 className="mb-6 mt-2 text-center font-display text-3xl font-semibold leading-tight text-wine-900 md:text-4xl">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="mb-3 mt-10 font-display text-2xl font-semibold text-wine-800">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="mb-2 mt-8 font-display text-xl font-medium text-wine-800">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="mb-4 text-justify font-serif leading-[1.85] text-ink-800 [hyphens:auto]">
            {children}
          </p>
        ),
        blockquote: ({ children }) => (
          <blockquote className="my-6 border-l-2 border-gold-500 pl-5 font-serif italic text-ink-700">
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            className="text-wine-700 underline decoration-gold-500/50 underline-offset-2 hover:text-wine-900"
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
