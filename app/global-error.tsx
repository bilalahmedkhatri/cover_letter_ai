"use client";
import PageError from "@/components/PageError";
export default function GlobalError(props: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <PageError {...props} />
      </body>
    </html>
  );
}
