import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../lib/ui";

const stackStyles = tv({
  base: "flex",
  defaultVariants: {
    align: "start",
    direction: "column",
    gap: "md",
    justify: "start",
  },
  variants: {
    align: {
      baseline: "items-baseline",
      center: "items-center",
      end: "items-end",
      start: "items-start",
      stretch: "items-stretch",
    },
    direction: {
      column: "flex-col",
      "column-reverse": "flex-col-reverse",
      row: "flex-row",
      "row-reverse": "flex-row-reverse",
    },
    gap: {
      lg: "gap-6",
      md: "gap-4",
      none: "gap-0",
      sm: "gap-2",
      xl: "gap-8",
    },
    justify: {
      between: "justify-between",
      center: "justify-center",
      end: "justify-end",
      start: "justify-start",
    },
  },
});

export interface StackProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stackStyles> {
  readonly as?: React.ElementType;
}

export function Stack({
  className,
  align,
  direction,
  gap,
  justify,
  as: Component = "div",
  ...props
}: Readonly<StackProps>) {
  return <Component className={cn(stackStyles({ align, direction, gap, justify }), className)} {...props} />;
}

export function HStack({ className, ...props }: Readonly<StackProps>) {
  return <Stack direction="row" align="center" {...props} className={cn(className)} />;
}

export function VStack({ className, ...props }: Readonly<StackProps>) {
  return <Stack direction="column" align="start" {...props} className={cn(className)} />;
}
