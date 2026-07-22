const { ipcMain, dialog, shell } = require('electron');
const fs = require('fs');
const path = require('path');
const { getDb } = require('./db');
const { scanAndPersist } = require('./scanner');
const { writeTrackerFile, readTrackerFile } = require('./tracker-file');
const { startWatching } = require('./watcher');
const driveAuth = require('./google-drive/auth');
const driveService = require('./google-drive/drive-service');

function getConfig(key, fallback = null) {
  const db = getDb();
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

function setConfig(key, value) {
  const db = getDb();
  db.prepare(
    'INSERT INTO config (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'
  ).run(key, value);
}

function registerIpcHandlers(getWindow) {
  // --- Onboarding / Settings ---
  ipcMain.handle('dialog:selectFolder', async () => {
    const result = await dialog.showOpenDialog({ properties: ['openDirectory'] });
    if (result.canceled || result.filePaths.length === 0) return null;
    return result.filePaths[0];
  });

  ipcMain.handle('config:get', (_e, key) => getConfig(key));

  ipcMain.handle('config:set', (_e, { key, value }) => {
    setConfig(key, value);
    return true;
  });

  ipcMain.handle('config:setRoot', (_e, { rootPath, depth }) => {
    setConfig('root_path', rootPath);
    setConfig('scan_depth', String(depth));
    startWatching(rootPath, getWindow);
    return true;
  });

  // --- Scanning ---
  ipcMain.handle('projects:scanNow', () => {
    const rootPath = getConfig('root_path');
    const depth = parseInt(getConfig('scan_depth', '2'), 10);
    if (!rootPath) throw new Error('Root folder belum diatur. Selesaikan onboarding dulu.');
    const count = scanAndPersist(rootPath, depth);
    return { count };
  });

  ipcMain.handle('projects:getAll', () => {
    const db = getDb();
    return db.prepare('SELECT * FROM projects ORDER BY modified_at DESC').all();
  });

  // --- Edit metadata project ---
  ipcMain.handle('projects:update', (_e, { id, folderPath, updates }) => {
    const db = getDb();

    const trackerData = {
      ...readTrackerFile(folderPath),
      status: updates.status,
      priority: updates.priority,
      approver: updates.approver,
      comments: updates.comments
    };
    writeTrackerFile(folderPath, trackerData);

    db.prepare(
      `UPDATE projects SET status = ?, priority = ?, approver = ?, comments = ? WHERE id = ?`
    ).run(
      updates.status,
      updates.priority,
      updates.approver || '',
      updates.comments,
      id
    );

    return db.prepare('SELECT * FROM projects WHERE id = ?').get(id);
  });

  // --- Google Drive Integration ---
  ipcMain.handle('drive:isAuthenticated', () => {
    return driveAuth.isAuthenticated();
  });

  ipcMain.handle('drive:authenticate', async () => {
    const open = (await import('open')).default;
    const authUrl = driveAuth.getAuthUrl();
    await open(authUrl);

    // Start callback server and wait for code
    const code = await driveAuth.startCallbackServer();
    await driveAuth.exchangeCode(code);
    return true;
  });

  ipcMain.handle('drive:logout', () => {
    driveAuth.logout();
    return true;
  });

  ipcMain.handle('drive:linkProject', async (_e, projectId) => {
    const db = getDb();
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    if (!project) throw new Error('Project tidak ditemukan');

    const rootPath = getConfig('root_path');
    if (!rootPath) throw new Error('Root folder belum diatur');

    // Use drive_root if set, otherwise fall back to root_path
    const driveRoot = getConfig('drive_root') || rootPath;

    // Extract relative path from drive root
    let relativePath = project.folder_path;
    if (relativePath.toLowerCase().startsWith(driveRoot.toLowerCase())) {
      relativePath = relativePath.slice(driveRoot.length);
    }
    // Remove leading backslash or forward slash
    relativePath = relativePath.replace(/^[\\/]/, '');
    // Normalize to forward slashes
    relativePath = relativePath.replace(/\\/g, '/');

    if (!relativePath) {
      throw new Error('Path project kosong. Pastikan project berada di dalam root folder.');
    }

    try {
      // Create folder structure in Google Drive
      const { folderId, folderUrl } = await driveService.createFolderStructure(relativePath);

      // Save to database
      db.prepare('UPDATE projects SET drive_folder_id = ?, drive_folder_url = ? WHERE id = ?')
        .run(folderId, folderUrl, projectId);

      return db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
    } catch (err) {
      if (err.message && err.message.includes('File not found')) {
        throw new Error('Gagal mengakses Google Drive. Silakan logout dan login ulang ke Google Drive, lalu coba lagi.');
      }
      throw err;
    }
  });

  ipcMain.handle('drive:getProjectDriveInfo', (_e, projectId) => {
    const db = getDb();
    const project = db.prepare('SELECT drive_folder_id, drive_folder_url FROM projects WHERE id = ?').get(projectId);
    if (!project) return null;
    return {
      folderId: project.drive_folder_id,
      folderUrl: project.drive_folder_url
    };
  });

  ipcMain.handle('drive:openFolder', (_e, folderUrl) => {
    if (folderUrl) {
      shell.openExternal(folderUrl);
    }
    return true;
  });

  ipcMain.handle('drive:checkFolderExists', async (_e, folderId) => {
    if (!folderId) return false;
    try {
      return await driveService.folderExists(folderId);
    } catch {
      return false;
    }
  });

  ipcMain.handle('drive:unlinkProject', (_e, projectId) => {
    const db = getDb();
    db.prepare('UPDATE projects SET drive_folder_id = NULL, drive_folder_url = NULL WHERE id = ?')
      .run(projectId);
    return db.prepare('SELECT * FROM projects WHERE id = ?').get(projectId);
  });

  ipcMain.handle('drive:generateReport', async (_e, { projects, reportName }) => {
    try {
      const result = await driveService.generateReport(projects, reportName);
      return result;
    } catch (err) {
      if (err.message && err.message.includes('File not found')) {
        throw new Error('Gagal mengakses Google Drive. Silakan logout dan login ulang ke Google Drive.');
      }
      throw err;
    }
  });

  ipcMain.handle('drive:uploadFile', async (_e, { folderId, filePath }) => {
    // Validate file exists
    if (!fs.existsSync(filePath)) {
      throw new Error('File tidak ditemukan: ' + filePath);
    }

    // Validate file size (max 500MB)
    const stats = fs.statSync(filePath);
    if (stats.size > 500 * 1024 * 1024) {
      throw new Error('Ukuran file terlalu besar (maks 500MB)');
    }

    const result = await driveService.uploadFile(folderId, filePath);
    return result;
  });
}

module.exports = { registerIpcHandlers };
