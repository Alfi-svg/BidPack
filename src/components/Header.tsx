import React from 'react';
import { Language } from '../types/tender';
import { t } from '../i18n/translations';
import { RotateCcw, ShieldCheck, User } from 'lucide-react';

interface HeaderProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  onReset: () => void;
  hasLoadedTender: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onLanguageChange,
  onReset,
  hasLoadedTender,
}) => {
  return (
    <header className="app-header glass-header">
      {/* LEFT: Brand, Name & Tagline */}
      <div className="header-brand">
        <img
          src="/assets/bidpack-logo.png"
          alt="BidPack logo"
          className="header-logo"
        />
        <div className="brand-text-col">
          <div className="brand-name">BidPack</div>
          <div className="brand-tagline">{t(lang, 'tagline')}</div>
        </div>
      </div>

      {/* CENTER: Official Portal Pill */}
      <div className="header-center">
        <div className="official-portal-pill">
          <span className="portal-pulse-dot" />
          <ShieldCheck size={13} className="portal-icon" />
          <span>{t(lang, 'header', 'officialPortal')}</span>
        </div>
      </div>

      {/* RIGHT: Actions & Language Toggle */}
      <div className="header-actions">
        {hasLoadedTender && (
          <button
            type="button"
            className="btn-glass-secondary btn-reset"
            onClick={onReset}
            title={t(lang, 'common', 'reset')}
          >
            <RotateCcw size={13} />
            <span>{t(lang, 'common', 'reset')}</span>
          </button>
        )}

        <div className="lang-toggle-glass" role="group" aria-label="Language selector">
          <button
            type="button"
            className={`lang-btn-glass ${lang === 'en' ? 'active' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`lang-btn-glass ${lang === 'bn' ? 'active' : ''}`}
            onClick={() => onLanguageChange('bn')}
          >
            বাংলা
          </button>
        </div>

        {/* Visual Workspace Profile Pill */}
        <div className="header-profile-pill" title="Workspace: Verified Office Operator">
          <div className="profile-avatar">
            <User size={13} />
          </div>
        </div>
      </div>
    </header>
  );
};
