import React from 'react';
import { Language } from '../types/tender';
import { t } from '../i18n/translations';
import { FileCode, UploadCloud, CheckSquare, PackageCheck, Check, AlertCircle } from 'lucide-react';

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
      num: '01',
      icon: FileCode,
      label: t(lang, 'workflow', 'step1'),
      instruction: t(lang, 'workflow', 'step1Desc'),
      isCompleted: hasTender,
      isActive: !hasTender,
      isBlocked: false,
    },
    {
      id: 2,
      num: '02',
      icon: UploadCloud,
      label: t(lang, 'workflow', 'step2'),
      instruction: t(lang, 'workflow', 'step2Desc'),
      isCompleted: hasFiles,
      isActive: hasTender && !hasFiles,
      isBlocked: false,
    },
    {
      id: 3,
      num: '03',
      icon: CheckSquare,
      label: t(lang, 'workflow', 'step3'),
      instruction: t(lang, 'workflow', 'step3Desc'),
      isCompleted: isReady,
      isActive: hasTender && hasFiles && !isReady,
      isBlocked: hasTender && hasFiles && !isReady,
    },
    {
      id: 4,
      num: '04',
      icon: PackageCheck,
      label: t(lang, 'workflow', 'step4'),
      instruction: t(lang, 'workflow', 'step4Desc'),
      isCompleted: false,
      isActive: isReady,
      isBlocked: false,
    },
  ];

  return (
    <div className="workflow-bar" aria-label="Workflow progress">
      {steps.map((step) => {
        const IconComponent = step.icon;
        let stepClass = 'workflow-step glass-capsule';
        if (step.isCompleted) {
          stepClass += ' completed';
        } else if (step.isActive) {
          stepClass += step.isBlocked ? ' active blocked' : ' active';
        } else {
          stepClass += ' pending';
        }

        return (
          <div key={step.id} className={stepClass}>
            <div className="step-badge-wrap">
              <span className="step-num-code">{step.num}</span>
              <div className="step-icon-bubble">
                {step.isCompleted ? (
                  <Check size={14} strokeWidth={2.5} />
                ) : step.isBlocked ? (
                  <AlertCircle size={14} strokeWidth={2} />
                ) : (
                  <IconComponent size={14} strokeWidth={2} />
                )}
              </div>
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
