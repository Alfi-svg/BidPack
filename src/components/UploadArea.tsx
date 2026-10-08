import React, { useRef, useState } from 'react';
import { Language } from '../types/tender';
import { t } from '../i18n/translations';
import { UploadCloud, FolderPlus } from 'lucide-react';

interface UploadAreaProps {
  lang: Language;
  onFilesSelected: (files: File[]) => void;
  currentCount: number;
  maxFiles?: number;
  maxTotalBytes?: number;
}

export const UploadArea: React.FC<UploadAreaProps> = ({
  lang,
  onFilesSelected,
  currentCount,
  maxFiles = 30,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesSelected(Array.from(e.target.files));
    }
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  return (
    <div className="upload-container">
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        style={{ display: 'none' }}
        onChange={handleInputChange}
      />

      <div className="upload-helper-desc">
        {t(lang, 'upload', 'helper')}
      </div>

      <div
        className={`upload-dropzone ${isDragOver ? 'dragover' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            inputRef.current?.click();
          }
        }}
      >
        <div className="upload-dropzone-icon">
          <UploadCloud size={38} strokeWidth={1.75} />
        </div>
        <div className="upload-title">{t(lang, 'upload', 'dragDropTitle')}</div>
        <div className="upload-subtitle">{t(lang, 'upload', 'subtitle')}</div>

        <button
          type="button"
          className="btn-liquid-primary"
          style={{ marginTop: '0.45rem' }}
          onClick={(e) => {
            e.stopPropagation();
            inputRef.current?.click();
          }}
          disabled={currentCount >= maxFiles}
        >
          <FolderPlus size={16} />
          {t(lang, 'upload', 'browseButton')}
        </button>
      </div>
    </div>
  );
};
