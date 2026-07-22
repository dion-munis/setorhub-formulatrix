import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import LinkToDriveModal from './LinkToDriveModal.jsx';

export default function DriveButton({ project, onLinked }) {
  const { t } = useTranslation();
  const [showModal, setShowModal] = useState(false);
  const [driveInfo, setDriveInfo] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    setDriveInfo(project.drive_folder_url ? {
      folderId: project.drive_folder_id,
      folderUrl: project.drive_folder_url
    } : null);
  }, [project]);

  const handleOpenDrive = async (e) => {
    e.stopPropagation();
    if (!driveInfo?.folderUrl) return;

    setChecking(true);
    try {
      const exists = await window.api.checkDriveFolderExists(driveInfo.folderId);
      if (exists) {
        await window.api.openDriveFolder(driveInfo.folderUrl);
      } else {
        const updated = await window.api.unlinkProject(project.id);
        setDriveInfo(null);
        if (onLinked) onLinked(updated);
      }
    } catch {
      await window.api.openDriveFolder(driveInfo.folderUrl);
    } finally {
      setChecking(false);
    }
  };

  const handleUploadClick = (e) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleLinked = (updated) => {
    setDriveInfo({
      folderId: updated.drive_folder_id,
      folderUrl: updated.drive_folder_url
    });
    if (onLinked) onLinked(updated);
  };

  // Already linked - show open drive + upload button
  if (driveInfo) {
    return (
      <>
        <div className="inline-flex items-center">
          <button
            onClick={handleOpenDrive}
            disabled={checking}
            className="inline-flex items-center gap-1.5 px-2 py-1 text-2xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-l-md hover:bg-blue-100 transition-colors disabled:opacity-50"
            title={t('drive.openFolder')}
          >
            {checking ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            )}
            {t('drive.linkToDrive')}
          </button>
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center gap-1 px-1.5 py-1 text-2xs font-medium text-blue-600 bg-blue-50 border border-l-0 border-blue-200 rounded-r-md hover:bg-blue-100 transition-colors"
            title={t('drive.uploadFile')}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
        {showModal && (
          <LinkToDriveModal
            project={project}
            onClose={() => setShowModal(false)}
            onLinked={handleLinked}
          />
        )}
      </>
    );
  }

  // Not linked - show link button
  return (
    <>
      <button
        onClick={handleUploadClick}
        className="inline-flex items-center gap-1.5 px-2 py-1 text-2xs font-medium text-slate-600 bg-slate-100 border border-slate-200 rounded-md hover:bg-slate-200 transition-colors"
        title={t('drive.connectToDrive')}
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        {t('drive.linkToDrive')}
      </button>
      {showModal && (
        <LinkToDriveModal
          project={project}
          onClose={() => setShowModal(false)}
          onLinked={handleLinked}
        />
      )}
    </>
  );
}
