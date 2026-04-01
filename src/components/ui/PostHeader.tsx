import React from 'react'
import { Badge } from './badge'
import { Heading } from './heading'
import { Text } from './text'
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

      <Heading level={1} as="h1">
        {title}
      </Heading>

      <HStack justify="center" gap="lg">
        <Time date={pubDate} variant="muted" />
        <SlashSeparator />
        <Text as="span" variant="muted" size="sm" className="font-mono">
          General
        </Text>
      </HStack>
    </header>
  )
}
