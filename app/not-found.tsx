import Link from "next/link";
import { Button } from "@/components/ui/button";
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 py-12 text-center">
      <h1 className="text-3xl font-semibold">Page not found</h1>
      <p className="my-6 max-w-lg">
        This page may have moved. Return to the writing workspace.
      </p>
      <Button asChild>
        <Link href="/en">Go home</Link>
      </Button>
    </main>
  );
}
