import React from 'react';
import { cn } from './utils';
const field = 'w-full rounded-lg border border-border bg-input-bg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 disabled:opacity-50';
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(({ className, ...props }, ref) => <input ref={ref} className={cn(field, className)} {...props} />);
Input.displayName = 'Input';
export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(({ className, ...props }, ref) => <textarea ref={ref} className={cn(field, 'min-h-24', className)} {...props} />);
Textarea.displayName = 'Textarea';
export const NativeSelect = React.forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement>>(({ className, ...props }, ref) => <select ref={ref} className={cn(field, className)} {...props} />);
NativeSelect.displayName = 'NativeSelect';
