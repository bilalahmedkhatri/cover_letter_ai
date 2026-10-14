"use client";
import { useEffect, useState } from "react";
import DraftReview from "../DraftReview";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  Undo2,
  Redo2,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { IconButton } from "@/components/ui/icon-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
const textDocument = (text: string) => ({
  type: "doc",
  content: text.split(/\n/).map((line) => ({
    type: "paragraph",
    ...(line ? { content: [{ type: "text", text: line }] } : {}),
  })),
});
export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [notice, setNotice] = useState("");
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    content: textDocument(value),
    editorProps: {
      attributes: {
        class: "draft-editor min-h-80 p-6 outline-none",
        role: "textbox",
        "aria-label": "Letter editor",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) =>
      onChange(editor.getText({ blockSeparator: "\n" })),
  });
  useEffect(() => {
    if (editor && editor.getText({ blockSeparator: "\n" }) !== value)
      editor.commands.setContent(textDocument(value), { emitUpdate: false });
  }, [value, editor]);
  if (!editor)
    return (
      <Card>
        <CardContent className="py-12">Loading editor…</CardContent>
      </Card>
    );
  const tools = [
    [
      "Bold",
      Bold,
      () => editor.chain().focus().toggleBold().run(),
      editor.isActive("bold"),
    ],
    [
      "Italic",
      Italic,
      () => editor.chain().focus().toggleItalic().run(),
      editor.isActive("italic"),
    ],
    [
      "Bullet list",
      List,
      () => editor.chain().focus().toggleBulletList().run(),
      editor.isActive("bulletList"),
    ],
    [
      "Numbered list",
      ListOrdered,
      () => editor.chain().focus().toggleOrderedList().run(),
      editor.isActive("orderedList"),
    ],
    [
      "Align left",
      AlignLeft,
      () => editor.chain().focus().setTextAlign("left").run(),
      editor.isActive({ textAlign: "left" }),
    ],
    [
      "Align center",
      AlignCenter,
      () => editor.chain().focus().setTextAlign("center").run(),
      editor.isActive({ textAlign: "center" }),
    ],
    ["Undo", Undo2, () => editor.chain().focus().undo().run(), false],
    ["Redo", Redo2, () => editor.chain().focus().redo().run(), false],
  ] as const;
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        editor!.getText({ blockSeparator: "\n" }),
      );
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Copy failed. Select the text and copy it manually.");
    }
  }
  function pdf() {
    const popup = window.open("", "_blank", "width=850,height=900");
    if (!popup) {
      setNotice("Allow popups to export a PDF.");
      return;
    }
    popup.document.write(
      `<!doctype html><html><head><meta charset="utf-8"><title>Application letter</title><style>body{font:16px/1.7 Arial,sans-serif;color:#111;max-width:720px;margin:40px auto;padding:24px;}@page{size:A4;margin:18mm;}@media print{body{margin:0;padding:0;}}p{margin:0 0 12px;}</style></head><body>${editor!.getHTML()}</body></html>`,
    );
    popup.document.close();
    popup.focus();
    setTimeout(() => popup.print(), 300);
    setNotice("Choose Save as PDF in the print dialog.");
  }
  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
        <CardTitle className="text-xl">Your draft</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={copy}>
            <Copy />
            Copy
          </Button>
          <Button size="sm" onClick={pdf}>
            <Download />
            Export PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="edit">
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          <TabsContent value="edit">
            <div className="mt-4 rounded-xl border">
              <div
                role="toolbar"
                aria-label="Text formatting"
                className="flex flex-wrap gap-1 border-b bg-card-secondary p-2"
              >
                {tools.map(([label, Icon, action, active]) => (
                  <Tooltip key={label}>
                    <TooltipTrigger asChild>
                      <IconButton
                        type="button"
                        variant={active ? "secondary" : "ghost"}
                        className="size-8"
                        label={label}
                        aria-pressed={active}
                        onClick={() => action()}
                      >
                        <Icon className="size-4" />
                      </IconButton>
                    </TooltipTrigger>
                    <TooltipContent>{label}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
              <EditorContent editor={editor} />
            </div>
          </TabsContent>
          <TabsContent value="preview">
            <div
              className="draft-editor mt-4 min-h-80 rounded-xl border bg-card p-6"
              dangerouslySetInnerHTML={{ __html: editor.getHTML() }}
            />
          </TabsContent>
        </Tabs>
        <p className="mt-4 text-xs text-text-secondary">
          {editor.getText().trim().split(/\s+/).filter(Boolean).length} words ·
          Review facts before sending.
        </p>
        {notice && (
          <p role="status" className="mt-3 text-sm">
            {notice}
          </p>
        )}
        <DraftReview text={value} />
      </CardContent>
    </Card>
  );
}
