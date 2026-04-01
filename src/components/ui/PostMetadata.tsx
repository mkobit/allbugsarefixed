import React from 'react'
import { Clock, AlignLeft } from 'lucide-react'
import { HStack } from './stack'
import { Text } from './text'

interface PostMetadataProps {
  readonly readingTime: string
  readonly words?: number
}

export function PostMetadata({ readingTime, words }: Readonly<PostMetadataProps>) {
  return (
    <HStack gap="md" className="mt-2 mb-6 text-gray-500 dark:text-gray-400">
      <HStack gap="sm" title="Reading time">
        <Clock size={14} />
        <Text as="span" variant="mono" size="xs">
          {readingTime}
        </Text>
      </HStack>

      {words && (
        <HStack gap="sm" title="Word count">
          <AlignLeft size={14} />
          <Text as="span" variant="mono" size="xs">
            {words}
            {' '}
            words
          </Text>
        </HStack>
      )}
    </HStack>
  )
}
