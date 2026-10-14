export async function readResume(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choose a resume smaller than 5 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase();
  let text = "";
  if (ext === "txt") text = await file.text();
  else if (ext === "docx") {
    const mammoth = await import("mammoth/mammoth.browser");
    text = (
      await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })
    ).value;
  } else if (ext === "pdf") {
    const pdf = await import("pdfjs-dist");
    pdf.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
    const task = pdf.getDocument({ data: await file.arrayBuffer() });
    const doc = await task.promise;
    try {
      if (doc.numPages > 30)
        throw new Error("Choose a resume with 30 pages or fewer.");
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        text +=
          content.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ") + "\n";
      }
    } finally {
      await task.destroy();
    }
  } else throw new Error("Upload a PDF, DOCX or TXT resume.");
  if (!text.trim())
    throw new Error(
      "No readable text found. For scanned PDFs, paste your background instead.",
    );
  if (text.length > 12000)
    throw new Error(
      "Resume is too long. Upload a shorter copy or paste the relevant experience.",
    );
  return text.trim();
}
