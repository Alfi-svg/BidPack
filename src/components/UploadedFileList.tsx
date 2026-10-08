import React from 'react';
import { UploadedDoc, Language } from '../types/tender';
import { t } from '../i18n/translations';
import { FileText, Trash2, Loader2, AlertTriangle, AlertCircle, Files } from 'lucide-react';

interface UploadedFileListProps {
  files: UploadedDoc[];
  lang: Language;
  onRemoveFile: (id: string) => void;
  onClearAll: () => void;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export const UploadedFileList: React.FC<UploadedFileListProps> = ({
  files,
  lang,
  onRemoveFile,
  onClearAll,
}) => {
  if (files.length === 0) {
    return null;
  }

  const totalBytes = files.reduce((acc, f) => acc + f.size, 0);

  return (
    <div style={{ marginTop: '1.25rem' }}>
      <div className="files-summary-bar">
        <span>
          <Files size={14} style={{ display: 'inline', marginRight: 4, verticalAlign: -2 }} />
          {t(
            lang,
            'upload',
            files.length === 1 ? 'uploadedCount' : 'uploadedCountPlural',
            { count: files.length }
          )}{' '}
          • {t(lang, 'upload', 'totalSize', { size: formatFileSize(totalBytes) })}
        </span>

        <button
          type="button"
          className="btn-glass-danger"
          onClick={onClearAll}
          title={t(lang, 'upload', 'clearAll')}
        >
          <Trash2 size={12} />
          <span>{t(lang, 'upload', 'clearAll')}</span>
        </button>
      </div>

      <div className="files-list">
        {files.map((file) => {
          const isProcessing = file.status === 'processing';
          const isCorrupted = file.status === 'corrupted';

          return (
            <div
              key={file.id}
              className={`file-item-glass ${file.isDuplicate ? 'is-duplicate' : ''}`}
            >
              <div className="file-info">
                <div className="pdf-icon-bubble">
                  <FileText size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div className="file-name" title={file.name}>
                    {file.name}
                  </div>
                  <div className="file-meta">
                    <span className="file-size-text">{formatFileSize(file.size)}</span>

                    {isProcessing && (
                      <span className="file-meta-pill glass-pill" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Loader2 size={11} className="spin-icon" />
                        {t(lang, 'upload', 'processing')}
                      </span>
                    )}

                    {!isProcessing && !isCorrupted && file.pageCount !== null && (
                      <span className="file-meta-pill glass-pill">
                        {t(
                          lang,
                          'upload',
                          file.pageCount === 1 ? 'pageCount' : 'pageCountPlural',
                          { count: file.pageCount }
                        )}
                      </span>
                    )}

                    {isCorrupted && (
                      <span
                        className="badge-liquid badge-liquid-missing"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        title={file.errorMessage}
                      >
                        <AlertCircle size={11} />
                        {t(lang, 'upload', 'processingFailed')}
                      </span>
                    )}

                    {file.isDuplicate && (
                      <span
                        className="badge-liquid badge-liquid-duplicate"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        title={file.duplicateOf ? `Duplicate of ${file.duplicateOf}` : undefined}
                      >
                        <AlertTriangle size={11} />
                        {t(lang, 'upload', 'duplicateWarning', {
                          name: file.duplicateOf || 'another document',
                        })}
                      </span>
                    )}
                  </div>

                  {isCorrupted && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--blocking-color)', marginTop: 4, lineHeight: 1.35 }}>
                      {file.errorMessage || t(lang, 'errors', 'pdfProcessingError')}
                    </div>
                  )}
                </div>
              </div>

              <div className="file-actions">
                <button
                  type="button"
                  className="btn-glass-danger btn-icon-only"
                  onClick={() => onRemoveFile(file.id)}
                  title={`${t(lang, 'upload', 'remove')} ${file.name}`}
                  aria-label={`${t(lang, 'upload', 'remove')} ${file.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
