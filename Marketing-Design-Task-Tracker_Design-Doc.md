# Marketing Design Task Tracker — Design Document

**Tim:** Marketing Design (6 orang — 2 3D Designer, 1 Developer, 1 Manager, 2 Graphic Designer)
**Platform:** Windows Desktop (Electron)
**Tujuan:** Otomatisasi tracking project dari struktur folder lokal ke Google Sheets, menggantikan input manual.

---

## 1. Problem Statement

Saat ini tracking dilakukan manual: tiap anggota tim mengingat-ingat project yang sudah dikerjakan lalu mengetik ulang ke Google Sheets (kolom: Project Description, Status, Date, Priority, Deadline, Approval, Link to Files, Comments). Ini memakan waktu dan rawan lupa/terlewat.

**Goal:** App desktop yang membaca struktur folder project lokal (`D:/Project/H2 2026/...`), menampilkannya sebagai daftar task, dan bisa generate/sync otomatis ke Google Sheets + Google Drive.

---

## 2. Tech Stack

| Layer | Teknologi | Alasan |
|---|---|---|
| Shell aplikasi | **Electron** | Cross-window desktop, kamu sudah familiar web dev (HTML/CSS/JS) |
| UI | **React + Tailwind** | Cepat dibangun, konsisten dengan skill kamu |
| Local storage | **SQLite** (via `better-sqlite3`) | Simpan cache metadata project, riwayat sync, tanpa perlu server |
| File watcher | **chokidar** | Auto-detect perubahan folder (project baru/dihapus) |
| Google API | **googleapis** (Node.js SDK) | Sheets API v4 + Drive API v3 |
| Auth | **OAuth2 (Google Identity)** | Login per user, token disimpan terenkripsi lokal (`keytar`) |
| Packaging | **electron-builder** | Build installer `.exe` untuk distribusi ke 6 anggota tim |

---

## 3. Struktur Folder & Konvensi

Struktur yang sudah ada dipertahankan sebagai sumber data:

```
D:/Project/H2 2026/
  Wordpress/
    Plugin Development/
      [Nama Project A]/
      [Nama Project B]/
    Bug Issue/
      [Nama Project C]/
  STACK Configurator/
    [Nama Project D]/
```

Mapping otomatis ke kolom sheet:
- **Level 1** (`Wordpress`) → Kategori/Project Group
- **Level 2** (`Plugin Development`) → Sub-kategori
- **Level 3** (nama folder project) → **Project Description**
- **File dates** di dalam folder project → **Date** (created/modified, bisa dipilih pakai yang mana)

### Metadata tambahan (`.tracker.json`)
Karena folder nggak bisa menyimpan Status/Priority/Approval, tiap folder project otomatis dapat file kecil tersembunyi saat pertama kali di-scan:

```json
{
  "status": "On Progress",
  "priority": "Medium",
  "deadline": "2026-08-15",
  "approval": false,
  "comments": "",
  "driveLink": "",
  "pic": "Wahid",
  "lastSynced": "2026-07-14T10:00:00Z"
}
```
File ini diedit lewat UI app (bukan manual JSON), dan **ikut ter-scan otomatis** kalau folder di-share/dipindah antar anggota tim.

> **Catatan Approval:** Kolom `approval` diisi/dicentang sendiri oleh user yang mengerjakan project (self-declared), bukan gate yang menunggu persetujuan manager. Manager melihat status ini di sheet yang di-share, tapi tidak ada approval workflow terpisah di dalam app.

---

## 3.1 First-Run Setup (Onboarding)

Karena tiap anggota tim bebas menentukan root folder & penamaan sendiri, app **wajib** menampilkan wizard konfigurasi saat pertama kali dibuka (dan bisa diubah lagi lewat Settings):

1. **Pilih Root Folder** — file picker native Windows, user arahkan ke folder project mereka (misal `D:/Project/H2 2026/`), tidak ada batasan struktur/penamaan.
2. **Tentukan Kedalaman Scan** — berapa level folder yang dianggap "Project" (default: level terakhir sebelum file, tapi user bisa atur manual kalau struktur foldernya beda-beda, misal ada yang cuma 2 level, ada yang 3 level).
3. **Login Google Account** — OAuth2, dipakai untuk generate Sheet & Drive folder personal.
4. **Preview & Konfirmasi** — app tampilkan hasil scan awal (list project terdeteksi) sebelum user konfirmasi generate Sheet.

Konfigurasi ini disimpan lokal di `config.json` per user, bisa diubah kapan saja (misal kalau pindah root folder tahun depan, `H2 2026` → `H1 2027`).

---

1. **Directory Picker** — pilih root folder (misal `D:/Project/H2 2026/`), app scan otomatis & tampilkan tree/list project.
2. **Project Dashboard** — tabel/list semua project dengan filter status, priority, PIC, bulan.
3. **Inline Edit** — klik project → edit status/priority/deadline/comments langsung, tersimpan ke `.tracker.json`.
4. **Auto-detect New Project** — file watcher mendeteksi folder baru dibuat → otomatis masuk daftar dengan status default "On Progress".
5. **Google Sheets Sync** — tombol "Sync to Sheets" → push/update row ke spreadsheet Yearly Task (match kolom existing).
6. **Google Drive Link Generator** — kalau folder belum ada di Drive, app bisa upload & ambil shareable link untuk kolom "Link to Files".
7. **Sync Log** — riwayat kapan terakhir sync, apa yang berubah (biar nggak duplikat row di sheet).

---

## 5. Multi-User Design (6 anggota tim — Personal Sheets)

Tidak ada database terpusat. Tiap anggota tim login pakai **akun Google pribadinya masing-masing** (OAuth2), dan app generate resource sendiri-sendiri di akun tersebut:

- Saat pertama kali setup, app otomatis membuat 1 Google Sheet baru (misal `[Nama] - Yearly Task H2 2026`) di **My Drive milik user tsb** — bukan shared sheet.
- File yang di-upload ke Drive (untuk kolom "Link to Files") juga masuk ke Drive pribadi user tsb, bukan Drive bersama.
- Setiap row tetap punya **Unique ID** (hash dari path folder) supaya sync berikutnya melakukan `UPSERT` (update kalau sudah ada, append kalau baru) — bukan duplikat.
- Token OAuth per akun disimpan terpisah secara lokal (`keytar`), app hanya aktif untuk 1 akun aktif per instalasi (1 orang, 1 komputer, 1 akun).

### Ke Manager
Karena sheet-nya personal, user bisa share langsung dari dalam app:
- Klik **"Share to Manager"** → masukkan email manager sekali (tersimpan di config) → app kasih akses **Viewer atau Editor** (pilihan toggle di Settings, default Viewer) ke Sheet lewat Drive API — tidak perlu buka Google Sheets manual.
- Manager tidak otomatis melihat gabungan 6 sheet dalam 1 tampilan — kalau nanti dibutuhkan rekap gabungan, itu bisa jadi fitur terpisah (lihat Fase 5).

---

## 6. Data Flow

```
[Local Folder Scan] → [SQLite cache + .tracker.json]
        ↓
[User edit status/priority via UI]
        ↓
[Sync Engine] → cek Unique ID row di Sheets
        ↓
   ada? → UPDATE row      tidak ada? → APPEND row baru
        ↓
[Google Sheets pribadi user — "[Nama] - Yearly Task H2 2026"]
        ↓ (opsional)
[Share view-only link ke Manager]
```

---

## 7. Keamanan & Autentikasi

- Login pakai akun Google masing-masing (OAuth2), scope terbatas ke `spreadsheets` dan `drive.file` (bukan akses full Drive).
- Refresh token disimpan terenkripsi via `keytar` (Windows Credential Manager), bukan plain text.
- Tidak ada server backend — semua komunikasi langsung app ↔ Google API, jadi tidak perlu hosting/maintenance server tambahan.

---

## 8. Roadmap Pengembangan

| Fase | Fitur | Estimasi |
|---|---|---|
| **MVP (Fase 1)** | Folder scanner, dashboard list, edit metadata lokal (belum sync) | 1–2 minggu |
| **Fase 2** | Google Sheets OAuth + sync (push/update) | 1 minggu |
| **Fase 3** | Google Drive link generator + upload | 3–5 hari |
| **Fase 4** | Multi-user testing (6 device), packaging installer | 1 minggu |
| **Fase 5 (opsional)** | Notifikasi deadline, laporan bulanan otomatis, dashboard analytics | TBD |

---

## 9. Keputusan Final

| Topik | Keputusan |
|---|---|
| Penamaan folder | Bebas, tidak distandarisasi — scanner harus fleksibel (lihat §3.1 First-Run Setup) |
| Kolom Approval | Diisi/dicentang sendiri oleh user (self-declared), bukan approval gate dari manager |
| Root folder tiap anggota | Bebas ditentukan sendiri per orang, diatur lewat wizard onboarding saat app pertama dibuka |
| Pengiriman ke Manager | Share langsung dari app (Viewer/Editor toggle), bukan sheet gabungan otomatis |

---

## 10. Fase 1 — Technical Breakdown (MVP)

Scope Fase 1: **scan folder lokal → tampil di dashboard → edit metadata lokal**. Belum ada Google Sheets/Drive (itu Fase 2–3).

### 10.1 Project Structure

```
marketing-task-tracker/
├── src/
│   ├── main/                    # Electron main process
│   │   ├── index.js             # Entry point, window lifecycle
│   │   ├── scanner.js           # Folder scan logic (fs + recursion)
│   │   ├── watcher.js           # chokidar file watcher
│   │   ├── db.js                # SQLite (better-sqlite3) setup & queries
│   │   ├── tracker-file.js      # Read/write .tracker.json per folder
│   │   └── ipc-handlers.js      # IPC channel registrations
│   ├── preload/
│   │   └── index.js             # contextBridge — expose safe API ke renderer
│   └── renderer/                # React app
│       ├── App.jsx
│       ├── screens/
│       │   ├── Onboarding.jsx   # Wizard: pilih root, atur depth
│       │   ├── Dashboard.jsx    # Tabel/list semua project
│       │   ├── ProjectPanel.jsx # Detail + edit metadata
│       │   └── Settings.jsx
│       ├── store/
│       │   └── useProjectStore.js  # Zustand store
│       └── components/
│           ├── ProjectTable.jsx
│           ├── StatusBadge.jsx
│           └── FilterBar.jsx
├── config.schema.json
├── package.json
└── electron-builder.yml
```

### 10.2 Data Model (SQLite — cache lokal)

```sql
CREATE TABLE projects (
  id TEXT PRIMARY KEY,        -- hash(fullPath)
  folder_path TEXT NOT NULL,
  project_name TEXT NOT NULL, -- nama folder level terakhir
  category TEXT,              -- folder level 1
  sub_category TEXT,          -- folder level 2
  status TEXT DEFAULT 'On Progress',
  priority TEXT DEFAULT 'Medium',
  deadline TEXT,
  approval INTEGER DEFAULT 0,
  comments TEXT,
  created_at TEXT,            -- dari fs.stat folder
  modified_at TEXT,           -- dari fs.stat folder (auto-refresh)
  last_synced TEXT            -- null di Fase 1, dipakai Fase 2
);

CREATE TABLE config (
  key TEXT PRIMARY KEY,
  value TEXT
);
-- rows: root_path, scan_depth, google_account_email (Fase 2), share_permission
```

`.tracker.json` di tiap folder project = source of truth kalau folder dipindah/dibagikan; SQLite = cache untuk performa UI. Saat scan, app baca `.tracker.json` kalau ada, kalau belum ada → buat baru dengan default value lalu insert ke SQLite.

### 10.3 Core Modules & Logic

**`scanner.js`**
- Input: `rootPath`, `depth` (dari config)
- Rekursif baca folder sampai level `depth`, treat folder di level tsb sebagai "Project"
- Untuk tiap project folder: cek `.tracker.json` → kalau tidak ada, generate default; ambil `fs.statSync` untuk `birthtime`/`mtime`
- Return array of project objects → upsert ke SQLite

**`watcher.js`**
- `chokidar.watch(rootPath, { depth, ignoreInitial: true })`
- Event `addDir` → trigger scan folder baru → insert ke DB → push event ke renderer (`ipcMain.emit` → `webContents.send`)
- Event `unlinkDir` → mark project sebagai "missing" (bukan langsung delete, biar user konfirmasi dulu)

**`tracker-file.js`**
- `readTrackerFile(folderPath)` / `writeTrackerFile(folderPath, data)`
- Validasi schema sebelum write (biar nggak corrupt kalau ada field aneh)

### 10.4 UI Screens (Fase 1)

1. **Onboarding Wizard** (3 step, sesuai §3.1): pilih root folder (native dialog `dialog.showOpenDialog`) → atur scan depth (dengan live preview struktur folder) → konfirmasi & scan pertama kali.
2. **Dashboard** — tabel dengan kolom: Project, Category, Status, Priority, Deadline, Modified Date. Filter by status/priority/bulan. Search bar.
3. **Project Panel** (slide-over/modal saat klik row) — edit Status (dropdown), Priority (dropdown), Deadline (date picker), Comments (textarea), toggle Approval. Auto-save ke `.tracker.json` + SQLite.
4. **Settings** — ubah root folder, ubah scan depth, lihat path config file.

### 10.5 Acceptance Criteria (Definition of Done — Fase 1)

- [ ] User bisa pilih root folder dan app berhasil scan struktur folder tanpa error meski penamaan folder bebas/tidak konsisten
- [ ] Dashboard menampilkan seluruh project terdeteksi dengan data akurat (nama, kategori, tanggal)
- [ ] Edit metadata di Project Panel tersimpan dan persist setelah app ditutup-buka lagi
- [ ] Folder project baru yang dibuat saat app berjalan otomatis muncul di dashboard (tanpa perlu re-scan manual)
- [ ] `.tracker.json` tidak korup meski folder dipindah/di-rename manual di luar app
- [ ] App jalan stabil di Windows 10/11 tanpa perlu instalasi Node.js terpisah (packaged via electron-builder)

### 10.6 Estimasi Timeline (1–2 minggu)

| Hari | Task |
|---|---|
| 1–2 | Scaffold Electron + React + Tailwind, setup IPC bridge, setup SQLite |
| 3–4 | Implementasi `scanner.js` + `tracker-file.js`, testing terhadap struktur folder existing (`D:/Project/H2 2026/`) |
| 5 | Onboarding Wizard UI |
| 6–7 | Dashboard UI + tabel + filter |
| 8 | Project Panel (edit metadata) + auto-save |
| 9 | Integrasi `watcher.js` (auto-detect folder baru) |
| 10 | Testing menyeluruh + packaging installer `.exe` |

---

**Next step setelah Fase 1 disetujui:** scaffold repo awal (package.json, struktur folder, konfigurasi Electron+React+Tailwind dasar) supaya kamu bisa langsung lanjut coding di VSCode dengan AI coding assistant kamu.
