import React, { useState, useCallback, memo, useMemo } from "react";
import { showToast } from "@/lib/toast-utils";
import { Source } from "@/lib/schemas/market";

// Enhanced markdown parser for better readability
function parseMarkdown(text: string): JSX.Element[] {
  const lines = text.split('\n');
  const elements: JSX.Element[] = [];
  let key = 0;

  // Extract first paragraph as summary if it's long enough
  let summaryAdded = false;
  const firstParagraph = lines.slice(0, 5).join(' ').trim();
  if (firstParagraph.length > 50 && !firstParagraph.startsWith('#')) {
    const summaryText = firstParagraph.split('\n')[0];
    if (summaryText.length > 30) {
      elements.push(
        <div key={key++} className="mb-4 rounded-2xl border-2 border-[#A06AFF]/40 bg-gradient-to-br from-[#A06AFF]/10 to-[#7B4FC8]/5 p-4 backdrop-blur-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[#A06AFF] text-[14px] font-bold uppercase tracking-wider">📝 Summary</span>
          </div>
          <p className="text-[15px] leading-[1.7] text-white font-medium">
            {summaryText}
          </p>
        </div>
      );
      summaryAdded = true;
    }
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Skip first line if we added it as summary
    if (summaryAdded && i === 0) continue;
    
    // Headers (###, ##, #)
    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={key++} className="text-[17px] font-bold text-white mt-4 mb-2">
          {line.replace('### ', '')}
        </h3>
      );
      continue;
    }
    if (line.startsWith('## ')) {
      elements.push(
        <h2 key={key++} className="text-[19px] font-bold text-white mt-5 mb-3">
          {line.replace('## ', '')}
        </h2>
      );
      continue;
    }
    if (line.startsWith('# ')) {
      elements.push(
        <h1 key={key++} className="text-[21px] font-bold text-white mt-6 mb-3">
          {line.replace('# ', '')}
        </h1>
      );
      continue;
    }

    // Bullet points (-, •, *)
    if (line.trim().match(/^[-•*]\s+/)) {
      const content = line.trim().replace(/^[-•*]\s+/, '');
      
      // Check if it has a bold title at the start (e.g., "**Title:** description")
      const titleMatch = content.match(/^\*\*([^*]+)\*\*:?\s*(.*)/);
      
      if (titleMatch) {
        const title = titleMatch[1];
        const description = titleMatch[2];
        elements.push(
          <div key={key++} className="flex gap-3 my-3 pl-2 group hover:bg-[#A06AFF]/5 rounded-lg p-2 transition-colors">
            <span className="text-[#A06AFF] text-[18px] mt-0.5 flex-shrink-0 font-bold">•</span>
            <div className="flex-1">
              <span className="text-[15px] font-bold text-[#A06AFF] group-hover:text-[#B88FFF]">{title}</span>
              {description && (
                <span className="text-[15px] leading-[1.7] text-[#E8E8E8] font-normal">
                  {': '}{formatInlineMarkdown(description)}
                </span>
              )}
            </div>
          </div>
        );
      } else {
        const formatted = formatInlineMarkdown(content);
        elements.push(
          <div key={key++} className="flex gap-3 my-2 pl-2 hover:bg-[#A06AFF]/5 rounded-lg p-2 transition-colors">
            <span className="text-[#A06AFF] text-[16px] mt-1 flex-shrink-0">•</span>
            <span className="text-[15px] leading-[1.7] text-[#E8E8E8] font-normal">{formatted}</span>
          </div>
        );
      }
      continue;
    }

    // Empty lines
    if (line.trim() === '') {
      elements.push(<div key={key++} className="h-2"></div>);
      continue;
    }

    // Regular paragraphs
    const formatted = formatInlineMarkdown(line);
    elements.push(
      <p key={key++} className="text-[15px] leading-[1.8] text-[#E8E8E8] font-normal my-2">
        {formatted}
      </p>
    );
  }

  return elements;
}

// Format inline markdown (bold, italic, code)
function formatInlineMarkdown(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let currentIndex = 0;
  let key = 0;

  // Bold text: **text**
  const boldRegex = /\*\*([^*]+)\*\*/g;
  let match;
  
  const processedText = text.replace(boldRegex, (_, content) => {
    return `<BOLD>${content}</BOLD>`;
  });

  const segments = processedText.split(/(<BOLD>.*?<\/BOLD>)/);
  
  segments.forEach((segment, idx) => {
    if (segment.startsWith('<BOLD>') && segment.endsWith('</BOLD>')) {
      const content = segment.replace('<BOLD>', '').replace('</BOLD>', '');
      parts.push(
        <strong key={`bold-${idx}`} className="font-bold text-white">
          {content}
        </strong>
      );
    } else if (segment) {
      parts.push(<span key={`text-${idx}`}>{segment}</span>);
    }
  });

  return parts.length > 0 ? parts : text;
}

interface UserMessageProps {
  content: string;
}

const UserMessage = memo(function UserMessage({ content }: UserMessageProps) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="inline-flex max-w-[70%] items-center gap-2 rounded-[24px] border border-[#A06AFF]/40 bg-gradient-to-r from-[#A06AFF]/20 to-[#7B4FC8]/15 px-5 py-3 backdrop-blur-[60px] shadow-lg shadow-[#A06AFF]/15 transition-all duration-300 hover:border-[#A06AFF]/60 hover:shadow-[#A06AFF]/25 hover:bg-gradient-to-r hover:from-[#A06AFF]/25 hover:to-[#7B4FC8]/20">
        <p className="text-[14px] font-semibold leading-relaxed text-white">
          {content}
        </p>
      </div>
    </div>
  );
});

interface SourceCardProps {
  source: Source;
  expanded?: boolean;
}

const SourceCard = memo(function SourceCard({
  source,
  expanded = false,
}: SourceCardProps) {
  return (
    <div className="group flex w-[130px] flex-col gap-2 rounded-2xl border border-[#2E2744] bg-gradient-to-br from-[rgba(46,39,68,0.40)] to-[rgba(12,16,20,0.60)] p-3 backdrop-blur-[60px] transition-all duration-300 hover:border-[#A06AFF]/50 hover:from-[rgba(46,39,68,0.60)] hover:to-[rgba(12,16,20,0.80)] hover:shadow-lg hover:shadow-[#A06AFF]/10">
      <div className="flex items-center gap-2">
        <img
          src={source.icon}
          alt={source.name}
          className="h-5 w-5 rounded-full ring-1 ring-[#A06AFF]/30 transition-transform group-hover:scale-110"
          loading="lazy"
        />
        <span className="text-[12px] font-bold text-[#B0B0B0] group-hover:text-[#A06AFF]">
          {source.name}
        </span>
      </div>
      {!expanded && (
        <p className="line-clamp-2 text-[12px] font-bold text-white group-hover:text-[#A06AFF]/90">
          {source.title}
        </p>
      )}
    </div>
  );
});

interface AIMessageProps {
  content: string;
  sources?: Source[];
}

const AIMessage = memo(function AIMessage({
  content,
  sources,
}: AIMessageProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    showToast.success("Copied!", "Response copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  }, [content]);

  // Parse markdown for better readability
  const parsedContent = useMemo(() => parseMarkdown(content), [content]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3">
        <div className="space-y-1">
          {parsedContent}
        </div>
        <button
          onClick={handleCopy}
          className="flex w-fit items-center gap-2 rounded-lg px-3 py-1.5 text-[13px] font-semibold text-[#B0B0B0] transition-all hover:bg-[rgba(160,106,255,0.10)] hover:text-[#A06AFF]"
          aria-label={copied ? "Copied" : "Copy response"}
        >
          <svg
            className="h-5 w-5 text-[#B0B0B0]"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g clipPath="url(#clip0_565_32)">
              <path
                d="M14.1365 7.48515C14.1345 5.02669 14.0973 3.75328 13.3815 2.88135C13.2434 2.71296 13.089 2.55857 12.9206 2.42038C12.0007 1.66553 10.6341 1.66553 7.90077 1.66553C5.16746 1.66553 3.8008 1.66553 2.88095 2.42038C2.71255 2.55856 2.55814 2.71296 2.41994 2.88135C1.66504 3.80114 1.66504 5.16771 1.66504 7.90084C1.66504 10.634 1.66504 12.0005 2.41994 12.9203C2.55813 13.0887 2.71255 13.2431 2.88095 13.3812C3.75293 14.0969 5.02644 14.1341 7.48506 14.1361"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.6903 7.52038L14.1617 7.48486M11.6786 18.3343L14.15 18.2988M18.3097 11.685L18.2864 14.1514M7.50866 11.6963L7.48535 14.1627M9.5728 7.52038C8.8788 7.64468 7.76489 7.77253 7.50866 9.20726M16.2456 18.2988C16.9414 18.1852 18.0571 18.0744 18.3355 16.6438M16.2456 7.52038C16.9396 7.64468 18.0535 7.77253 18.3097 9.20726M9.58338 18.2977C8.88938 18.1738 7.77538 18.0465 7.51836 16.6119"
                stroke="#B0B0B0"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>
            <defs>
              <clipPath id="clip0_565_32">
                <rect width="20" height="20" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </button>
      </div>

      <div className="flex flex-col gap-4">
        {sources && sources.length > 0 && (
          <div className="flex flex-wrap items-start gap-3">
            {sources.slice(0, 7).map((source, idx) => (
              <SourceCard key={idx} source={source} />
            ))}
            {sources.length > 7 && (
              <div className="group flex flex-1 min-w-[130px] flex-col gap-2 rounded-2xl border border-[#2E2744] bg-gradient-to-br from-[rgba(46,39,68,0.40)] to-[rgba(12,16,20,0.60)] p-3 backdrop-blur-[60px] transition-all duration-300 hover:border-[#A06AFF]/50 hover:from-[rgba(46,39,68,0.60)] hover:to-[rgba(12,16,20,0.80)] hover:shadow-lg hover:shadow-[#A06AFF]/10">
                <div className="flex items-center gap-1">
                  {sources.slice(7, 10).map((source, idx) => (
                    <img
                      key={idx}
                      src={source.icon}
                      alt={source.name}
                      className="h-5 w-5 -ml-2 first:ml-0 rounded-full ring-1 ring-[#A06AFF]/30 transition-transform group-hover:scale-110"
                      loading="lazy"
                    />
                  ))}
                </div>
                <p className="text-[12px] font-bold text-[#B0B0B0] group-hover:text-[#A06AFF]">
                  + {sources.length - 7} more
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <button
            className="px-2.5 py-1.5 text-[12px] font-semibold text-[#B0B0B0] rounded-lg bg-[#2A2A3E]/40 border border-transparent hover:bg-[#A06AFF]/15 hover:text-[#A06AFF] hover:border-[#A06AFF]/30 transition-all duration-200"
            title="Helpful reaction"
          >
            👍
          </button>
          <button
            className="px-2.5 py-1.5 text-[12px] font-semibold text-[#B0B0B0] rounded-lg bg-[#2A2A3E]/40 border border-transparent hover:bg-[#A06AFF]/15 hover:text-[#A06AFF] hover:border-[#A06AFF]/30 transition-all duration-200"
            title="Need improvement"
          >
            👎
          </button>
          <button
            className="px-3 py-1.5 text-[12px] font-semibold text-[#B0B0B0] rounded-lg bg-[#2A2A3E]/40 border border-transparent hover:bg-[#A06AFF]/15 hover:text-[#A06AFF] hover:border-[#A06AFF]/30 transition-all duration-200"
            title="Ask follow-up question"
          >
            Continue
          </button>
          <button
            className="px-3 py-1.5 text-[12px] font-semibold text-[#B0B0B0] rounded-lg bg-[#2A2A3E]/40 border border-transparent hover:bg-[#A06AFF]/15 hover:text-[#A06AFF] hover:border-[#A06AFF]/30 transition-all duration-200"
            title="Generate similar response"
          >
            Similar
          </button>
        </div>
      </div>
    </div>
  );
});

export { UserMessage, AIMessage, SourceCard };
