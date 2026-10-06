import React from 'react';
import { Language } from '../types/tender';
import { t } from '../i18n/translations';
import { Check } from 'lucide-react';

interface WorkflowStepsProps {
  lang: Language;
  hasTender: boolean;
  hasFiles: boolean;
  isReady: boolean;
}

export const WorkflowSteps: React.FC<WorkflowStepsProps> = ({
  lang,
  hasTender,
  hasFiles,
  isReady,
}) => {
  const steps = [
    {
      id: 1,
      label: t(lang, 'workflow', 'step1'),
      instruction: t(lang, 'workflow', 'step1Desc'),
      isCompleted: hasTender,
      isActive: !hasTender,
    },
    {
      id: 2,
      label: t(lang, 'workflow', 'step2'),
      instruction: t(lang, 'workflow', 'step2Desc'),
      isCompleted: hasFiles,
      isActive: hasTender && !hasFiles,
    },
    {
      id: 3,
      label: t(lang, 'workflow', 'step3'),
      instruction: t(lang, 'workflow', 'step3Desc'),
      isCompleted: isReady,
      isActive: hasTender && hasFiles && !isReady,
    },
    {
      id: 4,
      label: t(lang, 'workflow', 'step4'),
      instruction: t(lang, 'workflow', 'step4Desc'),
      isCompleted: false,
      isActive: isReady,
    },
  ];

  return (
    <div className="workflow-bar" aria-label="Workflow progress">
      {steps.map((step) => {
        let stepClass = 'workflow-step';
        if (step.isCompleted) {
          stepClass += ' completed';
        } else if (step.isActive) {
          stepClass += ' active';
        }

        return (
          <div key={step.id} className={stepClass}>
            <div className="step-num">
              {step.isCompleted ? <Check size={13} strokeWidth={3} /> : step.id}
            </div>
            <div className="step-text-wrap">
              <span className="step-label">{step.label}</span>
              <span className="step-instruction">{step.instruction}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
