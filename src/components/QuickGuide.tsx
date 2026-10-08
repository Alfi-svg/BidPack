import React from 'react';
import { Language } from '../types/tender';
import { t } from '../i18n/translations';
import { Compass, Lightbulb, CheckCircle2 } from 'lucide-react';

interface QuickGuideProps {
  lang: Language;
}

export const QuickGuide: React.FC<QuickGuideProps> = ({ lang }) => {
  const steps = [
    {
      num: '01',
      title: t(lang, 'quickGuide', 'step1Title'),
      desc: t(lang, 'quickGuide', 'step1Desc'),
      color: 'bubble-blue',
    },
    {
      num: '02',
      title: t(lang, 'quickGuide', 'step2Title'),
      desc: t(lang, 'quickGuide', 'step2Desc'),
      color: 'bubble-cyan',
    },
    {
      num: '03',
      title: t(lang, 'quickGuide', 'step3Title'),
      desc: t(lang, 'quickGuide', 'step3Desc'),
      color: 'bubble-indigo',
    },
    {
      num: '04',
      title: t(lang, 'quickGuide', 'step4Title'),
      desc: t(lang, 'quickGuide', 'step4Desc'),
      color: 'bubble-mint',
    },
  ];

  const tips = [
    t(lang, 'tips', 'tip1'),
    t(lang, 'tips', 'tip2'),
    t(lang, 'tips', 'tip3'),
    t(lang, 'tips', 'tip4'),
    t(lang, 'tips', 'tip5'),
    t(lang, 'tips', 'tip6'),
  ];

  return (
    <div className="quick-guide-container">
      {/* Quick Guide Card */}
      <div className="card glass-card quick-guide-panel">
        <div className="card-header">
          <h2>
            <Compass size={17} className="header-icon-primary" />
            {t(lang, 'quickGuide', 'title')}
          </h2>
        </div>
        <div className="card-body">
          <div className="guide-steps-list">
            {steps.map((st) => (
              <div key={st.num} className="guide-step-item">
                <div className={`guide-step-bubble ${st.color}`}>{st.num}</div>
                <div className="guide-step-content">
                  <div className="guide-step-title">{st.title}</div>
                  <div className="guide-step-desc">{st.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tips for Better Results Card */}
      <div className="card glass-card tips-panel" style={{ marginTop: '1.25rem' }}>
        <div className="card-header">
          <h2>
            <Lightbulb size={17} className="header-icon-primary" />
            {t(lang, 'tips', 'title')}
          </h2>
        </div>
        <div className="card-body">
          <ul className="tips-list">
            {tips.map((tip, idx) => (
              <li key={idx} className="tip-item">
                <CheckCircle2 size={13} className="tip-icon" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
export default QuickGuide;
