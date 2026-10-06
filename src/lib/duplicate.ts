import { UploadedDoc } from '../types/tender';

/**
 * Calculates SHA-256 hash of a file using browser Web Crypto API.
 */
export async function calculateFileHash(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Analyzes uploaded documents and flags duplicates based on exact SHA-256 hash.
 */
export function identifyDuplicates(docs: UploadedDoc[]): UploadedDoc[] {
  // Group documents by hash (only for valid non-empty hashes)
  const hashGroups = new Map<string, UploadedDoc[]>();

  for (const doc of docs) {
    if (!doc.hash) continue;
    const group = hashGroups.get(doc.hash) || [];
    group.push(doc);
    hashGroups.set(doc.hash, group);
  }

  return docs.map((doc) => {
    if (!doc.hash) {
      return {
        ...doc,
        isDuplicate: false,
        duplicateOf: undefined,
        duplicateFileIds: [],
      };
    }

    const group = hashGroups.get(doc.hash) || [];
    if (group.length <= 1) {
      return {
        ...doc,
        isDuplicate: false,
        duplicateOf: undefined,
        duplicateFileIds: [],
      };
    }

    // First document uploaded with this hash is considered primary
    const primary = group[0];
    const isCopy = doc.id !== primary.id;

    return {
      ...doc,
      isDuplicate: isCopy,
      duplicateOf: isCopy ? primary.name : undefined,
      duplicateFileIds: group.filter((g) => g.id !== doc.id).map((g) => g.id),
    };
  });
}

/**
 * Checks if a file or any identical duplicate of it is already assigned to a different requirement.
 */
export function isHashAlreadyMatched(
  fileHash: string,
  currentRequirementId: string,
  matches: Record<string, string | null>, // requirementId -> fileId
  docs: UploadedDoc[]
): boolean {
  if (!fileHash) return false;

  const docMap = new Map(docs.map((d) => [d.id, d]));

  for (const [reqId, matchedFileId] of Object.entries(matches)) {
    if (reqId === currentRequirementId || !matchedFileId) continue;
    const matchedDoc = docMap.get(matchedFileId);
    if (matchedDoc && matchedDoc.hash === fileHash) {
      return true;
    }
  }

  return false;
}
