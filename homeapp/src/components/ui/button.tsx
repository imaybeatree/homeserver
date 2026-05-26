import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "tv-button",
  {
    variants: {
      variant: {
        default: "tv-button-primary",
        destructive: "tv-button-primary",
        outline: "tv-button-ghost",
        secondary: "tv-button-primary",
        ghost: "tv-button-ghost",
        link: "tv-button-ghost",
      },
      size: {
        default: "",
        sm: "",
        lg: "tv-button-large",
        icon: "",
        "icon-sm": "",
        "icon-lg": "tv-button-large",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
