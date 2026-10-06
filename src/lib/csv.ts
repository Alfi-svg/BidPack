import { Requirement, RequirementMatch, UploadedDoc, TenderMetadata, Language } from '../types/tender';
import { validateRequirement } from './validation';
import { t } from '../i18n/translations';

/**
 * Escapes a single CSV cell value according to RFC 4180.
 * If the value contains commas, double quotes, or newlines,
 * it must be enclosed in double quotes, and any internal double quotes doubled ("").
 */
function escapeCsvCell(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (/[",\r\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Generates and downloads a CSV checklist of the tender requirements and current matching status.
 */
export function exportChecklistCsv(
  tender: TenderMetadata,
  requirements: Requirement[],
  matches: Record<string, RequirementMatch>,
  uploadedFiles: UploadedDoc[],
  lang: Language = 'en'
): string {
  const fileMap = new Map(uploadedFiles.map((f) => [f.id, f]));

  // CSV Headers
  const headers = ['Document', 'File Name', 'Pages', 'Expiry Date', 'Status'];

  const rows: string[][] = [headers];

  const sortedRequirements = [...requirements].sort((a, b) => a.order - b.order);

  for (const req of sortedRequirements) {
    const match = matches[req.id];
    const matchedDoc = match?.fileId ? fileMap.get(match.fileId) : null;
    const validation = validateRequirement(req, match, tender.submission_deadline, lang);

    const docTitle = `${req.order}. ${lang === 'bn' ? req.title_bn : req.title_en}`;
    const fileName = matchedDoc ? matchedDoc.name : (req.mandatory ? 'Missing' : 'Not provided');
    const pages = matchedDoc?.pageCount !== null && matchedDoc?.pageCount !== undefined
      ? matchedDoc.pageCount
      : 0;
    const expiry = match?.expiryDate ? match.expiryDate : (req.has_expiry ? 'Not set' : 'N/A');
    const statusText = t(lang, 'status', validation.status);

    rows.push([
      docTitle,
      fileName,
      String(pages),
      expiry,
      statusText,
    ]);
  }

  const csvContent = rows
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');

  // Trigger download via Blob
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  const safeTenderId = tender.tender_id.replace(/[\\/:*?"<>|]/g, '_');
  const filename = `${safeTenderId}_Checklist.csv`;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);

  return filename;
}
