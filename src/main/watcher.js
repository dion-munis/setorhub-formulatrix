const chokidar = require('chokidar');
const { getDb } = require('./db');
const { scanAndPersist } = require('./scanner');

let watcher = null;

function getConfigValue(key) {
  const db = getDb();
  const row = db.prepare('SELECT value FROM config WHERE key = ?').get(key);
  return row ? row.value : null;
}

function initWatcher(getWindow) {
  const rootPath = getConfigValue('root_path');
  if (!rootPath) return; // belum onboarding, watcher menyusul setelah root diset

  startWatching(rootPath, getWindow);
}

function startWatching(rootPath, getWindow) {
  if (watcher) watcher.close();

  const depth = parseInt(getConfigValue('scan_depth') || '2', 10);

  watcher = chokidar.watch(rootPath, {
    ignoreInitial: true,
    depth,
    ignored: /(^|[\/\\])\../ // ignore hidden files/folders termasuk .tracker.json
  });

  const triggerRescan = debounce(() => {
    const count = scanAndPersist(rootPath, depth);
    const win = getWindow();
    if (win) win.webContents.send('projects:changed', { count });
  }, 800);

  watcher.on('addDir', triggerRescan);
  watcher.on('unlinkDir', triggerRescan);
}

function debounce(fn, wait) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), wait);
  };
}

module.exports = { initWatcher, startWatching };
