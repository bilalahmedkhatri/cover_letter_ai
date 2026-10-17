"use client";
import AccountPage from "../AccountPage";
export default function AccountPanel({ section }: { section: string }) {
  return (
    <AccountPage
      embedded
      initialTab={section === "billing" ? "billing" : "profile"}
    />
  );
}
