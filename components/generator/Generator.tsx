"use client";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FileText, LoaderCircle } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useFormState } from "@/contexts/FormStateContext";
import { useGeneration } from "@/contexts/GenerationContext";
import { accountRequest } from "@/services/authClient";
import { workflows } from "@/services/workflow.mjs";
import FormField from "./FormField";
import ResumeUpload from "./ResumeUpload";
import SaveToAccount from "../SaveToAccount";
const RichEditor = dynamic(() => import("./RichEditor"), {
  ssr: false,
  loading: () => <p role="status">Loading your editor…</p>,
});
type Kind = "cover-letter" | "university" | "email";
function Choice({
  id,
  value,
  onChange,
  options,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((value) => (
          <SelectItem key={value} value={value}>
            {value}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
export default function Generator({ kind }: { kind: Kind }) {
  const flow = workflows[kind] as (typeof workflows)[Kind] & {
    letterType: "job" | "university";
    documentType: "letter" | "email";
    kind: "letter" | "email";
  };
  const { userData, setUserData, jobDetails, setJobDetails } = useFormState();
  const { coverLetter, setCoverLetter } = useGeneration();
  const [description, setDescription] = useState(
    userData.opportunityDescription || "",
  );
  const [recipient, setRecipient] = useState(userData.targetRecipient || "");
  const [length, setLength] = useState(userData.outputLength || "medium");
  const [resumeText, setResumeText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sources, setSources] = useState<{ url: string; title: string }[]>([]);
  const url =
    kind === "university"
      ? userData.universityUrl
      : jobDetails.url || userData.opportunityUrl || "";
  useEffect(() => {
    if (
      userData.letterType !== flow.letterType ||
      userData.documentType !== flow.documentType
    )
      setCoverLetter("");
    setUserData((p) => ({
      ...p,
      letterType: flow.letterType,
      documentType: flow.documentType,
    }));
    let active = true;
    accountRequest()
      .then((r) => {
        if (active)
          setUserData((p) => ({
            ...p,
            name: p.name || r.profile.name,
            skills: p.skills || r.profile.skills,
            experience: p.experience || r.profile.experience,
          }));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [kind]);
  async function generate(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "x-generation-id": crypto.randomUUID(),
        },
        body: JSON.stringify({
          kind,
          name: userData.name,
          skills: userData.skills,
          experience: userData.experience,
          language: userData.language,
          tone: userData.tone,
          length,
          recipient,
          description,
          resumeText,
          url,
        }),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Unable to create your draft.");
      setCoverLetter(result.text);
      setSources(result.sources || []);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Unable to create your draft.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="mx-auto max-w-7xl space-y-7">
      <header>
        <p className="eyebrow">WRITING WORKSPACE</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight">
          {flow.title}
        </h1>
        <p className="mt-3 text-text-secondary">{flow.subtitle}</p>
      </header>
      <div className="grid items-start gap-6 xl:grid-cols-[.9fr_1.1fr]">
        <form onSubmit={generate} className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Your background</CardTitle>
              <CardDescription>
                A few specific details make a stronger first draft.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField id="name" label="Your name">
                <Input
                  id="name"
                  required
                  maxLength={120}
                  autoComplete="name"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((p) => ({ ...p, name: e.target.value }))
                  }
                />
              </FormField>
              <ResumeUpload onText={setResumeText} onBusy={setUploading} />
              <FormField
                id="background"
                label={
                  kind === "university"
                    ? "Academic background & motivation"
                    : "Experience & achievements"
                }
              >
                <Textarea
                  id="background"
                  rows={4}
                  maxLength={6000}
                  placeholder="Use real examples, responsibilities and results."
                  value={userData.experience}
                  onChange={(e) =>
                    setUserData((p) => ({ ...p, experience: e.target.value }))
                  }
                />
              </FormField>
              <FormField id="skills" label="Relevant skills">
                <Input
                  id="skills"
                  maxLength={4000}
                  value={userData.skills}
                  onChange={(e) =>
                    setUserData((p) => ({ ...p, skills: e.target.value }))
                  }
                />
              </FormField>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">The opportunity</CardTitle>
              <CardDescription>
                Add a public URL, paste the requirements, or both.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField id="opportunity-url" label={flow.urlLabel}>
                <Input
                  id="opportunity-url"
                  type="url"
                  maxLength={2048}
                  placeholder="https://…"
                  value={url}
                  onChange={(e) =>
                    kind === "university"
                      ? setUserData((p) => ({
                          ...p,
                          universityUrl: e.target.value,
                        }))
                      : (setJobDetails((p) => ({ ...p, url: e.target.value })),
                        setUserData((p) => ({
                          ...p,
                          opportunityUrl: e.target.value,
                        })))
                  }
                />
              </FormField>
              <FormField
                id="opportunity-description"
                label={flow.opportunity}
                hint="For the most accurate draft, paste the important details even when you provide a URL."
              >
                <Textarea
                  id="opportunity-description"
                  required={!url}
                  rows={5}
                  maxLength={6000}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormField>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Make it yours</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <FormField id="recipient" label="Target recipient (optional)">
                <Input
                  id="recipient"
                  placeholder="Hiring team, admissions committee or a person’s name"
                  maxLength={160}
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                />
              </FormField>
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField id="tone" label="Tone">
                  <Choice
                    id="tone"
                    value={userData.tone}
                    onChange={(tone) =>
                      setUserData((p) => ({
                        ...p,
                        tone: tone as typeof p.tone,
                      }))
                    }
                    options={[
                      "Formal",
                      "Concise",
                      "Enthusiastic",
                      "Professional",
                    ]}
                  />
                </FormField>
                <FormField id="output-length" label="Output length">
                  <Select value={length} onValueChange={setLength}>
                    <SelectTrigger id="output-length" className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">
                        Short · 120–180 words
                      </SelectItem>
                      <SelectItem value="medium">
                        Medium · 250–350 words
                      </SelectItem>
                      <SelectItem value="long">Long · 400–550 words</SelectItem>
                    </SelectContent>
                  </Select>
                </FormField>
              </div>
              <FormField id="language" label="Output language">
                <Choice
                  id="language"
                  value={userData.language}
                  onChange={(language) =>
                    setUserData((p) => ({ ...p, language }))
                  }
                  options={[
                    "English",
                    "Russian",
                    "Spanish",
                    "French",
                    "Arabic",
                    "Dutch",
                    "Portuguese",
                    "Bulgarian",
                    "Hungarian",
                    "Slovak",
                    "Polish",
                  ]}
                />
              </FormField>
              <p className="text-xs leading-6 text-text-secondary">
                When you generate, your background and opportunity details are
                sent to the writing provider. Review the result before using it.
              </p>
              <Button
                type="submit"
                disabled={busy || uploading}
                className="w-full"
              >
                {busy ? (
                  <>
                    <LoaderCircle className="animate-spin" />
                    Writing your draft…
                  </>
                ) : (
                  <>
                    <FileText />
                    Generate draft
                  </>
                )}
              </Button>
              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-400/40 p-3 text-sm"
                >
                  {error}
                </p>
              )}
            </CardContent>
          </Card>
        </form>
        <div className="space-y-5 xl:sticky xl:top-24">
          {coverLetter ? (
            <>
              <RichEditor value={coverLetter} onChange={setCoverLetter} />
              <SaveToAccount
                content={coverLetter}
                kind={flow.kind}
                defaultTitle={flow.title}
                context={{
                  ...userData,
                  resume: null,
                  targetRecipient: recipient,
                  outputLength: length,
                  opportunityDescription: description,
                  opportunityUrl: url,
                }}
              />
            </>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">
                  A draft you can make your own.
                </CardTitle>
                <CardDescription>
                  Complete the details on the left. Your editable letter will
                  appear here.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex min-h-80 items-center justify-center">
                <FileText
                  className="size-16 text-text-muted/40"
                  strokeWidth={1}
                />
              </CardContent>
            </Card>
          )}
          {sources.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sources to check</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {sources.map(
                  (source, i) =>
                    /^https?:\/\//.test(source.url) && (
                      <a
                        key={i}
                        className="block truncate text-sm underline"
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {source.title}
                      </a>
                    ),
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
