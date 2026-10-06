import React from 'react';
import {
  Requirement,
  UploadedDoc,
  RequirementMatch,
  Language,
} from '../types/tender';
import { validateRequirement } from '../lib/validation';
import { isHashAlreadyMatched } from '../lib/duplicate';
import { t } from '../i18n/translations';
import { formatFileSize } from './UploadedFileList';
import {
  FileCheck2,
  AlertCircle,
  Clock,
  XCircle,
  CheckCircle2,
  Calendar,
  X,
} from 'lucide-react';

interface RequirementCardProps {
  requirement: Requirement;
  allRequirements: Requirement[];
  uploadedFiles: UploadedDoc[];
  matches: Record<string, RequirementMatch>;
  submissionDeadline: string;
  lang: Language;
  onMatchChange: (requirementId: string, fileId: string | null) => void;
  onExpiryChange: (requirementId: string, expiryDate: string) => void;
}

export const RequirementCard: React.FC<RequirementCardProps> = ({
  requirement,
  allRequirements,
  uploadedFiles,
  matches,
  submissionDeadline,
  lang,
  onMatchChange,
  onExpiryChange,
}) => {
  const currentMatch = matches[requirement.id];
  const matchedDoc = currentMatch?.fileId
    ? uploadedFiles.find((f) => f.id === currentMatch.fileId)
    : null;

  const currentExpiry = currentMatch?.expiryDate || '';

  // Calculate status with Exact Status Engine
  const validation = validateRequirement(requirement, currentMatch, submissionDeadline, lang);

  const title = lang === 'bn' ? requirement.title_bn : requirement.title_en;

  // Map other requirements to check assignments
  const fileToRequirementOrder = new Map<string, number>();
  for (const [reqId, m] of Object.entries(matches)) {
    if (m?.fileId && reqId !== requirement.id) {
      const otherReq = allRequirements.find((r) => r.id === reqId);
      if (otherReq) {
        fileToRequirementOrder.set(m.fileId, otherReq.order);
      }
    }
  }

  // Simplified map of matches for duplicate detection
  const matchMapForDuplicates: Record<string, string | null> = {};
  for (const [rId, m] of Object.entries(matches)) {
    matchMapForDuplicates[rId] = m.fileId;
  }

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    onMatchChange(requirement.id, val ? val : null);
  };

  const renderStatusBadge = () => {
    switch (validation.status) {
      case 'missing':
        return (
          <span className="badge badge-missing">
            <AlertCircle size={12} />
            {t(lang, 'status', 'missing')}
          </span>
        );
      case 'expiry_needed':
        return (
          <span className="badge badge-expiry-needed">
            <Clock size={12} />
            {t(lang, 'status', 'expiry_needed')}
          </span>
        );
      case 'expired':
        return (
          <span className="badge badge-expired">
            <XCircle size={12} />
            {t(lang, 'status', 'expired')}
          </span>
        );
      case 'not_provided':
        return (
          <span className="badge badge-not-provided">
            {t(lang, 'status', 'not_provided')}
          </span>
        );
      case 'ok':
        return (
          <span className="badge badge-ok">
            <CheckCircle2 size={12} />
            {t(lang, 'status', 'ok')}
          </span>
        );
    }
  };

  return (
    <div className={`req-card status-${validation.status}`}>
      <div className="req-card-top">
        <div className="req-title-wrap">
          <div className="req-order-pill">#{requirement.order}</div>
          <span className="req-title">{title}</span>

          {requirement.mandatory ? (
            <span className="badge badge-mandatory">{t(lang, 'matching', 'mandatory')}</span>
          ) : (
            <span className="badge badge-optional">{t(lang, 'matching', 'optional')}</span>
          )}
        </div>

        <div>{renderStatusBadge()}</div>
      </div>

      {/* Document Selector */}
      <div className="req-match-control">
        <select
          className="doc-select"
          value={matchedDoc ? matchedDoc.id : ''}
          onChange={handleSelectChange}
          aria-label={`Select document for ${title}`}
        >
          <option value="">{t(lang, 'matching', 'selectPrompt')}</option>
          {uploadedFiles.map((file) => {
            const isAssignedElsewhere = fileToRequirementOrder.has(file.id);
            const assignedOrder = fileToRequirementOrder.get(file.id);

            // Prevent duplicate copies from being matched to different requirements
            const isDuplicateOfMatched = isHashAlreadyMatched(
              file.hash,
              requirement.id,
              matchMapForDuplicates,
              uploadedFiles
            );

            const isCorrupted = file.status === 'corrupted';
            const isDisabled =
              isCorrupted || (isAssignedElsewhere && file.id !== matchedDoc?.id) || isDuplicateOfMatched;

            let extraLabel = '';
            if (isCorrupted) {
              extraLabel = ` [${t(lang, 'upload', 'corrupted')}]`;
            } else if (isAssignedElsewhere) {
              extraLabel = ` ${t(lang, 'matching', 'alreadyAssigned', { order: assignedOrder || 0 })}`;
            } else if (isDuplicateOfMatched) {
              extraLabel = ` ${t(lang, 'matching', 'duplicateDisabled', { name: file.duplicateOf || 'copy' })}`;
            }

            return (
              <option key={file.id} value={file.id} disabled={isDisabled}>
                {file.name} ({formatFileSize(file.size)}){extraLabel}
              </option>
            );
          })}
        </select>

        {matchedDoc && (
          <button
            type="button"
            className="btn-danger-sm"
            onClick={() => onMatchChange(requirement.id, null)}
            title={t(lang, 'matching', 'clearMatch')}
          >
            <X size={13} />
            <span>{t(lang, 'matching', 'clearMatch')}</span>
          </button>
        )}
      </div>

      {/* Selected file info card */}
      {matchedDoc && (
        <div className="matched-doc-display">
          <div className="matched-doc-name">
            <FileCheck2 size={16} />
            <span>{matchedDoc.name}</span>
          </div>
          <div style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', fontSize: '0.75rem' }}>
            <span>{formatFileSize(matchedDoc.size)}</span>
            {matchedDoc.pageCount !== null && (
              <span className="file-meta-pill">
                {matchedDoc.pageCount}{' '}
                {t(lang, 'matching', 'pages')}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Expiry date input if requirement has expiry AND a file is matched */}
      {requirement.has_expiry && matchedDoc && (
        <div className="expiry-row">
          <Calendar size={15} color="#475569" />
          <label htmlFor={`expiry-${requirement.id}`} className="expiry-label">
            {t(lang, 'matching', 'expiryDateLabel')}:
          </label>
          <input
            id={`expiry-${requirement.id}`}
            type="date"
            className="expiry-input"
            value={currentExpiry}
            onChange={(e) => onExpiryChange(requirement.id, e.target.value)}
          />

          {currentExpiry ? (
            validation.status === 'expired' ? (
              <span className="badge badge-expired">
                {t(lang, 'matching', 'expiryInvalid')}
              </span>
            ) : (
              <span className="badge badge-ok">
                {t(lang, 'matching', 'expiryValid')}
              </span>
            )
          ) : (
            <span className="expiry-hint">
              {t(lang, 'matching', 'expiryDateHint', { deadline: submissionDeadline })}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
