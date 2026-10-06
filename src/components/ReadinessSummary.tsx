import React from 'react';
import { PackageReadiness, Language } from '../types/tender';
import { t } from '../i18n/translations';
import { Package, ShieldAlert, CheckCircle2, Download, Loader2 } from 'lucide-react';

interface ReadinessSummaryProps {
  readiness: PackageReadiness;
  lang: Language;
  onGeneratePackage: () => void;
  isGenerating: boolean;
}

export const ReadinessSummary: React.FC<ReadinessSummaryProps> = ({
  readiness,
  lang,
  onGeneratePackage,
  isGenerating,
}) => {
  const blockingReasons =
    lang === 'bn' ? readiness.blockingReasonsBn : readiness.blockingReasonsEn;

  return (
    <div className="readiness-card">
      <div className="readiness-header">
        <h2 style={{ fontSize: '1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Package size={18} />
          {t(lang, 'readiness', 'title')}
        </h2>

        <div className="readiness-counters">
          <div className="stat-pill">
            <span className={`stat-number ${readiness.isReady ? 'is-ready' : ''}`}>
              {readiness.readyCount} / {readiness.totalRequirements}
            </span>
            <span className="stat-desc">
              {t(lang, 'readiness', 'summary', {
                ready: readiness.readyCount,
                total: readiness.totalRequirements,
              })}
            </span>
          </div>

          {readiness.blockingCount > 0 && (
            <div className="stat-pill">
              <span className="stat-number has-blocking">
                {readiness.blockingCount}
              </span>
              <span className="stat-desc">
                {t(
                  lang,
                  'readiness',
                  readiness.blockingCount === 1 ? 'blockingIssues' : 'blockingIssuesPlural',
                  { count: readiness.blockingCount }
                )}
              </span>
            </div>
          )}
        </div>
      </div>

      {readiness.blockingCount > 0 && (
        <div className="blocking-reasons-box" role="alert">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
            <ShieldAlert size={15} />
            <span>{t(lang, 'readiness', 'blockingReasonsTitle')}</span>
          </div>
          <ul>
            {blockingReasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {readiness.isReady && (
        <div className="ready-success-box" role="status">
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <CheckCircle2 size={16} />
            <span>{t(lang, 'readiness', 'noBlocking')}</span>
          </div>
        </div>
      )}

      <button
        type="button"
        className="btn-primary btn-generate-main"
        disabled={!readiness.isReady || isGenerating}
        onClick={onGeneratePackage}
      >
        {isGenerating ? (
          <>
            <Loader2 size={16} className="spin-icon" />
            <span>{t(lang, 'readiness', 'generating')}</span>
          </>
        ) : (
          <>
            <Download size={16} />
            <span>{t(lang, 'readiness', 'generateButton')}</span>
          </>
        )}
      </button>
    </div>
  );
};
