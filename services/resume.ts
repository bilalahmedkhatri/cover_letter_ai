export async function readResume(file: File): Promise<string> {
  if (file.size > 5 * 1024 * 1024)
    throw new Error("Choose a resume smaller than 5 MB.");
  const ext = file.name.split(".").pop()?.toLowerCase();
  let text = "";
  if (ext === "txt" || ext === 'csv') text = await file.text();
  else if (ext === 'xlsx' || ext === 'xls') {
    const { read, utils } = await import('xlsx');
    const workbook = read(await file.arrayBuffer(), { type: 'array', sheetRows: 201, cellHTML: false, cellFormula: false });
    if (workbook.SheetNames.length > 5) throw new Error('Upload a workbook with at most 5 sheets.');
    text = workbook.SheetNames.map(name => {
      const sheet = workbook.Sheets[name];
      const range = utils.decode_range(sheet['!fullref'] || sheet['!ref'] || 'A1');
      if (range.e.r >= 200 || range.e.c >= 40) throw new Error('Keep each sheet within 200 rows and 40 columns.');
      return `${name}\n${utils.sheet_to_csv(sheet)}`;
    }).join('\n\n');
  }
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
  } else throw new Error("Upload a DOCX, PDF, XLSX, XLS, CSV or TXT document.");
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
