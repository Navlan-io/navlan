import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";

interface ProfileMarkdownProps {
  content: string;
}

const ProfileMarkdown = ({ content }: ProfileMarkdownProps) => (
  <ReactMarkdown
    rehypePlugins={[rehypeSanitize]}
    components={{
      h1: ({ children }) => (
        <h3 className="font-heading font-semibold text-[20px] text-charcoal mt-6 mb-3 first:mt-0">{children}</h3>
      ),
      h2: ({ children }) => (
        <h3 className="font-heading font-semibold text-[18px] text-charcoal mt-5 mb-2">{children}</h3>
      ),
      h3: ({ children }) => (
        <h4 className="font-heading font-semibold text-[16px] text-charcoal mt-4 mb-2">{children}</h4>
      ),
      p: ({ children }) => (
        <p className="font-body text-[16px] text-charcoal leading-[1.75] mb-4 last:mb-0">{children}</p>
      ),
      strong: ({ children }) => (
        <strong className="font-semibold text-charcoal">{children}</strong>
      ),
      ul: ({ children }) => (
        <ul className="list-disc pl-6 mb-4 space-y-1.5">{children}</ul>
      ),
      ol: ({ children }) => (
        <ol className="list-decimal pl-6 mb-4 space-y-1.5">{children}</ol>
      ),
      li: ({ children }) => (
        <li className="font-body text-[16px] text-charcoal leading-[1.75]">{children}</li>
      ),
      a: ({ href, children }) => (
        <a href={href} className="text-horizon-blue hover:underline" target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      ),
    }}
  >
    {content}
  </ReactMarkdown>
);

export default ProfileMarkdown;
