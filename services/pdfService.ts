import { AdmissionInfo, DetailWithSource } from '../types';
import { loadScript } from './scriptLoader';
import { TranslationKeys } from './translations';

const JSPDF_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const AUTOTABLE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js';


// Fix: Add manual type declarations for jsPDF, which is loaded from a script tag.
// This resolves TypeScript errors about the missing 'jspdf' namespace and its properties.
declare namespace jspdf {
  class jsPDF {
    constructor(options?: any);
    internal: {
      pageSize: {
        height: number;
        width: number;
      };
    };
    splitTextToSize(text: string, maxWidth: number): string[];
    addPage(): jsPDF;
    text(text: string | string[], x: number, y: number, options?: any): jsPDF;
    setFont(fontName: string, fontStyle: string): jsPDF;
    setFontSize(size: number): jsPDF;
    save(filename: string): void;
  }
}

declare global {
  interface Window {
    jspdf: {
      jsPDF: new (options?: any) => jspdf.jsPDF;
    };
  }
}


// The jsPDF and autoTable types are inferred from the global scripts loaded in index.html.
// We cast the jsPDF instance to include the autoTable method for type-safety within this module.
interface jsPDFWithAutoTable extends jspdf.jsPDF {
  autoTable: (options: any) => jspdf.jsPDF;
}

/**
 * Generates and downloads a PDF report from the university analysis results.
 * @param admissionInfo The structured details of the admission analysis.
 * @param foundCourses A list of course names found on the page.
 * @param t The translation function.
 */
export const generateAnalysisReportPdf = async (
    admissionInfo: AdmissionInfo, 
    foundCourses: string[],
    t: (key: TranslationKeys) => string
) => {
  // Dynamically load the PDF generation libraries only when this function is called.
  await loadScript(JSPDF_URL);
  await loadScript(AUTOTABLE_URL);

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF() as jsPDFWithAutoTable;
  
  // --- PDF Header ---
  doc.setFont('ariel', 'bold');
  doc.setFontSize(16);
  doc.text('University Program Analysis Report', 14, 22);

  // --- Assemble Content for a single table ---
  const tableBody: any[] = [];

  // Helper function to add a titled section to the table body.
  // This approach lets autoTable handle all layout and page breaks.
  const addContentToBody = (title: string, detail: DetailWithSource | undefined) => {
    if (!detail || !detail.text || detail.text.toLowerCase() === 'information not found') return;
    
    // Add a spacer row for margin if this is not the first item.
    if (tableBody.length > 0) {
      tableBody.push([{ content: '', styles: { cellHeight: 4 } }]);
    }

    // Add the title row with specific styling.
    tableBody.push([{
      content: title,
      styles: { font: 'ariel', fontStyle: 'bold', fontSize: 12 }
    }]);
    
    // Add the content row with its styling.
    const content = detail.text.replace(/\\n/g, '\n');
    tableBody.push([{
      content: content,
      styles: { font: 'ariel', fontSize: 10 }
    }]);
  };

  addContentToBody(t('formRequirements'), admissionInfo.admissionRequirements);
  addContentToBody(t('formDeadlines'), admissionInfo.deadlines);
  addContentToBody(t('formScholarships'), admissionInfo.scholarships);

  // Add emails section if available.
  if (admissionInfo.emails && admissionInfo.emails.list.length > 0) {
    const emailText = admissionInfo.emails.list.map(e => `${e.address} (${e.description})`).join('\n');
    addContentToBody(t('formContactEmails'), { text: emailText, sourceUrl: admissionInfo.emails.sourceUrl });
  }

  // --- Render the main content table ---
  if (tableBody.length > 0) {
    doc.autoTable({
      startY: 30, // Start below the main title
      body: tableBody,
      theme: 'plain',
    });
  }

  // --- Render the 'Found Courses' table ---
  if (foundCourses && foundCourses.length > 0) {
    doc.autoTable({
      // autoTable will automatically place this after the previous table.
      // A top margin can be added via styles if needed, but the flow is automatic.
      head: [[t('formFoundCourses')]],
      body: foundCourses.map(course => [course]),
      theme: 'grid',
      headStyles: { fillColor: [22, 78, 99] }, // A deep cyan color
      styles: { font: 'helvetica', fontSize: 10 },
      // Use startY only if the main content was empty, otherwise let it flow naturally.
      startY: tableBody.length === 0 ? 30 : undefined,
    });
  }

  doc.save('university-analysis-report.pdf');
};
