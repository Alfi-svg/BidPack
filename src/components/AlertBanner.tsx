import React from 'react';
import { AlertCircle, CheckCircle, AlertTriangle, X } from 'lucide-react';

export type AlertType = 'error' | 'warning' | 'success';

interface AlertBannerProps {
  type: AlertType;
  message: string;
  onDismiss: () => void;
}

export const AlertBanner: React.FC<AlertBannerProps> = ({ type, message, onDismiss }) => {
  if (!message) return null;

  return (
    <div className={`alert-banner ${type}`} role="alert">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        {type === 'error' && <AlertCircle size={16} style={{ flexShrink: 0 }} />}
        {type === 'warning' && <AlertTriangle size={16} style={{ flexShrink: 0 }} />}
        {type === 'success' && <CheckCircle size={16} style={{ flexShrink: 0 }} />}
        <span>{message}</span>
      </div>

      <button
        type="button"
        onClick={onDismiss}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'inherit',
          display: 'flex',
          padding: 2,
        }}
        aria-label="Dismiss message"
      >
        <X size={14} />
      </button>
    </div>
  );
};
