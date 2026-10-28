"use client";
import { useEffect } from "react";
import { Button } from "./ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "./ui/card";
export default function PageError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.error("[Page render error]", error);
    }
  }, [error]);
  return (
    <Card role="alert" className="mx-auto my-12 max-w-lg">
      <CardHeader>
        <CardTitle>We couldn’t load this page.</CardTitle>
        <CardDescription>
          Try loading the page again. Your saved work stays in your account.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex gap-3">
        <Button onClick={retry}>Try again</Button>
        <Button asChild variant="outline">
          <a href="/en">Go home</a>
        </Button>
      </CardContent>
    </Card>
  );
}
