import React from 'react'
import { Heading, type HeadingProps } from '../components/ui/heading'
import { Text, type TextProps } from '../components/ui/text'
import { Callout, type CalloutProps } from '../components/ui/callout'
import CodeBlock from '../components/CodeBlock'

export const MDXComponents = {
  CodeBlock,
  blockquote: (props: CalloutProps) => <Callout type="info" {...props} />,
  h1: (props: HeadingProps) => <Heading level={1} as="h1" {...props} />,
  h2: (props: HeadingProps) => <Heading level={2} as="h2" {...props} />,
  h3: (props: HeadingProps) => <Heading level={3} as="h3" {...props} />,
  h4: (props: HeadingProps) => <Heading level={4} as="h4" {...props} />,
  h5: (props: HeadingProps) => <Heading level={5} as="h5" {...props} />,
  h6: (props: HeadingProps) => <Heading level={6} as="h6" {...props} />,
  p: (props: TextProps) => <Text as="p" {...props} />,
}
