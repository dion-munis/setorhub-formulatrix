const fs = require('fs');
const path = require('path');

const TRACKER_FILENAME = '.tracker.json';

const DEFAULT_TRACKER = {
  status: 'On Progress',
  priority: 'Medium',
  deadline: null,
  approver: '',
  comments: '',
  driveLink: '',
  pic: '',
  lastSynced: null
};

function trackerPath(folderPath) {
  return path.join(folderPath, TRACKER_FILENAME);
}

function readTrackerFile(folderPath) {
  const filePath = trackerPath(folderPath);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_TRACKER, ...parsed };
  } catch (err) {
    console.error(`Gagal membaca ${filePath}, memakai default. Error:`, err.message);
    return { ...DEFAULT_TRACKER };
  }
}

function writeTrackerFile(folderPath, data) {
  const filePath = trackerPath(folderPath);
  const merged = { ...DEFAULT_TRACKER, ...data };
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
  return merged;
}

function ensureTrackerFile(folderPath) {
  const existing = readTrackerFile(folderPath);
  if (existing) return existing;
  return writeTrackerFile(folderPath, { ...DEFAULT_TRACKER });
}

module.exports = { readTrackerFile, writeTrackerFile, ensureTrackerFile, DEFAULT_TRACKER };
