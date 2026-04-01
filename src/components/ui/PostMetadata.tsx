import React from 'react'
import { Clock, AlignLeft } from 'lucide-react'
import { HStack } from './stack'

interface PostMetadataProps {
  readonly readingTime: string
  readonly words?: number
}

export function PostMetadata({ readingTime, words }: Readonly<PostMetadataProps>) {
  return (
    <HStack gap="md" className="mt-2 mb-6 text-gray-500 dark:text-gray-400">
      <HStack gap="sm" title="Reading time">
        <Clock size={14} />
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {readingTime}
        </span>
      </HStack>

      {words && (
        <HStack gap="sm" title="Word count">
          <AlignLeft size={14} />
          <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
            {words}
            {' '}
            words
          </span>
        </HStack>
      )}
    </HStack>
  )
}
