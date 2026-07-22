import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB

function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

function getFileIcon(name) {
  const ext = name.split('.').pop().toLowerCase();
  if (['jpg', 'jpeg', 'png', 'gif'].includes(ext)) return '🖼️';
  if (ext === 'pdf') return '📄';
  if (['mp4', 'avi', 'mov', 'mkv'].includes(ext)) return '🎬';
  if (['psd', 'ai', 'indd'].includes(ext)) return '🎨';
  if (['zip', 'rar', '7z'].includes(ext)) return '📦';
  return '📎';
}

export default function LinkToDriveModal({ project, onClose, onLinked }) {
  const { t } = useTranslation();
  const [files, setFiles] = useState([]); // { file, path } objects
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, fileName: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [driveUrl, setDriveUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = [];

    for (const file of selectedFiles) {
      if (file.size > MAX_FILE_SIZE) {
        setError(t('linkModal.fileTooLarge', { name: file.name }));
        return;
      }
      const filePath = await window.api.getFilePath(file);
      validFiles.push({ file, path: filePath });
    }

    setFiles(prev => [...prev, ...validFiles]);
    setError(null);
    e.target.value = '';
  };

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    setUploading(true);
    setError(null);

    try {
      const isAuth = await window.api.isDriveAuthenticated();
      if (!isAuth) {
        await window.api.authenticateDrive();
      }

      setProgress({ current: 0, total: 1, fileName: t('linkModal.creatingFolder') });
      const updated = await window.api.linkProjectToDrive(project.id);
      const folderUrl = updated.drive_folder_url;

      if (files.length > 0) {
        for (let i = 0; i < files.length; i++) {
          const { file, path: filePath } = files[i];
          setProgress({ current: i + 1, total: files.length, fileName: file.name });
          await window.api.uploadFileToDrive(updated.drive_folder_id, filePath);
        }
      }

      setDriveUrl(folderUrl);
      setSuccess(true);
      if (onLinked) onLinked(updated);
    } catch (err) {
      console.error('Failed to link/upload:', err);
      let message = err.message || t('linkModal.linkFailed');
      if (message.includes('File not found')) {
        message = t('linkModal.accessFailed');
      } else if (message.includes('Belum terautentikasi')) {
        message = t('linkModal.notAuthenticated');
      }
      setError(message);
    } finally {
      setUploading(false);
    }
  };

  const handleOpenDrive = async () => {
    if (driveUrl) {
      await window.api.openDriveFolder(driveUrl);
    }
  };

  const stopProp = (e) => e.stopPropagation();

  return (
    <div className="fixed inset-0 z-50 animate-fade-in" onClick={stopProp}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-ink/20 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4" onClick={stopProp}>
        <div className="w-full max-w-lg bg-surface rounded-2xl shadow-panel-lg border border-border animate-fade-in" onClick={stopProp}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-border">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-ink">{t('linkModal.title')}</h2>
                <p className="text-2xs text-text-secondary mt-0.5">{project.project_name}</p>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-ink hover:bg-slate-100 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-5" onClick={stopProp}>
            {success ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-ink mb-1">{t('linkModal.successTitle')}</h3>
                <p className="text-sm text-text-secondary mb-4">
                  {t('linkModal.successDesc')}
                </p>
                <button onClick={handleOpenDrive} className="btn-primary">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                  {t('linkModal.openInDrive')}
                </button>
              </div>
            ) : uploading ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 bg-accent-soft rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-accent animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                </div>
                <h3 className="text-base font-semibold text-ink mb-1">{t('linkModal.uploading')}</h3>
                <p className="text-sm text-text-secondary mb-2">{progress.fileName}</p>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
                  <div
                    className="bg-accent h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <p className="text-2xs text-text-secondary">
                  {progress.current} {t('linkModal.of')} {progress.total} {t('linkModal.file')}
                </p>
              </div>
            ) : (
              <>
                {/* Folder path info */}
                <div className="bg-slate-50 rounded-lg p-3 mb-4">
                  <p className="text-2xs text-text-secondary mb-1">{t('linkModal.folderInDrive')}</p>
                  <p className="text-xs font-mono text-ink break-all">
                    {project.folder_path.split(/[\\/]/).slice(-3).join(' / ')}
                  </p>
                </div>

                {/* File upload area */}
                <div className="mb-4">
                  <label className="block text-2xs font-medium text-text-secondary uppercase tracking-wider mb-1.5">
                    {t('linkModal.supportFiles')}
                  </label>
                  <p className="text-xs text-text-secondary mb-3">
                    {t('linkModal.allFormats')}
                  </p>

                  <div
                    onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                    className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-accent hover:bg-accent-soft transition-all"
                  >
                    <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <p className="text-sm text-text-secondary mb-1">{t('linkModal.clickToSelect')}</p>
                    <p className="text-2xs text-slate-400">{t('linkModal.dragDrop')}</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    onClick={stopProp}
                  />
                </div>

                {/* Selected files list */}
                {files.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {files.map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg">
                        <span className="text-lg">{getFileIcon(item.file.name)}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-ink truncate">{item.file.name}</p>
                          <p className="text-2xs text-text-secondary">{formatFileSize(item.file.size)}</p>
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                    <p className="text-xs text-red-600">{error}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          {!success && !uploading && (
            <div className="px-6 py-4 border-t border-border bg-slate-50/80 rounded-b-2xl" onClick={stopProp}>
              <div className="flex gap-3">
                <button onClick={onClose} className="btn-secondary flex-1">
                  {t('linkModal.cancel')}
                </button>
                <button onClick={handleUpload} className="btn-primary flex-1">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  {files.length > 0 ? t('linkModal.uploadAndLink', { count: files.length }) : t('linkModal.linkToDrive')}
                </button>
              </div>
            </div>
          )}

          {success && (
            <div className="px-6 py-4 border-t border-border bg-slate-50/80 rounded-b-2xl" onClick={stopProp}>
              <button onClick={onClose} className="btn-secondary w-full">
                {t('linkModal.close')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
