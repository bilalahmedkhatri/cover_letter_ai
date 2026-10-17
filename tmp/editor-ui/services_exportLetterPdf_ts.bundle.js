"use strict";
(self["webpackChunkai_cover_letter_professional_letter_generator"] = self["webpackChunkai_cover_letter_professional_letter_generator"] || []).push([["services_exportLetterPdf_ts"],{

/***/ "./services/exportLetterPdf.ts":
/*!*************************************!*\
  !*** ./services/exportLetterPdf.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   exportLetterPdf: () => (/* binding */ exportLetterPdf)
/* harmony export */ });
// Loaded only when exporting; existing PDF.js remains responsible for reading uploads.
async function exportLetterPdf(html) {
    const { default: html2pdf } = await __webpack_require__.e(/*! import() */ "vendors-node_modules_html2pdf_js_dist_html2pdf_js").then(__webpack_require__.t.bind(__webpack_require__, /*! html2pdf.js */ "./node_modules/html2pdf.js/dist/html2pdf.js", 23));
    const letter = document.createElement('div');
    letter.style.cssText = 'display:flow-root;box-sizing:border-box;width:170mm;padding-bottom:24px;font:16px/1.2 Arial,sans-serif;color:#111;background:#fff;overflow-wrap:anywhere;';
    letter.innerHTML = html;
    letter.querySelectorAll('p').forEach(p => { p.style.margin = `0 0 ${p.style.marginBottom || '1.08em'}`; });
    letter.lastElementChild?.setAttribute('style', `${letter.lastElementChild.getAttribute('style') || ''};margin-bottom:0`);
    await document.fonts.ready;
    const options = {
        filename: 'cover-letter.pdf', margin: 20,
        image: { type: 'jpeg', quality: .98 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css'], avoid: ['p', 'li'] },
        html2canvas: { scale: 2, backgroundColor: '#fff', logging: false,
            // Export independently of dark mode and Tailwind's modern color functions.
            onclone: (copy) => {
                copy.querySelectorAll('style,link[rel="stylesheet"]').forEach(node => node.remove());
                copy.documentElement.style.cssText = 'background:#fff;color:#111;color-scheme:light';
                copy.body.style.cssText = 'margin:0;background:#fff;color:#111';
            },
        },
    };
    await html2pdf().set(options).from(letter).save();
}


/***/ })

}]);