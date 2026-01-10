import React, { useRef, useState } from 'react';
import { Copy, Check, Terminal, FileCode } from 'lucide-react';
import { cn } from '../lib/ui';

type CodeBlockProps = React.DetailedHTMLProps<React.HTMLAttributes<HTMLPreElement>, HTMLPreElement> & {
  'data-language'?: string;
  'data-title'?: string;
  'data-meta'?: string;
};

export default function CodeBlock(props: CodeBlockProps) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { children, className, 'data-language': language, 'data-title': title, 'data-meta': meta, ...rest } = props;
  const [copied, setCopied] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  // Extract text content for copy
  const getCodeText = () => {
    // If children is a code element string (from Astro Shiki), we need to extract text.
    // However, Shiki renders a table or spans.
    // The easiest way is to use innerText of the ref if available.
    if (codeRef.current) {
        return codeRef.current.innerText;
    }
    return '';
  };

  const handleCopy = async () => {
    const text = getCodeText();
    if (text) {
      try {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy code:', err);
      }
    }
  };

  // Determine icon based on language or title
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const Icon = title ? FileCode : Terminal;

  // Clean up language label
  const langLabel = language === 'plaintext' ? 'Text' : language;

  return (
    <div className="group relative my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 shadow-md">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700 text-xs text-gray-400">
            <div className="flex items-center gap-2">
                {title && <FileCode className="w-4 h-4 text-brand-primary" />}
                {!title && <span className="uppercase font-mono font-bold text-[10px] tracking-wider text-gray-500">{langLabel}</span>}
                {title && <span className="font-mono text-gray-300">{title}</span>}
            </div>

            <div className="flex items-center gap-2">
                 {/* If we have a title, show language on the right too? Maybe overkill. */}
                 {title && <span className="uppercase font-mono font-bold text-[10px] tracking-wider text-gray-600">{langLabel}</span>}

                 <button
                    onClick={handleCopy}
                    className={cn(
                        "p-1.5 rounded-md transition-all duration-200",
                        "hover:bg-gray-700 hover:text-white",
                        copied ? "text-green-400" : "text-gray-400"
                    )}
                    aria-label="Copy code"
                    title="Copy to clipboard"
                 >
                    {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                 </button>
            </div>
        </div>

        {/* Code Content */}
        {/* We pass the original props to pre but override className to ensure styling */}
        <div className="relative overflow-x-auto">
             <pre ref={codeRef} className={cn("!m-0 !p-4 !bg-transparent overflow-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent", className)} {...rest}>
                {children}
             </pre>
        </div>
    </div>
  );
}
