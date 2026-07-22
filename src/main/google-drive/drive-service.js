const { google } = require('googleapis');
const path = require('path');
const fs = require('fs');
const { Readable } = require('stream');
const ExcelJS = require('exceljs');
const { getAuthenticatedClient } = require('./auth');

/**
 * Search for a folder by name within a parent folder
 */
async function findFolderByName(drive, parentId, folderName) {
  const query = [
    `'${parentId}' in parents`,
    `name = '${folderName.replace(/'/g, "\\'")}'`,
    "mimeType = 'application/vnd.google-apps.folder'",
    'trashed = false'
  ].join(' and ');

  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive'
  });

  return res.data.files.length > 0 ? res.data.files[0] : null;
}

/**
 * Create a folder in Google Drive
 */
async function createFolder(drive, parentId, folderName) {
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentId]
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    fields: 'id, name'
  });

  return res.data;
}

/**
 * Find or create a folder (with caching to avoid duplicate searches)
 */
async function findOrCreateFolder(drive, parentId, folderName, cache) {
  const cacheKey = `${parentId}/${folderName}`;

  // Check cache first
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  // Try to find existing folder
  let folder = await findFolderByName(drive, parentId, folderName);

  // Create if not found
  if (!folder) {
    folder = await createFolder(drive, parentId, folderName);
  }

  // Cache the result
  cache[cacheKey] = folder;
  return folder;
}

/**
 * Create folder structure in Google Drive matching local path
 * Returns { folderId, folderUrl }
 */
async function createFolderStructure(relativePath) {
  let auth;
  try {
    auth = await getAuthenticatedClient();
  } catch (err) {
    throw new Error('Autentikasi Google Drive gagal. Silakan login ulang ke Google Drive.');
  }
  const drive = google.drive({ version: 'v3', auth });

  let rootRes;
  try {
    rootRes = await drive.files.get({
      fileId: 'root',
      fields: 'id'
    });
  } catch (err) {
    throw new Error('Gagal mengakses Google Drive. Silakan logout dan login ulang ke Google Drive.');
  }
  let currentParentId = rootRes.data.id;

  // Split path into segments
  const segments = relativePath.split(/[\\/]/).filter(Boolean);
  const cache = {};

  // Create each folder level
  for (const segment of segments) {
    let folder;
    try {
      folder = await findOrCreateFolder(drive, currentParentId, segment, cache);
    } catch (err) {
      if (err.message && err.message.includes('File not found')) {
        throw new Error(`Folder "${segment}" tidak dapat diakses di Google Drive. Silakan logout dan login ulang ke Google Drive.`);
      }
      throw err;
    }
    if (!folder || !folder.id) {
      throw new Error('Gagal membuat atau menemukan folder: ' + segment);
    }
    currentParentId = folder.id;
  }

  // Get the final folder URL
  const folderUrl = `https://drive.google.com/drive/folders/${currentParentId}`;

  return {
    folderId: currentParentId,
    folderUrl
  };
}

/**
 * Get folder info from Google Drive
 */
async function getFolderInfo(folderId) {
  const auth = await getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  const res = await drive.files.get({
    fileId: folderId,
    fields: 'id, name, webViewLink'
  });

  return {
    id: res.data.id,
    name: res.data.name,
    url: res.data.webViewLink || `https://drive.google.com/drive/folders/${res.data.id}`
  };
}

/**
 * Check if a folder exists in Google Drive
 */
async function folderExists(folderId) {
  try {
    const auth = await getAuthenticatedClient();
    const drive = google.drive({ version: 'v3', auth });

    await drive.files.get({
      fileId: folderId,
      fields: 'id'
    });
    return true;
  } catch (err) {
    return false;
  }
}

/**
 * Upload a file to a Google Drive folder
 * @param {string} folderId - Target folder ID
 * @param {string} filePath - Local file path
 * @returns {Object} - { id, name, webViewLink }
 */
async function uploadFile(folderId, filePath) {
  const auth = await getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  const fileName = path.basename(filePath);
  const fileStream = fs.createReadStream(filePath);

  // Get file stats for size
  const stats = fs.statSync(filePath);

  const fileMetadata = {
    name: fileName,
    parents: [folderId]
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media: {
      mimeType: getMimeType(fileName),
      body: fileStream
    },
    fields: 'id, name, webViewLink',
    supportsAllDrives: true
  });

  return {
    id: res.data.id,
    name: res.data.name,
    url: res.data.webViewLink || `https://drive.google.com/file/d/${res.data.id}/view`
  };
}

/**
 * Generate Excel report and upload to Google Drive as Google Sheet
 * @param {Array} projects - Array of project objects
 * @param {string} reportName - Name for the report file
 * @returns {Object} - { id, name, url }
 */
async function generateReport(projects, reportName) {
  const auth = await getAuthenticatedClient();
  const drive = google.drive({ version: 'v3', auth });

  // Create Excel workbook
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SetorHub';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Report', {
    views: [{ state: 'frozen', ySplit: 2 }]
  });

  // Define colors
  const headerBg = { argb: 'FF333333' };
  const headerFg = { argb: 'FFFFFFFF' };
  const statusColors = {
    'Done': { bg: { argb: 'FFD4EDDA' }, fg: { argb: 'FF155724' } },
    'Done (Need Review)': { bg: { argb: 'FFD1ECF1' }, fg: { argb: 'FF0C5460' } },
    'On Progress': { bg: { argb: 'FFFFF3CD' }, fg: { argb: 'FF856404' } },
    'Moved to next month': { bg: { argb: 'FFE2D9F3' }, fg: { argb: 'FF563D7C' } },
    'Cancelled / Hold': { bg: { argb: 'FFF8D7DA' }, fg: { argb: 'FF721C24' } },
    'Revise': { bg: { argb: 'FFD4EDDA' }, fg: { argb: 'FF155724' } }
  };

  // Set column widths
  sheet.columns = [
    { header: '', key: 'project', width: 45 },
    { header: '', key: 'status', width: 15 },
    { header: '', key: 'date', width: 12 },
    { header: '', key: 'urgent', width: 8 },
    { header: '', key: 'medium', width: 8 },
    { header: '', key: 'low', width: 8 },
    { header: '', key: 'approver', width: 12 },
    { header: '', key: 'link', width: 15 },
    { header: '', key: 'comments', width: 30 }
  ];

  // Row 1: Main headers
  const headerRow1 = sheet.getRow(1);
  headerRow1.values = ['Project Description', 'Status/progress', 'Date', '', 'Priority', '', '', 'Approval', 'Link to Files (if needed)', 'Comments'];
  headerRow1.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: headerBg };
    cell.font = { color: headerFg, bold: true, size: 11 };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      bottom: { style: 'thin', color: { argb: 'FF666666' } }
    };
  });
  headerRow1.height = 25;

  // Merge cells for Priority header
  sheet.mergeCells('D1:F1');

  // Row 2: Sub headers
  const headerRow2 = sheet.getRow(2);
  headerRow2.values = ['', '', '', 'Urgent', 'Medium', 'Low', '', '', ''];
  headerRow2.eachCell((cell, colNumber) => {
    if (colNumber >= 4 && colNumber <= 6) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF666666' } };
      cell.font = { color: headerFg, bold: true, size: 10 };
    } else {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: headerBg };
      cell.font = { color: headerFg, bold: true, size: 10 };
    }
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });
  headerRow2.height = 20;

  // Data rows
  projects.forEach((project) => {
    const statusColor = statusColors[project.status] || statusColors['On Progress'];
    const createdDate = project.created_at ? new Date(project.created_at) : null;
    const dateStr = createdDate ? createdDate.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '';

    const row = sheet.addRow({
      project: project.project_name,
      status: project.status,
      date: dateStr,
      urgent: project.priority === 'Urgent' ? 'v' : '',
      medium: project.priority === 'Medium' ? 'v' : '',
      low: project.priority === 'Low' ? 'v' : '',
      approver: project.approver || '',
      link: project.drive_folder_url ? { text: 'Link', hyperlink: project.drive_folder_url } : '',
      comments: project.comments || ''
    });

    // Style status cell
    const statusCell = row.getCell('status');
    statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: statusColor.bg };
    statusCell.font = { color: statusColor.fg, bold: true, size: 10 };
    statusCell.alignment = { horizontal: 'center' };

    // Style priority cells
    for (let col = 4; col <= 6; col++) {
      const cell = row.getCell(col);
      cell.alignment = { horizontal: 'center' };
      if (cell.value === 'v') {
        cell.font = { bold: true, size: 10 };
      }
    }

    // Style link cell
    const linkCell = row.getCell('link');
    if (project.drive_folder_url) {
      linkCell.font = { color: { argb: 'FF0066CC' }, underline: true };
    }

    row.height = 20;
  });

  // Add empty row
  sheet.addRow([]);

  // Status legend
  const statusLegend = [
    { status: 'Done', color: statusColors['Done'] },
    { status: 'Done (Need Review)', color: statusColors['Done (Need Review)'] },
    { status: 'On Progress', color: statusColors['On Progress'] },
    { status: 'Moved to next month', color: statusColors['Moved to next month'] },
    { status: 'Cancelled / Hold', color: statusColors['Cancelled / Hold'] },
    { status: 'On Revise', color: statusColors['Revise'] }
  ];

  statusLegend.forEach((item) => {
    const row = sheet.addRow([item.status]);
    const cell = row.getCell(1);
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: item.color.bg };
    cell.font = { color: item.color.fg, bold: true, size: 10 };
    row.height = 20;
  });

  // Add borders to all data cells
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 3 && rowNumber <= projects.length + 2) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          bottom: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          left: { style: 'thin', color: { argb: 'FFCCCCCC' } },
          right: { style: 'thin', color: { argb: 'FFCCCCCC' } }
        };
      });
    }
  });

  // Generate Excel file buffer
  const buffer = await workbook.xlsx.writeBuffer();

  // Convert buffer to stream for Google Drive API
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);

  // Upload to Google Drive as Google Sheet
  const fileMetadata = {
    name: reportName,
    mimeType: 'application/vnd.google-apps.spreadsheet'
  };

  const res = await drive.files.create({
    resource: fileMetadata,
    media: {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      body: stream
    },
    fields: 'id, name, webViewLink'
  });

  return {
    id: res.data.id,
    name: res.data.name,
    url: res.data.webViewLink || `https://docs.google.com/spreadsheets/d/${res.data.id}/edit`
  };
}
function getMimeType(fileName) {
  const ext = path.extname(fileName).toLowerCase();
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.pdf': 'application/pdf',
    '.mp4': 'video/mp4'
  };
  return mimeTypes[ext] || 'application/octet-stream';
}

module.exports = {
  createFolderStructure,
  getFolderInfo,
  folderExists,
  findFolderByName,
  createFolder,
  uploadFile,
  generateReport
};
