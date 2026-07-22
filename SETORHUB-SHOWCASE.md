# SetorHub

### Setor Project Tanpa Drama, Rapor Aman Setiap 6 Bulan

---

## Table of Contents

1. [Apa itu SetorHub?](#1-apa-itu-setorhub)
2. [Kenapa SetorHub?](#2-kenapa-setorhub)
3. [Fitur Utama](#3-fitur-utama)
4. [Tech Stack](#4-tech-stack)
5. [Cara Install](#5-cara-install)
6. [Cara Setup & Konfigurasi](#6-cara-setup--konfigurasi)
7. [Cara Menggunakan](#7-cara-menggunakan)
8. [Integrasi Google Drive](#8-integrasi-google-drive)
9. [Generate Report](#9-generate-report)
10. [Arsitektur Sistem](#10-arsitektur-sistem)
11. [Struktur File](#11-struktur-file)
12. [FAQ & Troubleshooting](#12-faq--troubleshooting)

---

## 1. Apa itu SetorHub?

**SetorHub** adalah aplikasi desktop untuk **tracking project design team** dari folder lokal. Aplikasi ini dibangun khusus untuk tim Marketing Design Formulatrix agar dapat:

- Memantau seluruh project dalam satu dashboard
- Mengetahui status setiap project secara real-time
- Generate report bulanan ke Google Sheets otomatis
- Mengupload file ke Google Drive langsung dari aplikasi

> **Target Users:** Marketing Design Team (6 orang: 2 3D Designers, 1 Developer, 1 Manager, 2 Graphic Designers)

---

## 2. Kenapa SetorHub?

| Masalah Sebelumnya | Solusi SetorHub |
|---|---|
| Report manual ke Google Sheets, rentan salah | Auto-generate report dengan format rapi |
| Tidak tahu status project terkini | Dashboard real-time dengan 6 status kategori |
| File project berantakan, sulit cari | Integrasi Google Drive, upload langsung dari app |
| Lupa project mana yang sudah disetor | Status badge warna-warni, filter & search |
| Report 6 bulan susah tracking | Semua data tersimpan di SQLite + `.tracker.json` |

---

## 3. Fitur Utama

### Dashboard
- **Status Summary Cards** — 6 kartu berwarna menunjukkan jumlah project per status (On Progress, Done, Need Review, Delayed, Cancelled, Revise) dengan persentase dan progress bar
- **Project Table** — Tabel lengkap dengan kolom: Project, Kategori, Status, Priority, Tgl Mulai, Approver, Terakhir Diubah, Drive
- **Filter & Search** — Cari by nama, filter by status, filter by priority
- **Real-time Update** — Otomatis update ketika folder project berubah

### Project Management
- **Auto-Scan** — Mendeteksi project dari folder lokal secara otomatis
- **Manual Rescan** — Tombol "Scan Ulang" untuk refresh kapan saja
- **Edit Project** — Panel slide-from-right untuk ubah status, priority, approver, dan comments
- **File Watcher** — Monitor folder, auto-rescan saat ada folder baru/hapus (800ms debounce)

### Google Drive Integration
- **OAuth2 Login** — One-click login ke Google Drive
- **Link Project** — Buat folder di Drive otomatis mengikuti struktur lokal
- **Upload File** — Drag & drop / click untuk upload file (max 500MB per file)
- **Generate Report** — Export ke Google Sheets dengan format profesional

### Onboarding
- **2-Step Wizard** — Pilih root folder + atur level scanning
- **Slider Level** — Fleksibel 1-10 level folder
- **Preloader** — Splash screen animasi saat aplikasi dimulai

---

## 4. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Desktop Shell | Electron | ^31.3.1 |
| UI Framework | React | ^18.3.1 |
| Build Tool | Vite | ^5.4.2 |
| CSS | Tailwind CSS | ^3.4.10 |
| State Management | Zustand | ^4.5.5 |
| Database | SQLite (better-sqlite3) | ^11.3.0 |
| File Watcher | Chokidar | ^3.6.0 |
| Google Drive API | Googleapis | ^173.0.0 |
| Report Generation | ExcelJS | ^4.4.0 |
| Font | Montserrat | Google Fonts |

---

## 5. Cara Install

### Prerequisites
- **Node.js** v18 atau lebih baru
- **npm** (biasanya sudah include dengan Node.js)
- **Windows Build Tools** (untuk kompilasi `better-sqlite3`)

### Langkah Install

```bash
# 1. Clone atau copy project
cd D:\Marketing\Project\H12026\Design Team Task Tracker

# 2. Masuk ke folder project
cd marketing-task-tracker

# 3. Install dependencies
npm install

# 4. Jalankan aplikasi (development mode)
npm run dev
```

### Commands Tersedia

| Command | Fungsi |
|---|---|
| `npm run dev` | Jalankan aplikasi dalam mode development |
| `npm run build` | Build untuk production (installer .exe) |
| `npm run dev:renderer` | Jalankan Vite dev server saja |
| `npm run dev:electron` | Jalankan Electron saja |

---

## 6. Cara Setup & Konfigurasi

### Step 1: Pilih Root Folder

Saat pertama kali membuka aplikasi, kamu akan melihat **Onboarding Wizard**:

1. Klik **"Klik untuk memilih folder"**
2. Pilih folder root yang berisi semua project design team
3. Klik **"Lanjut"**

> **Contoh:** `D:\Marketing\Project\H2 2026`

### Step 2: Atur Level Folder

Atur berapa level folder sampai dianggap sebagai "Project":

- **Slider 1-10** — Geser untuk pilih level
- **Contoh dinamis** — Lihat preview path secara real-time

> **Penjelasan:**
> ```
> Root Folder/
>   Kategori/              ← Level 1
>     Sub Kategori/        ← Level 2
>       Nama Project/      ← Level 3 ← Ini yang dianggap "Project"
> ```

### Step 3: Mulai Scan

Klik **"Mulai Scan"** — Aplikasi akan mulai memindai folder dan menampilkan project di dashboard.

### Konfigurasi Tambahan (Opsional)

Buka **Pengaturan** (ikon gear di header):

| Setting | Deskripsi |
|---|---|
| **Root Folder** | Ubah folder root yang di-scan |
| **Level Folder** | Adjust scanning depth (1-10) |
| **Drive Root Folder** | Path dasar untuk folder Google Drive (opsional) |

---

## 7. Cara Menggunakan

### Melihat Project

Setelah scan selesai, semua project akan muncul di **Project Table**:

- **Status Badge** — Warna menunjukkan status: On Progress (kuning), Done (hijau), Need Review (biru), Delayed (ungu), Cancelled (abu), Revise (merah)
- **Priority Dot** — Titik warna: Urgent (merah), Medium (kuning), Low (hijau)
- **Hover** — Klik nama project untuk melihat detail

### Filter Project

Di bagian **Filter Bar**:
- **Search** — Ketik nama project untuk mencari
- **Status Dropdown** — Filter berdasarkan status
- **Priority Dropdown** — Filter berdasarkan prioritas
- **Klik Status Card** — Klik kartu status di atas untuk toggle filter

### Edit Project

1. **Klik nama project** di tabel → Panel slide-in dari kanan
2. **Ubah Status** — Pilih dari dropdown (6 opsi)
3. **Ubah Priority** — Klik tombol Urgent / Medium / Low
4. **Isi Approver** — Ketik nama approver
5. **Tambah Comments** — Catatan tambahan
6. Klik **"Simpan"**

### Rescan Manual

Klik tombol **"Scan Ulang"** di header untuk memindai ulang folder.

---

## 8. Integrasi Google Drive

### Login ke Google Drive

1. Klik tombol **"Hubungkan Drive"** di header
2. Browser akan terbuka → login ke akun Google
3. Klik **"Allow"** untuk memberikan akses
4. Kembali ke aplikasi → status berubah jadi "Drive Terhubung" (hijau)

### Link Project ke Drive

1. Di tabel project, klik tombol **"Link to Drive"**
2. Aplikasi akan membuat folder di Drive mengikuti struktur lokal
3. Setelah ter-link, tombol berubah jadi **"Drive + Upload"**

### Upload File

1. Klik tombol **"Drive + Upload"** di project
2. **Drag & drop** file atau klik untuk memilih
3. Klik **"Upload"**
4. Progress bar akan menunjukkan proses upload
5. Klik **"Buka di Google Drive"** setelah selesai

### Buka Folder di Drive

Klik tombol **"Drive"** (ikon link) di tabel → membuka folder project di Google Drive.

### Putuskan Hubungan

1. Klik **"Drive Terhubung"** di header
2. Klik **"Putuskan Hubungan"**
3. Konfirmasi → project tidak lagi terhubung ke Drive

---

## 9. Generate Report

### Cara Generate

1. Klik tombol **"Report"** di header
2. Aplikasi akan generate Excel dengan semua project
3. File otomatis diupload ke Google Sheets
4. Browser terbuka dengan report yang sudah jadi

### Isi Report

| Kolom | Deskripsi |
|---|---|
| Project Description | Nama project |
| Status/progress | Status dengan warna |
| Date | Tanggal dibuat |
| Priority (Urgent/Medium/Low) | Tanda "v" sesuai prioritas |
| Approval | Nama approver |
| Link to Files | Link ke Google Drive folder |
| Comments | Catatan tambahan |

### Format Report

- Header berwarna hitam dengan teks putih
- Status cell berwarna sesuai kategori
- Priority cell ditandai dengan "v"
- Link ke Drive folder (klik untuk buka)
- Legend warna di bagian bawah
- Sheet name: "Report"

---

## 10. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────┐
│                    SETORHUB                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐  │
│  │  Main Process │    │   Renderer Process       │  │
│  │  (Node.js)    │    │   (React + Tailwind)     │  │
│  │               │    │                          │  │
│  │  - Scanner    │◄──►│  - Dashboard             │  │
│  │  - Watcher    │IPC │  - Project Table         │  │
│  │  - DB (SQLite)│    │  - Filter Bar            │  │
│  │  - Google API │    │  - Project Panel         │  │
│  │  - IPC        │    │  - Settings Modal        │  │
│  └──────┬───────┘    │  - Preloader             │  │
│         │            └──────────────────────────┘  │
│         ▼                                          │
│  ┌──────────────┐                                  │
│  │  Local Folders│  ◄── Scans project directories  │
│  └──────────────┘                                  │
│         │                                          │
│         ▼                                          │
│  ┌──────────────┐                                  │
│  │  Google Drive │  ◄── Upload, link, report       │
│  └──────────────┘                                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Data Flow

```
Folder di Disk
    ↓ (scanner.js)
SQLite Database
    ↓ (IPC)
Zustand Store
    ↓ (React)
Dashboard UI
    ↓ (User Action)
Google Drive API
```

---

## 11. Struktur File

```
marketing-task-tracker/
├── src/
│   ├── main/                          # Electron Main Process
│   │   ├── index.js                   # Entry point, window creation
│   │   ├── db.js                      # SQLite database
│   │   ├── scanner.js                 # Folder scanning logic
│   │   ├── watcher.js                 # File system watcher
│   │   ├── tracker-file.js            # .tracker.json handler
│   │   ├── ipc-handlers.js            # IPC channel handlers
│   │   └── google-drive/
│   │       ├── auth.js                # OAuth2 authentication
│   │       ├── credentials.json       # Google API credentials
│   │       └── drive-service.js       # Drive operations
│   │
│   ├── preload/
│   │   └── index.js                   # contextBridge (window.api)
│   │
│   └── renderer/                      # React Frontend
│       ├── index.html                 # HTML entry + Montserrat font
│       ├── index.css                  # Tailwind + custom CSS
│       ├── main.jsx                   # React root mount
│       ├── App.jsx                    # Root component
│       ├── store/
│       │   └── useProjectStore.js     # Zustand state management
│       ├── screens/
│       │   ├── Onboarding.jsx         # 2-step setup wizard
│       │   ├── Dashboard.jsx          # Main dashboard
│       │   └── ProjectPanel.jsx       # Project detail editor
│       └── components/
│           ├── Preloader.jsx          # Splash screen
│           ├── ProjectTable.jsx       # Data table
│           ├── StatusBadge.jsx        # Status pill
│           ├── FilterBar.jsx          # Search + filters
│           ├── SettingsModal.jsx      # Settings dialog
│           ├── DriveStatus.jsx        # Drive connection status
│           ├── DriveButton.jsx        # Per-project Drive button
│           └── LinkToDriveModal.jsx   # Upload + link modal
│
├── dist/                              # Built renderer output
├── release/                           # Production installer output
├── package.json                       # Config + dependencies
├── vite.config.js                     # Vite bundler config
├── tailwind.config.js                 # Tailwind theme
└── postcss.config.js                  # PostCSS plugins
```

---

## 12. FAQ & Troubleshooting

### Q: Kenapa project tidak muncul setelah scan?
**A:** Pastikan:
1. Root folder sudah benar di Pengaturan
2. Level folder sesuai dengan struktur folder kamu
3. Folder project tidak diawali dengan titik (.)

### Q: Bagaimana cara mengubah level scanning?
**A:** Buka Pengaturan (ikon gear) → Geser slider "Level Folder" → Klik "Simpan & Scan Ulang"

### Q: Google Drive tidak bisa login?
**A:** Pastikan:
1. Koneksi internet aktif
2. Browser bisa membuka halaman Google login
3. Firewall tidak memblokir port 3847

### Q: Report tidak bisa di-generate?
**A:** Pastikan Google Drive sudah terhubung (status hijau). Jika belum, login dulu ke Drive.

### Q: Folder project pindah, bagaimana?
**A:** Pindahkan folder → Klik "Scan Ulang" → App akan mendeteksi perubahan. Folder yang hilang akan ditandai "Folder hilang".

### Q: Bagaimana cara build untuk production?
**A:** Jalankan `npm run build` → Installer akan tersedia di folder `release/`.

### Q: Data project tersimpan di mana?
**A:**
- **SQLite database:** `{userData}/tracker.db` (otomatis oleh Electron)
- **Per-project:** `.tracker.json` di dalam folder project (portable backup)

---

## Contact

**Author:** Wahid - Formulatrix
**Team:** Marketing Design Team

---

*SetorHub — Setor Project Tanpa Drama, Rapor Aman Setiap 6 Bulan*
