import React from 'react'
import { Badge } from './badge'
import { HStack, Stack } from './stack'
import { Time } from './time'
import { SlashSeparator } from './separator'
import type { Temporal } from '@js-temporal/polyfill'

interface PostHeaderProps {
  readonly title: string
  readonly pubDate: Temporal.PlainDate
}

export function PostHeader({ title, pubDate }: Readonly<PostHeaderProps>) {
  return (
    <header className="mb-10 text-center max-w-3xl mx-auto pt-4">
      <Stack align="center" gap="md" className="mb-4">
        <Badge variant="default">Blog Post</Badge>
      </Stack>

      <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-5xl mb-4">
        {title}
      </h1>

      <HStack justify="center" gap="lg">
        <Time date={pubDate} variant="muted" />
        <SlashSeparator />
        <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">
          General
        </span>
      </HStack>
    </header>
  )
}
