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
    <header className="app-header">
      <div className="header-brand">
        <img
          src="/assets/bidpack-logo.png"
          alt="BidPack logo"
          className="header-logo"
        />
      </div>

      <div className="header-actions">
        {hasLoadedTender && (
          <button
            type="button"
            className="btn-secondary-sm"
            onClick={onReset}
            title={t(lang, 'common', 'reset')}
          >
            <RotateCcw size={14} />
            <span>{t(lang, 'common', 'reset')}</span>
          </button>
        )}

        <div className="lang-toggle" role="group" aria-label="Language selector">
          <button
            type="button"
            className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
            onClick={() => onLanguageChange('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`lang-btn ${lang === 'bn' ? 'active' : ''}`}
            onClick={() => onLanguageChange('bn')}
          >
            বাংলা
          </button>
        </div>
      </div>
    </header>
  );
};
