import React from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../lib/ui";

const badgeStyles = tv({
  base: "inline-flex items-center font-bold tracking-wide uppercase",
  defaultVariants: {
    variant: "default",
  },
  variants: {
    variant: {
      default: "text-brand-primary text-xs",
      outline: "border border-current rounded-full px-2 py-0.5 text-xs",
      solid: "bg-brand-primary text-white rounded-full px-2 py-0.5 text-xs",
    },
  },
});

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeStyles> {}

export function Badge({ className, variant, ...props }: Readonly<BadgeProps>) {
  return <span className={cn(badgeStyles({ variant }), className)} {...props} />;
}
