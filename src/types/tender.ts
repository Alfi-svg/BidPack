export interface TenderMetadata {
  tender_id: string;
  title: string;
  procuring_entity: string;
  bidder: string;
  submission_deadline: string;
}

export interface Requirement {
  id: string;
  order: number;
  title_en: string;
  title_bn: string;
  mandatory: boolean;
  has_expiry: boolean;
}

export interface RequirementsConfig {
  tender: TenderMetadata;
  requirements: Requirement[];
}

export type FileProcessingStatus = 'processing' | 'ready' | 'corrupted' | 'error';

export interface UploadedDoc {
  id: string;
  file: File;
  name: string;
  size: number;
  hash: string;
  pageCount: number | null;
  status: FileProcessingStatus;
  errorMessage?: string;
  isDuplicate: boolean;
  duplicateOf?: string; // name of the first file sharing the same hash
  duplicateFileIds: string[]; // ids of all files sharing this hash
}

export type RequirementStatusType =
  | 'missing'
  | 'expiry_needed'
  | 'expired'
  | 'not_provided'
  | 'ok';

export interface RequirementMatch {
  requirementId: string;
  fileId: string | null;
  expiryDate?: string;
}

export interface RequirementValidation {
  status: RequirementStatusType;
  isBlocking: boolean;
  reasonEn: string;
  reasonBn: string;
}

export interface PackageReadiness {
  totalRequirements: number;
  readyCount: number;
  blockingCount: number;
  isReady: boolean;
  blockingReasonsEn: string[];
  blockingReasonsBn: string[];
}

export type Language = 'en' | 'bn';
