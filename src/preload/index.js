const { contextBridge, ipcRenderer, webUtils } = require('electron');

contextBridge.exposeInMainWorld('api', {
  selectFolder: () => ipcRenderer.invoke('dialog:selectFolder'),
  getConfig: (key) => ipcRenderer.invoke('config:get', key),
  setConfig: (key, value) => ipcRenderer.invoke('config:set', { key, value }),
  setRoot: (rootPath, depth) => ipcRenderer.invoke('config:setRoot', { rootPath, depth }),

  scanNow: () => ipcRenderer.invoke('projects:scanNow'),
  getAllProjects: () => ipcRenderer.invoke('projects:getAll'),
  updateProject: (id, folderPath, updates) =>
    ipcRenderer.invoke('projects:update', { id, folderPath, updates }),

  onProjectsChanged: (callback) => {
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on('projects:changed', listener);
    return () => ipcRenderer.removeListener('projects:changed', listener);
  },

  // File path helper (Electron 31+ no longer exposes file.path)
  getFilePath: (file) => webUtils.getPathForFile(file),

  // Google Drive Integration
  isDriveAuthenticated: () => ipcRenderer.invoke('drive:isAuthenticated'),
  authenticateDrive: () => ipcRenderer.invoke('drive:authenticate'),
  logoutDrive: () => ipcRenderer.invoke('drive:logout'),
  linkProjectToDrive: (projectId) => ipcRenderer.invoke('drive:linkProject', projectId),
  getProjectDriveInfo: (projectId) => ipcRenderer.invoke('drive:getProjectDriveInfo', projectId),
  openDriveFolder: (folderUrl) => ipcRenderer.invoke('drive:openFolder', folderUrl),
  uploadFileToDrive: (folderId, filePath) => ipcRenderer.invoke('drive:uploadFile', { folderId, filePath }),
  checkDriveFolderExists: (folderId) => ipcRenderer.invoke('drive:checkFolderExists', folderId),
  unlinkProject: (projectId) => ipcRenderer.invoke('drive:unlinkProject', projectId),
  generateReport: (projects, reportName) => ipcRenderer.invoke('drive:generateReport', { projects, reportName }),
});
