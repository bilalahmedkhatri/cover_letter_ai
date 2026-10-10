# Shared controls

Button follows the shadcn-style Radix Slot/CVA composition. Language menus use
Radix DropdownMenu and purpose/workspace navigation uses Radix Tabs. These
primitives provide keyboard interaction, focus management and ARIA behavior;
product-specific composition and visual styling live in our source.

Input, Textarea and NativeSelect are shared native controls. Use named Lucide
imports for standard icons. Do not combine different primitive libraries for the
same behavior. Keep logical padding/alignment properties for Arabic and use
the same component variants throughout the product.

References: https://ui.shadcn.com/docs/components/radix/button,
https://www.radix-ui.com/primitives/docs/components/dropdown-menu,
https://www.radix-ui.com/primitives/docs/components/tabs.
