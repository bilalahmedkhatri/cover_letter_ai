"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import FormField from "./FormField";
import { readResume } from "@/services/resume";
export default function ResumeUpload({
  onText,
  onBusy,
}: {
  onText: (text: string) => void;
  onBusy: (busy: boolean) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  return (
    <FormField
      id="resume"
      label="Resume (optional)"
      hint="PDF, DOCX or TXT · up to 5 MB. We extract text in your browser; the original file is not stored."
    >
      <Input
        id="resume"
        type="file"
        accept=".pdf,.docx,.txt"
        disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          onText("");
          setName("");
          setError("");
          if (!file) return;
          setBusy(true);
          onBusy(true);
          try {
            const text = await readResume(file);
            onText(text);
            setName(file.name);
          } catch (error) {
            setError(
              error instanceof Error ? error.message : "Unable to read resume.",
            );
            e.target.value = "";
          } finally {
            setBusy(false);
            onBusy(false);
          }
        }}
      />
      {busy && (
        <p role="status" className="text-sm">
          Reading your resume…
        </p>
      )}
      {name && <Badge variant="outline">{name}</Badge>}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </FormField>
  );
}
