import React from "react";
import { Button as HeadlessButton } from "@headlessui/react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "../../lib/ui";

const buttonStyles = tv({
  base: [
    "inline-flex items-center justify-center gap-2 rounded-lg py-2 px-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer",
  ],
  defaultVariants: {
    fullWidth: false,
    size: "md",
    variant: "primary",
  },
  variants: {
    fullWidth: {
      true: "w-full",
    },
    size: {
      icon: "h-9 w-9 p-0",
      lg: "py-2.5 px-4 text-base",
      md: "py-2 px-3 text-sm",
      sm: "py-1 px-2 text-xs",
    },
    variant: {
      ghost:
        "bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-gray-500",
      link: "text-brand-primary hover:underline underline-offset-4 bg-transparent p-0 height-auto",
      outline:
        "border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-gray-500",
      primary: "bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary",
      secondary: "bg-brand-secondary text-white hover:bg-brand-secondary/90 focus:ring-brand-secondary",
    },
  },
});

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonStyles> {
  readonly asChild?: boolean;
}

export function Button({ className, fullWidth, size, variant, ...props }: Readonly<ButtonProps>) {
  return <HeadlessButton className={cn(buttonStyles({ fullWidth, size, variant }), className)} {...props} />;
}
