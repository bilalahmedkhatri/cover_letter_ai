"use client";
import AccountPage from "../AccountPage";
export default function AccountPanel({ section }: { section: string }) {
  return (
    <AccountPage
      initialTab={
        section === "settings"
          ? "profile"
          : section === "billing"
            ? "billing"
            : section === "feedback"
              ? "feedback"
              : "library"
      }
    />
  );
}
