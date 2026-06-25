# Design Spec: Upload Materi & Bank Soal (100 Soal)

**Date:** 2026-06-25  
**Status:** Approved

---

## Ringkasan

Mengubah admin panel dari data statis (`mockData.ts`) ke sistem berbasis database yang memungkinkan:
1. Admin upload file PDF/Word sebagai konten materi
2. Admin import 100+ soal via CSV (25 tampil acak per sesi)
3. Soal dan pilihan jawaban diacak per user per percobaan

---

## 1. Arsitektur & Database Schema

### Tabel Baru

#### `materials`
```sql
id          VARCHAR PRIMARY KEY   -- slug, misal: "check-sheet"
title       VARCHAR(120) NOT NULL
category    VARCHAR(20) NOT NULL  -- "seven-tools" | "8-steps"
icon        VARCHAR(10)           -- emoji
description VARCHAR(255)
read_time   INTEGER               -- menit
color       VARCHAR(10)           -- hex color
file_url    VARCHAR(500)          -- path: "/uploads/materials/file.pdf"
file_type   VARCHAR(10)           -- "pdf" | "docx" | null
created_at  TIMESTAMP DEFAULT NOW()
```

#### `questions`
```sql
id            SERIAL PRIMARY KEY
material_id   VARCHAR REFERENCES materials(id)
question      TEXT NOT NULL
options       JSONB NOT NULL      -- array 4 strings
correct_index INTEGER NOT NULL    -- 0-3
explanation   TEXT
created_at    TIMESTAMP DEFAULT NOW()
```

### File Storage
- Direktori: `public/uploads/materials/`
- Nama file: `{material-id}-{timestamp}.{ext}`
- Di-serve oleh Next.js sebagai static asset

### Flow Data
```
Admin upload PDF  -> POST /api/admin/materials (multipart/form-data)
                  -> simpan file ke /public/uploads/materials/
                  -> insert/update tabel materials

Admin import CSV  -> POST /api/admin/questions/import (multipart)
                  -> parse CSV di server (tanpa library eksternal)
                  -> validate setiap baris
                  -> bulk insert ke tabel questions

User mulai kuis   -> GET /api/quiz/questions?topic=all
                  -> ambil semua soal dari DB sesuai topik
                  -> shuffle soal + shuffle opsi (koreksi correctIndex)
                  -> slice 25 soal
                  -> return ke client
```

---

## 2. API Routes

| Method | Path | Fungsi | Auth |
|--------|------|--------|------|
| GET | `/api/admin/materials` | List semua materi | ADMIN |
| POST | `/api/admin/materials` | Tambah materi + upload file | ADMIN |
| PUT | `/api/admin/materials/[id]` | Edit materi + ganti file | ADMIN |
| DELETE | `/api/admin/materials/[id]` | Hapus materi + hapus file | ADMIN |
| GET | `/api/admin/questions` | List semua soal (paginasi) | ADMIN |
| POST | `/api/admin/questions` | Tambah soal satu per satu | ADMIN |
| POST | `/api/admin/questions/import` | Import massal CSV | ADMIN |
| PUT | `/api/admin/questions/[id]` | Edit soal | ADMIN |
| DELETE | `/api/admin/questions/[id]` | Hapus soal | ADMIN |
| GET | `/api/quiz/questions` | Ambil soal teracak untuk kuis | USER |

### Format CSV Import Soal
```
material_id,question,option_a,option_b,option_c,option_d,correct_index,explanation
check-sheet,"Apa tujuan...",Pilihan A,Pilihan B,Pilihan C,Pilihan D,1,"Penjelasan..."
```
- `correct_index`: 0=A, 1=B, 2=C, 3=D
- Baris dengan format salah di-skip dan dilaporkan ke admin
- Template CSV tersedia untuk didownload

---

## 3. Admin UI

### `/admin/materi` — Perubahan
- Form tambah materi: tambah field **Upload File** (input type=file, accept .pdf,.docx)
- Preview nama file terpilih sebelum submit
- Tabel daftar materi: tambah kolom **File** (badge PDF/DOCX + tombol preview)
- Tombol Edit: bisa upload file baru (file lama dihapus dari disk)
- Tombol Hapus: hapus materi + hapus file dari disk
- Data fetch dari `GET /api/admin/materials`

### `/admin/soal` — Perubahan
- Form tambah soal satu per satu tetap ada -> POST `/api/admin/questions`
- Tambah tombol **"Import CSV"**:
  - Upload file .csv
  - Preview jumlah baris valid sebelum konfirmasi
  - Tampilkan error baris yang tidak valid
  - Konfirmasi -> POST `/api/admin/questions/import`
- Tombol **"Download Template CSV"** untuk contoh format
- Stats card update real-time dari DB (bukan hardcoded)
- Data fetch dari `GET /api/admin/questions`

---

## 4. Kuis & Randomisasi

### Perubahan `/quezee/[id]/page.tsx`
- Hapus import `QUESTIONS` dari `mockData.ts`
- Saat mount: `fetch('/api/quiz/questions?topic={id}')`
- Loading state saat fetch berlangsung
- Soal yang datang dari API sudah ter-shuffle (soal + opsi)

### Logika Shuffle di Server (`/api/quiz/questions`)
```typescript
// 1. Ambil soal dari DB sesuai topik
// 2. Shuffle urutan soal (Fisher-Yates)
// 3. Ambil 25 soal pertama
// 4. Per soal: shuffle opsi + update correctIndex
//    - Buat mapping: originalIndex -> newIndex
//    - Shuffle opsi array
//    - correctIndex = newIndex dari correctIndex lama
// 5. Return ke client
```

Randomisasi di server agar pilihan jawaban tidak bisa di-inspect di browser sebelum dipilih.

---

## 5. Halaman Materi User

### `/materi/[id]` — Perubahan
- Fetch materi dari DB (bukan mockData)
- Jika `file_url` ada: tampilkan `<iframe src={file_url}>` full-width (PDF viewer)
- Jika `file_url` null: fallback tampilkan konten Markdown (untuk materi lama yang belum diupload)
- Judul, deskripsi, waktu baca tetap ditampilkan di atas iframe

---

## 6. Seed Data

Script `src/lib/db/seed.ts` dijalankan sekali:
- Insert 15 materi dari `mockData.ts` -> tabel `materials` (file_url = null)
- Insert 25 soal dari `mockData.ts` -> tabel `questions`
- Pakai `onConflictDoNothing()` agar aman dijalankan ulang

Jalankan dengan: `npx tsx src/lib/db/seed.ts`

---

## 7. File yang Diubah / Dibuat

### Diubah
| File | Perubahan |
|------|-----------|
| `src/lib/db/schema.ts` | Tambah tabel `materials` & `questions` |
| `src/app/admin/materi/page.tsx` | Sambungkan ke API + file upload UI |
| `src/app/admin/soal/page.tsx` | Sambungkan ke API + import CSV UI |
| `src/app/quezee/[id]/page.tsx` | Fetch soal dari API (bukan mockData) |
| `src/app/materi/[id]/page.tsx` | PDF viewer via iframe |

### Dibuat Baru
| File | Fungsi |
|------|--------|
| `src/app/api/admin/materials/route.ts` | GET + POST materi |
| `src/app/api/admin/materials/[id]/route.ts` | PUT + DELETE materi |
| `src/app/api/admin/questions/route.ts` | GET + POST soal |
| `src/app/api/admin/questions/[id]/route.ts` | PUT + DELETE soal |
| `src/app/api/admin/questions/import/route.ts` | Import CSV massal |
| `src/app/api/quiz/questions/route.ts` | Soal teracak untuk kuis |
| `src/lib/db/seed.ts` | Seed data dari mockData |
| `public/uploads/materials/.gitkeep` | Direktori upload |

---

## 8. Constraints & Batasan

- Upload file: maksimal **10 MB** per file
- Format diterima: `.pdf`, `.docx`
- CSV import: maksimal **500 baris** per upload
- Pool soal per topik minimal 25 agar kuis bisa berjalan
- Jika pool < 25, API return error dan kuis tidak bisa dimulai
- `mockData.ts` tetap ada tapi tidak lagi digunakan oleh halaman (bisa dihapus setelah seed berhasil)
