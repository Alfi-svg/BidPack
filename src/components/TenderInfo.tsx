import React, { useRef } from 'react';
import { TenderMetadata, Language } from '../types/tender';
import { t } from '../i18n/translations';
import { FileCode, FileUp, Calendar, Building2, User, Hash } from 'lucide-react';

interface TenderInfoProps {
  tender: TenderMetadata | null;
  lang: Language;
  onFileSelect: (file: File) => void;
}

export const TenderInfo: React.FC<TenderInfoProps> = ({ tender, lang, onFileSelect }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset file input so user can re-upload if needed
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  return (
    <div className="card">
      <div className="card-header">
        <h2>
          <FileCode size={18} />
          {t(lang, 'tenderInfo', 'title')}
        </h2>
        {tender && (
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <FileUp size={14} />
            {t(lang, 'tenderInfo', 'reloadButton')}
          </button>
        )}
      </div>

      <div className="card-body">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json,application/json"
          style={{ display: 'none' }}
          onChange={handleInputChange}
        />

        {!tender ? (
          <div
            className="empty-tender-box"
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
          >
            <div className="empty-tender-icon">
              <FileUp size={36} strokeWidth={1.5} />
            </div>
            <p className="empty-tender-text">
              {t(lang, 'tenderInfo', 'loadPrompt')}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => fileInputRef.current?.click()}
            >
              <FileUp size={16} />
              {t(lang, 'tenderInfo', 'loadButton')}
            </button>
          </div>
        ) : (
          <div className="tender-meta-grid">
            <div className="meta-field">
              <span className="meta-label">
                <Hash size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t(lang, 'tenderInfo', 'tenderId')}
              </span>
              <span className="meta-val highlight">{tender.tender_id}</span>
            </div>

            <div className="meta-field" style={{ gridColumn: 'span 2' }}>
              <span className="meta-label">{t(lang, 'tenderInfo', 'tenderTitle')}</span>
              <span className="meta-val">{tender.title}</span>
            </div>

            <div className="meta-field">
              <span className="meta-label">
                <Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t(lang, 'tenderInfo', 'procuringEntity')}
              </span>
              <span className="meta-val">{tender.procuring_entity}</span>
            </div>

            <div className="meta-field">
              <span className="meta-label">
                <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t(lang, 'tenderInfo', 'bidder')}
              </span>
              <span className="meta-val">{tender.bidder}</span>
            </div>

            <div className="meta-field">
              <span className="meta-label">
                <Calendar size={12} style={{ display: 'inline', marginRight: 4 }} />
                {t(lang, 'tenderInfo', 'deadline')}
              </span>
              <span className="meta-val highlight">{tender.submission_deadline}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
