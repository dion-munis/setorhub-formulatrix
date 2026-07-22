const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { ensureTrackerFile } = require('./tracker-file');
const { getDb } = require('./db');

function makeId(folderPath) {
  return crypto.createHash('sha1').update(folderPath).digest('hex');
}

/**
 * Baca semua sub-folder langsung di dalam sebuah path (bukan file).
 */
function listSubDirs(dirPath) {
  if (!fs.existsSync(dirPath)) return [];
  return fs
    .readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);
}

/**
 * Scan rootPath sampai `depth` level, folder di level terakhir dianggap "Project".
 * depth=1 -> langsung di bawah root = project
 * depth=2 -> root/kategori/project
 * depth=3 -> root/kategori/sub-kategori/project
 */
function scanFolder(rootPath, depth = 2) {
  if (!fs.existsSync(rootPath)) {
    throw new Error(`Root folder tidak ditemukan: ${rootPath}`);
  }

  const projects = [];

  function walk(currentPath, level, trail) {
    const subDirs = listSubDirs(currentPath);

    if (level === depth || subDirs.length === 0) {
      // currentPath dianggap sebagai project folder
      const stat = fs.statSync(currentPath);
      const tracker = ensureTrackerFile(currentPath);

      projects.push({
        id: makeId(currentPath),
        folder_path: currentPath,
        project_name: path.basename(currentPath),
        category: trail[0] || null,
        sub_category: trail[1] || null,
        status: tracker.status,
        priority: tracker.priority,
        deadline: tracker.deadline,
        approver: tracker.approver || '',
        comments: tracker.comments,
        created_at: stat.birthtime.toISOString(),
        modified_at: stat.mtime.toISOString(),
        last_synced: tracker.lastSynced
      });
      return;
    }

    for (const dirName of subDirs) {
      walk(path.join(currentPath, dirName), level + 1, [...trail, dirName]);
    }
  }

  walk(rootPath, 0, []);
  return projects;
}

/**
 * Jalankan scan dan upsert hasilnya ke SQLite.
 */
function scanAndPersist(rootPath, depth) {
  const db = getDb();
  const projects = scanFolder(rootPath, depth);

  const upsert = db.prepare(`
    INSERT INTO projects (id, folder_path, project_name, category, sub_category, status, priority, deadline, approver, comments, created_at, modified_at, last_synced, missing)
    VALUES (@id, @folder_path, @project_name, @category, @sub_category, @status, @priority, @deadline, @approver, @comments, @created_at, @modified_at, @last_synced, 0)
    ON CONFLICT(folder_path) DO UPDATE SET
      modified_at = excluded.modified_at,
      missing = 0
    WHERE projects.folder_path = excluded.folder_path
  `);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) upsert.run(row);
  });

  insertMany(projects);

  // Hapus project yang folder-nya sudah tidak ada lagi
  const currentPaths = projects.map((p) => p.folder_path);
  const allRows = db.prepare('SELECT id, folder_path FROM projects').all();
  const deleteMissing = db.prepare('DELETE FROM projects WHERE id = ?');
  for (const row of allRows) {
    if (!currentPaths.includes(row.folder_path)) {
      deleteMissing.run(row.id);
    }
  }

  return projects.length;
}

module.exports = { scanFolder, scanAndPersist, makeId };
