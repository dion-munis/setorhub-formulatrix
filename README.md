# SetorHub Formulatrix

![SetorHub Header](./docs/header.png)

Desktop app (Electron + React + Tailwind + SQLite) untuk tracking project design team dari folder lokal. Scan folder project dan tracking status tanpa input manual laporan monthly task setiap 6 bulan sekali hehe

## Cara Menjalankan (Development)

Pastikan sudah install **Node.js 18+** dan **Python + build tools** guys (butuh `better-sqlite3` untuk native compile).

```bash
npm install
npm run dev
```

## Build Installer (.exe)

```bash
npm run build
```

Hasil installer ada di folder `release/`.

## Struktur Folder

```
src/
├── main/          # Electron main process (scanner, watcher, db, ipc)
├── preload/        # contextBridge — jembatan aman main ↔ renderer
└── renderer/       # React app (UI)
```

## Testing Manual

1. Jalankan `npm run dev`, lalu di Onboarding pilih root folder project.
2. Cek dashboard menampilkan semua project sesuai kedalaman folder.
3. Klik salah satu project, ubah status/priority/deadline, klik Simpan.
4. Cek file `.tracker.json` otomatis muncul di folder project.
5. Buat folder baru saat app berjalan → otomatis muncul di aplikasi.
6. Tutup dan buka lagi app → data tetap ada (persist).

Untuk panduan setup & konfigurasi lengkap bisa lihat disini https://dm-devs.notion.site/SetorHub-3a5a8af89e4f8045b26de158dfc56daa
