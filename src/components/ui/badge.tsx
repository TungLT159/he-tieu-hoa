import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border border-transparent px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "bg-destructive text-destructive-foreground [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        ghost: "[a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        link: "text-[#5b49c8] underline-offset-4 [a&]:hover:underline dark:text-[#c7bdff]",
        soft: "border-0 bg-[color-mix(in_oklab,var(--primary)_18%,transparent)] text-[#5b49c8] dark:text-[#c7bdff]",
        "outline-primary":
          "border border-primary bg-transparent text-[#5b49c8] [a&]:hover:bg-primary [a&]:hover:text-primary-foreground dark:text-[#c7bdff]",
        "outline-secondary":
          "border border-secondary bg-transparent text-foreground [a&]:hover:bg-secondary [a&]:hover:text-secondary-foreground",
        "outline-success":
          "border border-[#147a37] bg-transparent text-[#147a37] [a&]:hover:bg-[#147a37] [a&]:hover:text-white dark:border-[#7ee2a2] dark:text-[#7ee2a2]",
        "outline-danger":
          "border border-[#b42318] bg-transparent text-[#b42318] [a&]:hover:bg-[#b42318] [a&]:hover:text-white dark:border-[#ffb4ab] dark:text-[#ffb4ab]",
        "outline-warning":
          "border border-[#8a4b16] bg-transparent text-[#8a4b16] [a&]:hover:bg-[#8a4b16] [a&]:hover:text-white dark:border-[#f7c58d] dark:text-[#f7c58d]",
        "outline-info":
          "border border-[#0969a8] bg-transparent text-[#0969a8] [a&]:hover:bg-[#0969a8] [a&]:hover:text-white dark:border-[#8fd3ff] dark:text-[#8fd3ff]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "span"

  return (
    <Comp
      data-slot="badge"
      data-variant={variant}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

// eslint-disable-next-line react-refresh/only-export-components -- shadcn/ui pattern
export { Badge, badgeVariants }
