import { TenderMetadata, Requirement, RequirementMatch, UploadedDoc } from '../types/tender';

const STORAGE_KEY = 'bidpack_saved_project_v1';

export interface SavedProjectState {
  version: number;
  timestamp: string;
  tender: TenderMetadata;
  requirements: Requirement[];
  savedMatches: Record<
    string,
    {
      requirementId: string;
      fileName: string | null;
      expiryDate?: string;
    }
  >;
}

/**
 * Saves current project metadata and match configuration to browser localStorage.
 * Does NOT store binary PDF files to prevent quota exhaustion.
 */
export function saveProjectState(
  tender: TenderMetadata,
  requirements: Requirement[],
  matches: Record<string, RequirementMatch>,
  uploadedFiles: UploadedDoc[]
): boolean {
  try {
    const fileMap = new Map(uploadedFiles.map((f) => [f.id, f]));
    const savedMatches: SavedProjectState['savedMatches'] = {};

    for (const [reqId, m] of Object.entries(matches)) {
      const doc = m?.fileId ? fileMap.get(m.fileId) : null;
      savedMatches[reqId] = {
        requirementId: reqId,
        fileName: doc ? doc.name : null,
        expiryDate: m?.expiryDate || '',
      };
    }

    const state: SavedProjectState = {
      version: 1,
      timestamp: new Date().toISOString(),
      tender,
      requirements,
      savedMatches,
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    return true;
  } catch (err) {
    console.warn('Error saving project to localStorage:', err);
    return false;
  }
}

/**
 * Loads project metadata and match configuration from browser localStorage.
 */
export function loadSavedProjectState(): SavedProjectState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedProjectState;
    if (!parsed || !parsed.tender || !Array.isArray(parsed.requirements)) {
      return null;
    }
    return parsed;
  } catch (err) {
    console.warn('Error reading saved project from localStorage:', err);
    return null;
  }
}
