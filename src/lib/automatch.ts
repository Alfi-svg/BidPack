import { Requirement, UploadedDoc, RequirementMatch } from '../types/tender';
import { isHashAlreadyMatched } from './duplicate';

export interface MatchSuggestion {
  requirementId: string;
  fileId: string;
  fileName: string;
  confidence: number;
}

const STOPWORDS = new Set([
  'pdf', 'doc', 'document', 'file', 'scan', 'copy', 'final', 'v1', 'v2', 'v3',
  'the', 'of', 'and', 'for', 'a', 'an', 'in', 'on', 'to', 'signed', 'duly',
  'certified', 'attested', 'official', 'original', 'valid'
]);

/**
 * Normalizes text for matching by removing extension, punctuation, and extra whitespace.
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/[_\-.,/\\()[\]{}!?:;'"+*~@#$%^&=|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts significant tokens from normalized text.
 */
export function extractTokens(text: string): string[] {
  const norm = normalizeText(text);
  if (!norm) return [];
  return norm
    .split(' ')
    .map((w) => w.trim())
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

// Common tender domain synonym clusters for generic matching
const SYNONYM_CLUSTERS: string[][] = [
  ['tin', 'tax', 'e-tin', 'taxpayer'],
  ['vat', 'bin', 'value', 'added'],
  ['trade', 'license', 'business'],
  ['bank', 'solvency', 'credit', 'statement', 'liquidity'],
  ['technical', 'tech', 'specification', 'specs', 'methodology'],
  ['financial', 'fin', 'commercial', 'price', 'pricing', 'schedule', 'boq'],
  ['experience', 'credential', 'completion', 'performance', 'track', 'record'],
  ['declaration', 'undertaking', 'affidavit', 'statement', 'submission', 'form'],
  ['incorporation', 'registration', 'rjsc', 'moa', 'aoa'],
  ['audit', 'audited', 'balance', 'sheet', 'accounts'],
  ['nid', 'national', 'identity'],
  ['power', 'attorney', 'authorization'],
  ['manufacturer', 'authorization', 'maf'],
  ['litigation', 'history'],
];

/**
 * Calculates a match score between a document filename and a requirement.
 * Returns a score between 0 and 1.
 */
export function computeMatchScore(
  fileName: string,
  req: Requirement
): number {
  const normFile = normalizeText(fileName);
  const normTitleEn = normalizeText(req.title_en);
  const normTitleBn = normalizeText(req.title_bn);

  if (!normFile || !normTitleEn) return 0;

  // 1. Direct whole-phrase or substring containment
  if (
    normFile === normTitleEn ||
    normFile.includes(normTitleEn) ||
    normTitleEn.includes(normFile) ||
    (normTitleBn && (normFile.includes(normTitleBn) || normTitleBn.includes(normFile)))
  ) {
    return 0.95;
  }

  const fileTokens = extractTokens(fileName);
  const reqTokens = extractTokens(req.title_en);

  if (fileTokens.length === 0 || reqTokens.length === 0) return 0;

  // 2. Token overlap (Jaccard similarity)
  const reqSet = new Set(reqTokens);
  let directMatches = 0;
  for (const token of fileTokens) {
    if (reqSet.has(token)) {
      directMatches++;
    }
  }

  // Jaccard similarity
  const unionCount = new Set([...fileTokens, ...reqTokens]).size;
  let score = directMatches / unionCount;

  // 3. Synonym / cluster bonus
  let clusterBonus = 0;
  for (const cluster of SYNONYM_CLUSTERS) {
    const fileHasCluster = cluster.some((w) => fileTokens.includes(w) || normFile.includes(w));
    const reqHasCluster = cluster.some((w) => reqTokens.includes(w) || normTitleEn.includes(w));
    if (fileHasCluster && reqHasCluster) {
      clusterBonus += 0.35;
    }
  }

  // 4. Check for key identifier overlap (e.g. "tin", "vat", "trade", "bank", "technical", "financial")
  for (const token of fileTokens) {
    if (reqTokens.includes(token)) {
      if (['trade', 'license', 'tin', 'vat', 'bank', 'solvency', 'technical', 'financial', 'proposal', 'experience', 'declaration'].includes(token)) {
        score += 0.25;
      }
    }
  }

  // Combine and clamp
  const finalScore = Math.min(1.0, score + clusterBonus);
  return finalScore;
}

/**
 * Generates match suggestions for currently unmatched requirements.
 * 
 * Rules:
 * - Never overwrites an existing manual match.
 * - Never suggests the same file to two requirements.
 * - Never suggests two files to one requirement.
 * - Never suggests a file that shares a hash with an already matched file.
 * - Only suggests when confidence >= 0.35 threshold.
 */
export function generateMatchSuggestions(
  requirements: Requirement[],
  uploadedFiles: UploadedDoc[],
  currentMatches: Record<string, RequirementMatch>
): Record<string, MatchSuggestion> {
  const suggestions: Record<string, MatchSuggestion> = {};

  // 1. Identify which requirements need a match
  const unmatchedReqs = requirements.filter(
    (req) => !currentMatches[req.id]?.fileId
  );

  if (unmatchedReqs.length === 0) {
    return suggestions;
  }

  // 2. Identify which files are already assigned to requirements
  const assignedFileIds = new Set<string>();
  const matchMapForDuplicates: Record<string, string | null> = {};
  for (const [rId, m] of Object.entries(currentMatches)) {
    matchMapForDuplicates[rId] = m.fileId;
    if (m?.fileId) {
      assignedFileIds.add(m.fileId);
    }
  }

  // 3. Filter candidate files (must be valid, uncorrupted, and unassigned)
  const availableDocs = uploadedFiles.filter((doc) => {
    if (doc.status === 'corrupted' || doc.status === 'error') return false;
    if (assignedFileIds.has(doc.id)) return false;
    // Check if identical hash is already matched to any requirement
    const isDuplicateOfAssigned = isHashAlreadyMatched(
      doc.hash,
      '', // empty requirementId checks all assignments
      matchMapForDuplicates,
      uploadedFiles
    );
    if (isDuplicateOfAssigned) return false;
    return true;
  });

  if (availableDocs.length === 0) {
    return suggestions;
  }

  // 4. Calculate candidate scores for all (req, doc) pairs
  interface Candidate {
    requirementId: string;
    fileId: string;
    fileName: string;
    fileHash: string;
    confidence: number;
  }

  const candidates: Candidate[] = [];
  const CONFIDENCE_THRESHOLD = 0.35;

  for (const req of unmatchedReqs) {
    for (const doc of availableDocs) {
      const score = computeMatchScore(doc.name, req);
      if (score >= CONFIDENCE_THRESHOLD) {
        candidates.push({
          requirementId: req.id,
          fileId: doc.id,
          fileName: doc.name,
          fileHash: doc.hash,
          confidence: Math.round(score * 100) / 100,
        });
      }
    }
  }

  // 5. Greedily assign highest-confidence pairs first to guarantee 1:1 uniqueness
  candidates.sort((a, b) => b.confidence - a.confidence);

  const usedReqs = new Set<string>();
  const usedFiles = new Set<string>();
  const usedHashes = new Set<string>();

  for (const cand of candidates) {
    if (usedReqs.has(cand.requirementId)) continue;
    if (usedFiles.has(cand.fileId)) continue;
    if (cand.fileHash && usedHashes.has(cand.fileHash)) continue;

    suggestions[cand.requirementId] = {
      requirementId: cand.requirementId,
      fileId: cand.fileId,
      fileName: cand.fileName,
      confidence: cand.confidence,
    };

    usedReqs.add(cand.requirementId);
    usedFiles.add(cand.fileId);
    if (cand.fileHash) {
      usedHashes.add(cand.fileHash);
    }
  }

  return suggestions;
}
