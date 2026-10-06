import React, { useState, useMemo } from 'react';
import {
  TenderMetadata,
  Requirement,
  UploadedDoc,
  RequirementMatch,
  Language,
} from './types/tender';
import { t } from './i18n/translations';
import { Header } from './components/Header';
import { WorkflowSteps } from './components/WorkflowSteps';
import { TenderInfo } from './components/TenderInfo';
import { UploadArea } from './components/UploadArea';
import { UploadedFileList } from './components/UploadedFileList';
import { RequirementCard } from './components/RequirementCard';
import { ReadinessSummary } from './components/ReadinessSummary';
import { AlertBanner, AlertType } from './components/AlertBanner';
import { parseRequirementsJson, calculatePackageReadiness } from './lib/validation';
import { calculateFileHash, identifyDuplicates } from './lib/duplicate';
import { countPdfPages, generateTenderPackage, downloadPdfFile } from './lib/pdf';
import { Files } from 'lucide-react';

const MAX_FILES = 30;
const MAX_TOTAL_BYTES = 50 * 1024 * 1024; // 50 MB

export const App: React.FC = () => {
  const [lang, setLang] = useState<Language>('en');
  const [tender, setTender] = useState<TenderMetadata | null>(null);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedDoc[]>([]);
  const [matches, setMatches] = useState<Record<string, RequirementMatch>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);

  // Read requirements.json file selected by user
  const handleTenderFileSelect = async (file: File) => {
    try {
      const text = await file.text();
      const { config, error } = parseRequirementsJson(text, lang);

      if (error || !config) {
        setAlert({
          type: 'error',
          message: error || t(lang, 'errors', 'invalidJson'),
        });
        return;
      }

      setTender(config.tender);
      setRequirements(config.requirements);
      // Initialize or reset matches for the new requirements
      const newMatches: Record<string, RequirementMatch> = {};
      for (const req of config.requirements) {
        newMatches[req.id] = {
          requirementId: req.id,
          fileId: null,
          expiryDate: '',
        };
      }
      setMatches(newMatches);
      setAlert(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to read file';
      setAlert({
        type: 'error',
        message: `${t(lang, 'errors', 'invalidJson')} (${msg})`,
      });
    }
  };

  // Handle uploaded PDF files
  const handleFilesSelected = async (newFiles: File[]) => {
    setAlert(null);

    // 1. Filter out non-PDF files
    const nonPdfFiles: string[] = [];
    const validPdfFiles: File[] = [];

    for (const file of newFiles) {
      const isPdfMime = file.type === 'application/pdf';
      const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
      if (isPdfMime || isPdfExt) {
        validPdfFiles.push(file);
      } else {
        nonPdfFiles.push(file.name);
      }
    }

    if (nonPdfFiles.length > 0) {
      setAlert({
        type: 'error',
        message: t(lang, 'errors', 'onlyPdf', { files: nonPdfFiles.join(', ') }),
      });
    }

    if (validPdfFiles.length === 0) {
      return;
    }

    // 2. Check maximum 30 files limit
    const currentCount = uploadedFiles.length;
    let allowedFiles = validPdfFiles;
    if (currentCount + validPdfFiles.length > MAX_FILES) {
      const allowedCount = Math.max(0, MAX_FILES - currentCount);
      const rejectedCount = validPdfFiles.length - allowedCount;
      allowedFiles = validPdfFiles.slice(0, allowedCount);

      setAlert({
        type: 'warning',
        message: t(lang, 'errors', 'fileLimit', { count: rejectedCount }),
      });

      if (allowedFiles.length === 0) {
        return;
      }
    }

    // 3. Check 50 MB total size limit
    const currentTotalBytes = uploadedFiles.reduce((acc, f) => acc + f.size, 0);
    const newFilesTotalBytes = allowedFiles.reduce((acc, f) => acc + f.size, 0);

    if (currentTotalBytes + newFilesTotalBytes > MAX_TOTAL_BYTES) {
      setAlert({
        type: 'error',
        message: t(lang, 'errors', 'sizeLimit'),
      });
      return;
    }

    // Create initial docs in processing state
    const initialDocs: UploadedDoc[] = allowedFiles.map((file) => ({
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      file,
      name: file.name,
      size: file.size,
      hash: '',
      pageCount: null,
      status: 'processing',
      isDuplicate: false,
      duplicateFileIds: [],
    }));

    setUploadedFiles((prev) => identifyDuplicates([...prev, ...initialDocs]));

    // Asynchronously calculate SHA-256 hash and PDF page counts locally in browser
    for (const doc of initialDocs) {
      try {
        const hash = await calculateFileHash(doc.file);
        let pageCount: number | null = null;
        let fileStatus: UploadedDoc['status'] = 'ready';
        let errorMessage: string | undefined = undefined;

        try {
          pageCount = await countPdfPages(doc.file);
        } catch (pdfErr) {
          console.warn(`Error parsing PDF pages for ${doc.name}:`, pdfErr);
          fileStatus = 'corrupted';
          errorMessage = t(lang, 'errors', 'pdfProcessingError', { name: doc.name });
        }

        setUploadedFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === doc.id
              ? {
                  ...f,
                  hash,
                  pageCount,
                  status: fileStatus,
                  errorMessage,
                }
              : f
          );
          return identifyDuplicates(updated);
        });
      } catch (hashErr) {
        console.error(`Error hashing ${doc.name}:`, hashErr);
        setUploadedFiles((prev) => {
          const updated = prev.map((f) =>
            f.id === doc.id
              ? {
                  ...f,
                  status: 'error' as const,
                  errorMessage: 'Failed to read file hash',
                }
              : f
          );
          return identifyDuplicates(updated);
        });
      }
    }
  };

  // Remove a single uploaded document
  const handleRemoveFile = (fileId: string) => {
    // 1. Remove file
    setUploadedFiles((prev) => {
      const remaining = prev.filter((f) => f.id !== fileId);
      return identifyDuplicates(remaining);
    });

    // 2. Automatically clear any matches pointing to this file
    setMatches((prev) => {
      const updated = { ...prev };
      for (const reqId of Object.keys(updated)) {
        if (updated[reqId]?.fileId === fileId) {
          updated[reqId] = {
            ...updated[reqId],
            fileId: null,
          };
        }
      }
      return updated;
    });
  };

  // Clear all uploaded documents
  const handleClearAllFiles = () => {
    setUploadedFiles([]);
    setMatches((prev) => {
      const updated = { ...prev };
      for (const reqId of Object.keys(updated)) {
        updated[reqId] = {
          ...updated[reqId],
          fileId: null,
        };
      }
      return updated;
    });
  };

  // Change or clear a requirement's document match
  const handleMatchChange = (requirementId: string, fileId: string | null) => {
    setMatches((prev) => {
      const updated = { ...prev };

      // If assigning a file, make sure no other requirement is matched to it (1:1 rule)
      if (fileId) {
        for (const [rId, m] of Object.entries(updated)) {
          if (m?.fileId === fileId && rId !== requirementId) {
            updated[rId] = {
              ...m,
              fileId: null,
            };
          }
        }
      }

      updated[requirementId] = {
        requirementId,
        fileId,
        expiryDate: updated[requirementId]?.expiryDate || '',
      };

      return updated;
    });
  };

  // Change expiry date for a requirement
  const handleExpiryChange = (requirementId: string, expiryDate: string) => {
    setMatches((prev) => ({
      ...prev,
      [requirementId]: {
        ...(prev[requirementId] || { requirementId, fileId: null }),
        expiryDate,
      },
    }));
  };

  // Calculate Package Readiness in real-time
  const readiness = useMemo(() => {
    if (!tender || requirements.length === 0) {
      return {
        totalRequirements: 0,
        readyCount: 0,
        blockingCount: 0,
        isReady: false,
        blockingReasonsEn: [],
        blockingReasonsBn: [],
      };
    }
    return calculatePackageReadiness(requirements, matches, tender.submission_deadline);
  }, [tender, requirements, matches]);

  // Generate Tender Package
  const handleGeneratePackage = async () => {
    if (!readiness.isReady || !tender) return;

    setIsGenerating(true);
    setAlert(null);

    try {
      const mergedPdfBytes = await generateTenderPackage(
        tender,
        requirements,
        matches,
        uploadedFiles
      );

      const safeTenderId = tender.tender_id.replace(/[\\/:*?"<>|]/g, '_');
      const filename = `${safeTenderId}_Package.pdf`;

      downloadPdfFile(mergedPdfBytes, filename);

      setAlert({
        type: 'success',
        message: `${t(lang, 'readiness', 'downloadSuccess')} (${filename})`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown generation error';
      setAlert({
        type: 'error',
        message: t(lang, 'errors', 'mergeError', { message: msg }),
      });
    } finally {
      setIsGenerating(false);
    }
  };

  // Reset entire workspace
  const handleReset = () => {
    setTender(null);
    setRequirements([]);
    setUploadedFiles([]);
    setMatches({});
    setAlert(null);
  };

  return (
    <div className="app-container">
      <Header
        lang={lang}
        onLanguageChange={setLang}
        onReset={handleReset}
        hasLoadedTender={Boolean(tender)}
      />

      <WorkflowSteps
        lang={lang}
        hasTender={Boolean(tender)}
        hasFiles={uploadedFiles.length > 0}
        isReady={readiness.isReady}
      />

      {alert && (
        <AlertBanner
          type={alert.type}
          message={alert.message}
          onDismiss={() => setAlert(null)}
        />
      )}

      <div style={{ marginBottom: '1.5rem' }}>
        <TenderInfo
          tender={tender}
          lang={lang}
          onFileSelect={handleTenderFileSelect}
        />
      </div>

      {tender && (
        <ReadinessSummary
          readiness={readiness}
          lang={lang}
          onGeneratePackage={handleGeneratePackage}
          isGenerating={isGenerating}
        />
      )}

      <div className="workflow-workspace-grid">
        {/* Left Column: Requirements & Matching */}
        <div className="requirements-column">
          <div className="card">
            <div className="card-header">
              <div>
                <h2>{t(lang, 'matching', 'title')}</h2>
                <p style={{ fontSize: '0.8125rem', color: 'var(--text-dim)', marginTop: 2 }}>
                  {t(lang, 'matching', 'subtitle')}
                </p>
              </div>
            </div>

            <div className="card-body">
              {!tender || requirements.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-dim)' }}>
                  {t(lang, 'matching', 'emptyRequirements')}
                </div>
              ) : (
                <div className="requirements-container">
                  {requirements.map((req) => (
                    <RequirementCard
                      key={req.id}
                      requirement={req}
                      allRequirements={requirements}
                      uploadedFiles={uploadedFiles}
                      matches={matches}
                      submissionDeadline={tender.submission_deadline}
                      lang={lang}
                      onMatchChange={handleMatchChange}
                      onExpiryChange={handleExpiryChange}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Document Upload & File Inventory */}
        <div className="upload-column">
          <div className="card">
            <div className="card-header">
              <h2>
                <Files size={18} />
                {t(lang, 'upload', 'title')}
              </h2>
            </div>
            <div className="card-body">
              <UploadArea
                lang={lang}
                onFilesSelected={handleFilesSelected}
                currentCount={uploadedFiles.length}
                maxFiles={MAX_FILES}
                maxTotalBytes={MAX_TOTAL_BYTES}
              />

              <UploadedFileList
                files={uploadedFiles}
                lang={lang}
                onRemoveFile={handleRemoveFile}
                onClearAll={handleClearAllFiles}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default App;
