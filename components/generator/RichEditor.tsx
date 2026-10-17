"use client";
import { useEffect, useState } from "react";
import { useEditor, EditorContent, Extension } from "@tiptap/react";
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { textDocument } from '@/services/letterDocument';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  ListChevronsUpDown,
  Undo2,
  Redo2,
  Copy,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
const LineSpacing = Extension.create({
  name: 'lineSpacing',
  addGlobalAttributes() {
    return [{ types: ['paragraph', 'heading'], attributes: { lineHeight: {
      default: null,
      parseHTML: element => element.style.lineHeight || null,
      renderHTML: attributes => attributes.lineHeight ? {style:`line-height: ${attributes.lineHeight}`} : {},
    }, paragraphGap: {
      default: null,
      parseHTML: element => element.style.marginBottom.endsWith('em') ? String(parseFloat(element.style.marginBottom)) : null,
      renderHTML: attributes => attributes.paragraphGap !== null ? {style:`margin-bottom: ${attributes.paragraphGap}em`} : {},
    } } }];
  },
});
export default function RichEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (text: string) => void;
}) {
  const [notice, setNotice] = useState("");
  const [exporting, setExporting] = useState(false);
  const [mode, setMode] = useState("edit");
  const editor = useEditor({
    extensions: [
      StarterKit,
      LineSpacing,
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
      onChange(editor.getText({ blockSeparator: "\n\n" })),
  });
  useEffect(() => {
    if (editor && editor.getText({ blockSeparator: "\n\n" }) !== value)
      editor.commands.setContent(textDocument(value), { emitUpdate: false });
  }, [value, editor]);
  if (!editor)
    return <p role="status" className="py-12">Loading editor…</p>;
  const lineSpacing = editor.getAttributes(editor.isActive('heading') ? 'heading' : 'paragraph').lineHeight || '1.2';
  const paragraphGap = editor.getAttributes(editor.isActive('heading') ? 'heading' : 'paragraph').paragraphGap ?? '1.08';
  function applySpacing(key: 'lineHeight' | 'paragraphGap', value: string) {
    const {from,to}=editor!.state.selection;
    editor!.chain().selectAll().updateAttributes('paragraph',{[key]:value}).updateAttributes('heading',{[key]:value}).setTextSelection({from,to}).run();
  }
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
    ["Align right", AlignRight, () => editor.chain().focus().setTextAlign('right').run(), editor.isActive({textAlign:'right'})],
    ["Justify", AlignJustify, () => editor.chain().focus().setTextAlign('justify').run(), editor.isActive({textAlign:'justify'})],
    ["Undo", Undo2, () => editor.chain().focus().undo().run(), false],
    ["Redo", Redo2, () => editor.chain().focus().redo().run(), false],
  ] as const;
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        editor!.getText({ blockSeparator: "\n\n" }),
      );
      setNotice("Copied to clipboard.");
    } catch {
      setNotice("Copy failed. Select the text and copy it manually.");
    }
  }
  async function pdf() {
    if (exporting) return;
    setExporting(true); setNotice('');
    try {
      const { exportLetterPdf } = await import('@/services/exportLetterPdf');
      await exportLetterPdf(editor!.getHTML());
    } catch { setNotice('PDF export failed. Please try again.'); }
    finally { setExporting(false); }
  }
  return (
    <div>
      <Tabs value={mode} onValueChange={setMode} className="gap-0 overflow-hidden rounded-xl border">
        <div role="toolbar" aria-label="Draft editor" className="flex flex-wrap items-center justify-between gap-2 border-b bg-card-secondary p-2">
          <div role="group" aria-label="Text formatting" className="flex flex-wrap gap-1">
            {tools.map(([label, Icon, action, active]) => (
              <Tooltip key={label}>
                <TooltipTrigger asChild>
                  <IconButton
                    type="button"
                    variant={active ? "secondary" : "ghost"}
                    className="size-7 sm:size-8"
                    label={label}
                    aria-pressed={active}
                    disabled={mode !== 'edit'}
                    onClick={() => action()}
                  >
                    <Icon className="size-4" />
                  </IconButton>
                </TooltipTrigger>
                <TooltipContent>{label}</TooltipContent>
              </Tooltip>
            ))}
            <DropdownMenu.Root><DropdownMenu.Trigger asChild><IconButton type="button" label="Line spacing" variant="ghost" className="size-7 sm:size-8" disabled={mode !== 'edit'}><ListChevronsUpDown className="size-4" /></IconButton></DropdownMenu.Trigger>
              <DropdownMenu.Portal><DropdownMenu.Content aria-label="Line spacing" align="start" sideOffset={6} onCloseAutoFocus={event => { event.preventDefault(); editor.commands.focus(); }} className="z-50 min-w-32 rounded-lg border bg-card p-1 text-sm text-text-primary shadow-lg">
                <DropdownMenu.RadioGroup value={lineSpacing} onValueChange={value=>applySpacing('lineHeight',value)}>
                  {['1','1.2','1.5','1.8','2'].map(value=><DropdownMenu.RadioItem key={value} value={value} className="flex cursor-pointer items-center justify-between gap-4 rounded px-3 py-2 outline-none focus:bg-muted">{value}<DropdownMenu.ItemIndicator>✓</DropdownMenu.ItemIndicator></DropdownMenu.RadioItem>)}
                </DropdownMenu.RadioGroup>
                {([{key:'lineHeight',label:'Line spacing',value:lineSpacing,min:1,step:.05},{key:'paragraphGap',label:'Paragraph gap',value:paragraphGap,min:0,step:.01}] as const).map(option=><div key={option.key} className="mt-1 space-y-2 border-t p-3">
                  <label htmlFor={`custom-${option.key}`} className="flex justify-between gap-4 text-xs">{option.label}<output>{Number(option.value).toFixed(2)}{option.key==='paragraphGap' ? ' em' : ''}</output></label>
                  <Input id={`custom-${option.key}`} type="range" min={option.min} max="3" step={option.step} value={option.value} onChange={event=>applySpacing(option.key,event.target.value)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home','End'].includes(event.key))event.stopPropagation();}} className="h-6 w-40 cursor-pointer border-0 p-0 accent-emerald-500 shadow-none focus-visible:ring-0" />
                </div>)}
              </DropdownMenu.Content></DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
          <div role="group" aria-label="Draft actions" className="flex flex-wrap items-center gap-2 sm:ms-auto">
            <Button type="button" variant="ghost" size="sm" onClick={copy}><Copy />Copy</Button>
            <Button type="button" variant="ghost" size="sm" disabled={exporting} onClick={pdf}><Download />{exporting ? 'Exporting…' : 'PDF'}</Button>
            <TabsList aria-label="Editor mode">
              <TabsTrigger value="edit">Edit</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>
          </div>
        </div>
        <TabsContent value="edit" className="mt-0"><EditorContent editor={editor} /></TabsContent>
        <TabsContent value="preview" className="mt-0">
          <div className="draft-editor min-h-80 bg-card p-6" dangerouslySetInnerHTML={{ __html: editor.getHTML() }} />
        </TabsContent>
      </Tabs>
      <p className="mt-4 text-xs text-text-secondary">
        {editor.getText().trim().split(/\s+/).filter(Boolean).length} words ·
        Review facts before sending, AI can make mistakes.
      </p>
      {notice && (
        <p role="status" className="mt-3 text-sm">
          {notice}
        </p>
      )}
    </div>
  );
}
