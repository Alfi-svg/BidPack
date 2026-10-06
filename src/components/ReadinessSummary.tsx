import React from 'react';
import { PackageReadiness, Language } from '../types/tender';
import { t } from '../i18n/translations';
import { Package, ShieldAlert, CheckCircle2, Download, Loader2 } from 'lucide-react';

interface ReadinessSummaryProps {
  readiness: PackageReadiness;
  optionalCount: number;
  firstBlockingReqId: string | null;
  lang: Language;
  onGeneratePackage: () => void;
  onExportChecklist: () => void;
  onSaveProject: () => void;
  onReopenProject: () => void;
  hasSavedProject: boolean;
  isGenerating: boolean;
}

export const ReadinessSummary: React.FC<ReadinessSummaryProps> = ({
  readiness,
  optionalCount,
  firstBlockingReqId,
  lang,
  onGeneratePackage,
  onExportChecklist,
  onSaveProject,
  onReopenProject,
  hasSavedProject,
  isGenerating,
}) => {
  const blockingReasons =
    lang === 'bn' ? readiness.blockingReasonsBn : readiness.blockingReasonsEn;

  const handleJumpToIssue = () => {
    if (!firstBlockingReqId) return;
    const el = document.getElementById(`req-card-${firstBlockingReqId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      el.classList.add('highlight-pulse');
      setTimeout(() => el.classList.remove('highlight-pulse'), 2000);
    }
  };

  return (
    <div className="readiness-card">
      <div className="readiness-header">
        <h2 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7 }}>
          <Package size={19} />
          {t(lang, 'readiness', 'title')}
        </h2>

        {/* 4-Metric Grid */}
        <div className="readiness-counters">
          <div className="stat-pill">
            <span className="stat-number">{readiness.totalRequirements}</span>
            <span className="stat-desc">{t(lang, 'readiness', 'statTotal')}</span>
          </div>

          <div className="stat-pill">
            <span className="stat-number is-ready">{readiness.readyCount}</span>
            <span className="stat-desc">{t(lang, 'readiness', 'statReady')}</span>
          </div>

          <div className="stat-pill">
            <span className="stat-number" style={{ color: 'var(--neutral-gray)' }}>{optionalCount}</span>
            <span className="stat-desc">{t(lang, 'readiness', 'statOptional')}</span>
          </div>

          <div className="stat-pill">
            <span className={`stat-number ${readiness.blockingCount > 0 ? 'has-blocking' : 'is-ready'}`}>
              {readiness.blockingCount}
            </span>
            <span className="stat-desc">{t(lang, 'readiness', 'statBlocking')}</span>
          </div>
        </div>
      </div>

      {/* Main Readiness Banner */}
      <div style={{ marginBottom: '1.15rem' }}>
        {readiness.isReady ? (
          <div className="ready-success-box" role="status">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <CheckCircle2 size={18} color="var(--success-color)" />
              <span>✓ {t(lang, 'readiness', 'readyToGenerate')} — {t(lang, 'readiness', 'packageReadyDesc')}</span>
            </div>
          </div>
        ) : (
          <div
            className="blocking-alert-banner"
            onClick={handleJumpToIssue}
            role="button"
            tabIndex={0}
            title={t(lang, 'readiness', 'clickToFocus')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <ShieldAlert size={18} />
              <span>
                ⚠{' '}
                {t(
                  lang,
                  'readiness',
                  readiness.blockingCount === 1 ? 'issuesNeedAttention' : 'issuesNeedAttentionPlural',
                  { count: readiness.blockingCount }
                )}
              </span>
            </div>
            <span className="jump-hint">{t(lang, 'readiness', 'clickToFocus')} →</span>
          </div>
        )}
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

      {/* Action Row */}
      <div className="readiness-actions-row">
        <div className="secondary-actions">
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={onExportChecklist}
            title={t(lang, 'readiness', 'exportChecklist')}
          >
            <span>{t(lang, 'readiness', 'exportChecklist')}</span>
          </button>

          <button
            type="button"
            className="btn-secondary-sm"
            onClick={onSaveProject}
            title={t(lang, 'readiness', 'saveProject')}
          >
            <span>{t(lang, 'readiness', 'saveProject')}</span>
          </button>

          {hasSavedProject && (
            <button
              type="button"
              className="btn-secondary-sm"
              onClick={onReopenProject}
              title={t(lang, 'readiness', 'reopenProject')}
            >
              <span>{t(lang, 'readiness', 'reopenProject')}</span>
            </button>
          )}
        </div>

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
    </div>
  );
};
