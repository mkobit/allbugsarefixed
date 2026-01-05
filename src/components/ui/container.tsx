import React from 'react'
import { tv, type VariantProps } from 'tailwind-variants'

const containerStyles = tv({
  base: 'w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8',
})

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof containerStyles>

export function Container({ className, ...props }: Readonly<ContainerProps>) {
  return <div className={containerStyles({ className })} {...props} />
}
