// Loaded only when exporting; existing PDF.js remains responsible for reading uploads.
export async function exportLetterPdf(html: string) {
  const { default: html2pdf } = await import('html2pdf.js');
  const letter = document.createElement('div');
  letter.style.cssText = 'display:flow-root;box-sizing:border-box;width:170mm;padding-bottom:24px;font:16px/1.2 Arial,sans-serif;color:#111;background:#fff;overflow-wrap:anywhere;';
  letter.innerHTML = html;
  letter.querySelectorAll('p').forEach(p => { p.style.margin = `0 0 ${p.style.marginBottom || '1.08em'}`; });
  letter.lastElementChild?.setAttribute('style', `${letter.lastElementChild.getAttribute('style') || ''};margin-bottom:0`);
  await document.fonts.ready;
  const options = {
    filename: 'cover-letter.pdf', margin: 20,
    image: { type: 'jpeg' as const, quality: .98 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as const },
    pagebreak: { mode: ['css'], avoid: ['p', 'li'] },
    html2canvas: { scale: 2, backgroundColor: '#fff', logging: false,
      // Export independently of dark mode and Tailwind's modern color functions.
      onclone: (copy: Document) => {
        copy.querySelectorAll('style,link[rel="stylesheet"]').forEach(node => node.remove());
        copy.documentElement.style.cssText = 'background:#fff;color:#111;color-scheme:light';
        copy.body.style.cssText = 'margin:0;background:#fff;color:#111';
      },
    },
  };
  await html2pdf().set(options).from(letter).save();
}
