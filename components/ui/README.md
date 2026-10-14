# Shared UI

Official shadcn/ui components were installed with the registry CLI using `components.json` (new-york, Radix, Zinc). Compose these primitives instead of writing duplicate controls. `IconButton` adds the required accessible label to the shared Button.

Theme tokens live in `app/globals.css` and `tailwind.config.cjs`; `cn` is shared through `lib/utils.ts`. Generator fields reuse `FormField`; all route loading/error files reuse `PageLoading` and `PageError`. The Next error boundary uses `retry()` to fetch fresh content.

Use Lucide document, pen and navigation icons. Branding must not use sparkles, brains or robots. Keep logical spacing and alignment for RTL languages, label form fields, and verify focus, dark/light contrast and mobile behavior in a browser.
