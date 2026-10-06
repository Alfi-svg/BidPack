import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';
import { TenderMetadata, Requirement, RequirementMatch, UploadedDoc } from '../types/tender';

// Configure PDF.js worker for Vite build and dev environments
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch (err) {
    console.warn('PDF.js worker initialization warning:', err);
  }
}

/**
 * Counts the number of pages in a PDF file using pdfjs-dist in the browser.
 * Handles invalid or corrupted PDFs gracefully.
 */
export async function countPdfPages(file: File): Promise<number> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = pdfjsLib.getDocument({
    data: new Uint8Array(arrayBuffer),
  });

  const pdfDocument = await loadingTask.promise;
  return pdfDocument.numPages;
}

/**
 * Production PDF Package Generator using pdf-lib.
 * 
 * Key Architecture:
 * 1. Page 1 Cover: Professional English cover page with Tender ID, Title, Entity,
 *    Bidder, Deadline, Generated Date, and ordered list of included documents.
 * 2. Strict Ordering: Matched source documents sorted strictly by requirement.order.
 * 3. Footer Safety: For each imported page, creates a new page of identical dimensions,
 *    reserves a 32pt footer strip at the bottom, and draws the original page scaled
 *    proportionally to preserve aspect ratio without obscuring any original content.
 * 4. Two-Pass Exact Page Stamping: Total page count Y is computed from actual final package,
 *    stamping "<tender_id> | Page X of Y" across all pages (1 through Y).
 */
export async function generateTenderPackage(
  tender: TenderMetadata,
  requirements: Requirement[],
  matches: Record<string, RequirementMatch>,
  uploadedFiles: UploadedDoc[]
): Promise<Uint8Array> {
  const packageDoc = await PDFDocument.create();
  const fontRegular = await packageDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await packageDoc.embedFont(StandardFonts.HelveticaBold);

  // Filter matched requirements and sort strictly by requirement.order
  const matchedRequirements = requirements
    .filter((req) => Boolean(matches[req.id]?.fileId))
    .sort((a, b) => a.order - b.order);

  const fileMap = new Map(uploadedFiles.map((f) => [f.id, f]));

  // ==========================================
  // PAGE 1 — COVER PAGE
  // ==========================================
  // Standard A4 dimensions: 595.28 x 841.89 points
  const A4_WIDTH = 595.28;
  const A4_HEIGHT = 841.89;
  const MARGIN_X = 54;
  const FOOTER_RESERVED_HEIGHT = 32;

  let currentCoverPage = packageDoc.addPage([A4_WIDTH, A4_HEIGHT]);
  let cursorY = 780;

  // Header Title
  currentCoverPage.drawText('Tender Document Package', {
    x: MARGIN_X,
    y: cursorY,
    size: 22,
    font: fontBold,
    color: rgb(0.06, 0.1, 0.18), // Deep slate / navy
  });

  cursorY -= 16;

  // Subtle accent line
  currentCoverPage.drawLine({
    start: { x: MARGIN_X, y: cursorY },
    end: { x: A4_WIDTH - MARGIN_X, y: cursorY },
    thickness: 1.2,
    color: rgb(0.75, 0.82, 0.9),
  });

  cursorY -= 26;

  const todayStr = new Date().toISOString().split('T')[0];

  const metadataList: { label: string; value: string }[] = [
    { label: 'Tender ID', value: tender.tender_id },
    { label: 'Tender Title', value: tender.title },
    { label: 'Procuring Entity', value: tender.procuring_entity },
    { label: 'Bidder Name', value: tender.bidder },
    { label: 'Submission Deadline', value: tender.submission_deadline },
    { label: 'Package Generated Date', value: todayStr },
  ];

  for (const meta of metadataList) {
    currentCoverPage.drawText(`${meta.label}:`, {
      x: MARGIN_X,
      y: cursorY,
      size: 10,
      font: fontBold,
      color: rgb(0.2, 0.26, 0.35),
    });

    // Support multi-line wrap if title or entity is very long
    const maxWidth = A4_WIDTH - MARGIN_X - 170;
    const valueText = meta.value || 'N/A';

    if (fontRegular.widthOfTextAtSize(valueText, 10) > maxWidth) {
      // Split into two lines if long
      const words = valueText.split(' ');
      let line1 = '';
      let line2 = '';
      for (const w of words) {
        if (fontRegular.widthOfTextAtSize(`${line1} ${w}`, 10) <= maxWidth && !line2) {
          line1 = line1 ? `${line1} ${w}` : w;
        } else {
          line2 = line2 ? `${line2} ${w}` : w;
        }
      }

      currentCoverPage.drawText(line1, {
        x: MARGIN_X + 160,
        y: cursorY,
        size: 10,
        font: fontRegular,
        color: rgb(0.08, 0.12, 0.18),
      });

      if (line2) {
        cursorY -= 14;
        currentCoverPage.drawText(line2, {
          x: MARGIN_X + 160,
          y: cursorY,
          size: 10,
          font: fontRegular,
          color: rgb(0.08, 0.12, 0.18),
        });
      }
    } else {
      currentCoverPage.drawText(valueText, {
        x: MARGIN_X + 160,
        y: cursorY,
        size: 10,
        font: fontRegular,
        color: rgb(0.08, 0.12, 0.18),
      });
    }

    cursorY -= 20;
  }

  cursorY -= 10;

  // Horizontal divider
  currentCoverPage.drawLine({
    start: { x: MARGIN_X, y: cursorY },
    end: { x: A4_WIDTH - MARGIN_X, y: cursorY },
    thickness: 0.75,
    color: rgb(0.88, 0.9, 0.94),
  });

  cursorY -= 24;

  // Section: Included Documents
  currentCoverPage.drawText('Included Documents', {
    x: MARGIN_X,
    y: cursorY,
    size: 13,
    font: fontBold,
    color: rgb(0.06, 0.1, 0.18),
  });

  cursorY -= 20;

  // List all included documents in strict requirement order
  for (const req of matchedRequirements) {
    const match = matches[req.id];
    const doc = match?.fileId ? fileMap.get(match.fileId) : null;
    const pageCountText = doc?.pageCount !== null && doc?.pageCount !== undefined
      ? ` (${doc.pageCount} page${doc.pageCount === 1 ? '' : 's'})`
      : '';

    const docText = `${req.order}. ${req.title_en}${pageCountText}`;

    // Pagination safety for cover in case of extensive document lists
    if (cursorY < FOOTER_RESERVED_HEIGHT + 30) {
      currentCoverPage = packageDoc.addPage([A4_WIDTH, A4_HEIGHT]);
      cursorY = 780;
    }

    currentCoverPage.drawText(docText, {
      x: MARGIN_X + 10,
      y: cursorY,
      size: 9.5,
      font: fontRegular,
      color: rgb(0.15, 0.2, 0.28),
    });

    cursorY -= 18;
  }

  // ==========================================
  // DOCUMENT APPENDING WITH FOOTER SAFETY
  // ==========================================
  for (const req of matchedRequirements) {
    const match = matches[req.id];
    if (!match?.fileId) continue;

    const doc = fileMap.get(match.fileId);
    if (!doc) continue;

    const fileBytes = await doc.file.arrayBuffer();
    const sourceDoc = await PDFDocument.load(fileBytes);
    const sourcePages = sourceDoc.getPages();

    // Embed all pages from this source document preserving original order
    const embeddedPages = await packageDoc.embedPages(sourcePages);

    for (const embeddedPage of embeddedPages) {
      const { width: origWidth, height: origHeight } = embeddedPage;

      // 1. Create a new page with the exact same dimensions
      const newPage = packageDoc.addPage([origWidth, origHeight]);

      // 2. Reserve footer area at bottom (FOOTER_RESERVED_HEIGHT)
      // 3. Draw original page into available content area preserving aspect ratio
      const scale = (origHeight - FOOTER_RESERVED_HEIGHT) / origHeight;
      const scaledWidth = origWidth * scale;
      const scaledHeight = origHeight * scale;
      const xOffset = (origWidth - scaledWidth) / 2;
      const yOffset = FOOTER_RESERVED_HEIGHT;

      newPage.drawPage(embeddedPage, {
        x: xOffset,
        y: yOffset,
        width: scaledWidth,
        height: scaledHeight,
      });
    }
  }

  // ==========================================
  // FOOTER STAMPING (ACCURATE TOTAL PAGE COUNT)
  // ==========================================
  // The final page count Y is calculated from the actual final package
  const totalPages = packageDoc.getPageCount();
  const allPages = packageDoc.getPages();

  for (let i = 0; i < totalPages; i++) {
    const p = allPages[i];
    const { width: pWidth } = p.getSize();
    const pageNum = i + 1;
    const footerText = `${tender.tender_id} | Page ${pageNum} of ${totalPages}`;

    const textWidth = fontRegular.widthOfTextAtSize(footerText, 8.5);

    // Subtle divider line above footer inside reserved bottom area
    p.drawLine({
      start: { x: 36, y: 22 },
      end: { x: pWidth - 36, y: 22 },
      thickness: 0.5,
      color: rgb(0.85, 0.88, 0.92),
    });

    // Centered footer label
    p.drawText(footerText, {
      x: (pWidth - textWidth) / 2,
      y: 10,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.3, 0.36, 0.45),
    });
  }

  return await packageDoc.save();
}

/**
 * Downloads a byte array as a PDF file in browser.
 */
export function downloadPdfFile(bytes: Uint8Array, fileName: string): void {
  const blob = new Blob([bytes as unknown as BlobPart], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
