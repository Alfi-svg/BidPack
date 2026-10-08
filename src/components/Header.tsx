import React from 'react';
import { Language } from '../types/tender';
import { t } from '../i18n/translations';
import { RotateCcw } from 'lucide-react';

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
      {/* LEFT: Clean Approved Brand Logo */}
      <div className="header-brand">
        <img
          src="/assets/bidpack-logo.png"
          alt="BidPack"
          className="header-logo"
        />
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
      </div>
    </header>
  );
};
