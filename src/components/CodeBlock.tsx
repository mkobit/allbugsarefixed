import React, { useRef, useState } from 'react'
import { Copy, Check, FileCode } from 'lucide-react'
import type { BundledLanguage } from 'shiki'
import { cn } from '../lib/ui'

interface CodeBlockProps {
  readonly children?: React.ReactNode
  readonly className?: string
  readonly code?: string
  readonly html?: string
  readonly lang?: BundledLanguage | 'plaintext'
  readonly title?: string
  readonly showLineNumbers?: boolean | string
  readonly startLine?: number | string
}

export default function CodeBlock(props: CodeBlockProps) {
  const { title, lang = 'plaintext', code, html, children, className, showLineNumbers, startLine = 1, ...rest } = props

  const [copied, setCopied] = useState(false)
  const codeRef = useRef<HTMLElement>(null)

  const handleCopy = async () => {
    // If raw code is provided via prop (from remark plugin), use it.
    // Otherwise try to get text from ref (fallback).
    const textToCopy = code || (codeRef.current ? codeRef.current.innerText : '')

    if (textToCopy) {
      try {
        await navigator.clipboard.writeText(textToCopy)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
      catch (err) {
        console.error('Failed to copy code:', err)
      }
    }
  }

  const langLabel = lang === 'plaintext' ? 'Text' : lang

  return (
    <div className="group relative my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 bg-gray-900 shadow-md">
      {/* Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/50 border-b border-gray-700 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          {title && <FileCode className="w-4 h-4 text-brand-primary" />}
          {!title && (
            <span className="uppercase font-mono font-bold text-[10px] tracking-wider text-gray-500">{langLabel}</span>
          )}
          {title && <span className="font-mono text-gray-300">{title}</span>}
        </div>

        <div className="flex items-center gap-2">
          {title && (
            <span className="uppercase font-mono font-bold text-[10px] tracking-wider text-gray-600">{langLabel}</span>
          )}

          <button
            onClick={handleCopy}
            className={cn(
              'p-1.5 rounded-md transition-all duration-200',
              'hover:bg-gray-700 hover:text-white',
              copied ? 'text-green-400' : 'text-gray-400',
            )}
            aria-label="Copy code"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="relative overflow-x-auto">
        {html
          ? (
              <div
                ref={codeRef as React.RefObject<HTMLDivElement>}
                className={cn(
                  '!m-0 !p-0 !bg-transparent overflow-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent shiki-container',
                  showLineNumbers && 'show-line-numbers',
                  className,
                )}
                style={{ '--start-line': startLine } as React.CSSProperties}
                dangerouslySetInnerHTML={{ __html: html }}
                {...rest}
              />
            )
          : (
              <pre
                ref={codeRef}
                className={cn(
                  '!m-0 !p-4 !bg-transparent overflow-auto text-sm leading-relaxed scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent',
                  className,
                )}
                {...rest}
              >
                {children || code}
              </pre>
            )}
      </div>
    </div>
  )
}
