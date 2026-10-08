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

  const deadlineInfo = tender?.submission_deadline ? (() => {
    const d = new Date(tender.submission_deadline);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return {
      isPast: diffDays < 0,
      isApproaching: diffDays >= 0 && diffDays <= 7,
      days: diffDays,
    };
  })() : null;

  return (
    <div className="card glass-card">
      <div className="card-header">
        <h2>
          <FileCode size={18} className="header-icon-primary" />
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
              <FileUp size={40} strokeWidth={1.5} />
            </div>
            <h3 className="empty-tender-title">{t(lang, 'tenderInfo', 'emptyTitle')}</h3>
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
              <div className="meta-label">
                <span className="icon-pill icon-pill-blue">
                  <Hash size={13} />
                </span>
                {t(lang, 'tenderInfo', 'tenderId')}
              </div>
              <div className="meta-val highlight">{tender.tender_id}</div>
            </div>

            <div className="meta-field title-field">
              <div className="meta-label">
                <span className="icon-pill icon-pill-purple">
                  <FileCode size={13} />
                </span>
                {t(lang, 'tenderInfo', 'tenderTitle')}
              </div>
              <div className="meta-val meta-val-title">{tender.title}</div>
            </div>

            <div className="meta-field">
              <div className="meta-label">
                <span className="icon-pill icon-pill-indigo">
                  <Building2 size={13} />
                </span>
                {t(lang, 'tenderInfo', 'procuringEntity')}
              </div>
              <div className="meta-val">{tender.procuring_entity}</div>
            </div>

            <div className="meta-field">
              <div className="meta-label">
                <span className="icon-pill icon-pill-teal">
                  <User size={13} />
                </span>
                {t(lang, 'tenderInfo', 'bidder')}
              </div>
              <div className="meta-val">{tender.bidder}</div>
            </div>

            <div className="meta-field">
              <div className="meta-label">
                <span className="icon-pill icon-pill-amber">
                  <Calendar size={13} />
                </span>
                {t(lang, 'tenderInfo', 'deadline')}
              </div>
              <div className="deadline-val-wrap">
                <span className="meta-val highlight">{tender.submission_deadline}</span>
                {deadlineInfo?.isPast && (
                  <span className="badge badge-expired" style={{ fontSize: '0.6875rem' }}>
                    {t(lang, 'tenderInfo', 'pastDeadline')}
                  </span>
                )}
                {deadlineInfo?.isApproaching && (
                  <span className="badge badge-expiry-needed" style={{ fontSize: '0.6875rem' }}>
                    {t(lang, 'tenderInfo', 'approaching')} ({deadlineInfo.days}d)
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
