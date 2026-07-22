const Database = require('better-sqlite3');
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

let db;

function initDb() {
  const userDataPath = app.getPath('userData');
  if (!fs.existsSync(userDataPath)) fs.mkdirSync(userDataPath, { recursive: true });
  const dbPath = path.join(userDataPath, 'tracker.db');

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  db.exec(`
    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      folder_path TEXT NOT NULL UNIQUE,
      project_name TEXT NOT NULL,
      category TEXT,
      sub_category TEXT,
      status TEXT DEFAULT 'On Progress',
      priority TEXT DEFAULT 'Medium',
      deadline TEXT,
      approval INTEGER DEFAULT 0,
      comments TEXT DEFAULT '',
      created_at TEXT,
      modified_at TEXT,
      last_synced TEXT,
      missing INTEGER DEFAULT 0,
      drive_folder_id TEXT,
      drive_folder_url TEXT
    );

    CREATE TABLE IF NOT EXISTS config (
      key TEXT PRIMARY KEY,
      value TEXT
    );
  `);

  // Migration: add drive columns if they don't exist
  const columns = db.prepare("PRAGMA table_info(projects)").all().map(c => c.name);
  if (!columns.includes('drive_folder_id')) {
    db.exec("ALTER TABLE projects ADD COLUMN drive_folder_id TEXT");
  }
  if (!columns.includes('drive_folder_url')) {
    db.exec("ALTER TABLE projects ADD COLUMN drive_folder_url TEXT");
  }
  if (!columns.includes('approver')) {
    db.exec("ALTER TABLE projects ADD COLUMN approver TEXT DEFAULT ''");
  }

  return db;
}

function getDb() {
  if (!db) throw new Error('Database belum di-init. Panggil initDb() dulu di main/index.js');
  return db;
}

module.exports = { initDb, getDb };
