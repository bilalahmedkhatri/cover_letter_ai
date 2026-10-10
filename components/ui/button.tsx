// Radix Slot + CVA composition used by shadcn/ui, styled for this product.
import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from './utils';
export const buttonVariants = cva('inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0', {
  variants: {
    variant: { default: 'bg-accent text-white hover:bg-accent/90', outline: 'border border-border bg-card text-text-primary hover:bg-card-secondary', ghost: 'text-text-secondary hover:bg-card-secondary hover:text-text-primary' },
    size: { default: 'h-11 px-5', sm: 'h-9 px-3', lg: 'h-12 px-6', icon: 'size-11 p-0' },
  }, defaultVariants: { variant: 'default', size: 'default' },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild, ...props }, ref) => {
  const Component = asChild ? Slot : 'button';
  return <Component ref={ref} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
});
Button.displayName = 'Button';
