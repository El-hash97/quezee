# Upload Materi & Bank Soal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate materials and questions from static `mockData.ts` to PostgreSQL, enable admin to upload PDF/Word files for materi and bulk-import soal via CSV, and serve 25 randomly-shuffled questions (soal + opsi) per quiz session from the live database.

**Architecture:** Two new Drizzle tables (`materials`, `questions`) are added to the existing Neon PostgreSQL database. Admin CRUD is handled by new Next.js API routes under `/api/admin/`. A public quiz route `/api/quiz/questions` shuffles both question order and answer options server-side before returning 25 questions. Uploaded files are stored in `public/uploads/materials/` and served by Next.js as static assets.

**Tech Stack:** Next.js App Router, Drizzle ORM + Neon PostgreSQL, Node.js `fs/promises` for file writes, native `FormData` for multipart upload, no new npm dependencies.

## Global Constraints

- Auth guard pattern for admin: `const session = await getSession(); if (!session || session.role !== 'ADMIN') return Response.json({ error: 'Akses ditolak.' }, { status: 403 });`
- All API routes must include `export const dynamic = 'force-dynamic';`
- File upload: max 10 MB, accept only `.pdf` and `.docx`
- CSV import: max 500 rows per upload
- Minimum 25 questions in the pool required for a quiz to start (return 422 if not met)
- `onConflictDoNothing()` used in seed to make it safely re-runnable
- Do not remove `mockData.ts` — seed script imports from it

---

### Task 1: Extend DB Schema + Create Uploads Directory

**Files:**
- Modify: `src/lib/db/schema.ts`
- Create: `public/uploads/materials/.gitkeep`

**Interfaces:**
- Produces: `materials` table, `questions` table exported from `src/lib/db/schema.ts` and used in all subsequent API tasks

- [ ] **Step 1: Add tables to schema**

Replace the entire contents of `src/lib/db/schema.ts` with:

```typescript
import { pgTable, varchar, integer, timestamp, serial, text, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  noreg:        varchar('noreg',         { length: 7   }).primaryKey(),
  name:         varchar('name',          { length: 120 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  line:         varchar('line',          { length: 60  }),
  division:     varchar('division',      { length: 60  }),
  role:         varchar('role',          { length: 20  }).notNull().default('PARTICIPANT'),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id:             serial('id').primaryKey(),
  noreg:          varchar('noreg',           { length: 7   }).notNull().references(() => users.noreg),
  attemptNumber:  integer('attempt_number').notNull(),
  topic:          varchar('topic',           { length: 120 }),
  correctAnswers: integer('correct_answers').notNull().default(0),
  wrongAnswers:   integer('wrong_answers'  ).notNull().default(0),
  pointsEarned:   integer('points_earned'  ).notNull().default(0),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const materials = pgTable('materials', {
  id:          varchar('id',          { length: 60  }).primaryKey(),
  title:       varchar('title',       { length: 120 }).notNull(),
  category:    varchar('category',    { length: 20  }).notNull(),
  icon:        varchar('icon',        { length: 20  }),
  description: varchar('description', { length: 500 }),
  readTime:    integer('read_time'),
  color:       varchar('color',       { length: 10  }),
  fileUrl:     varchar('file_url',    { length: 500 }),
  fileType:    varchar('file_type',   { length: 10  }),
  createdAt:   timestamp('created_at').defaultNow(),
});

export const questions = pgTable('questions', {
  id:           serial('id').primaryKey(),
  materialId:   varchar('material_id', { length: 60 }).references(() => materials.id, { onDelete: 'set null' }),
  question:     text('question').notNull(),
  options:      jsonb('options').$type<string[]>().notNull(),
  correctIndex: integer('correct_index').notNull(),
  explanation:  text('explanation'),
  createdAt:    timestamp('created_at').defaultNow(),
});
```

- [ ] **Step 2: Push schema to database**

```bash
npx drizzle-kit push
```

Expected output: lines confirming `materials` and `questions` tables created. The `users` and `quiz_attempts` tables already exist and will not be recreated.

- [ ] **Step 3: Create uploads directory**

Create an empty file at `public/uploads/materials/.gitkeep` so the directory is tracked by git. The file content should be empty.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/schema.ts public/uploads/materials/.gitkeep
git commit -m "feat: add materials and questions tables to DB schema"
```

---

### Task 2: Seed Script — Migrate mockData to Database

**Files:**
- Create: `src/lib/db/seed.ts`

**Interfaces:**
- Consumes: `materials` table, `questions` table (Task 1); `MATERIALS`, `QUESTIONS` from `src/lib/mockData.ts`
- Produces: 15 rows in `materials`, 25 rows in `questions` (idempotent via `onConflictDoNothing`)

- [ ] **Step 1: Create seed script**

Create `src/lib/db/seed.ts`:

```typescript
import { db } from './index';
import { materials, questions } from './schema';
import { MATERIALS, QUESTIONS } from '../mockData';

async function seed() {
  console.log('Seeding materials...');
  for (const m of MATERIALS) {
    await db.insert(materials).values({
      id:          m.id,
      title:       m.title,
      category:    m.category,
      icon:        m.icon,
      description: m.description,
      readTime:    m.readTime,
      color:       m.color,
      fileUrl:     null,
      fileType:    null,
    }).onConflictDoNothing();
  }

  console.log('Seeding questions...');
  for (const q of QUESTIONS) {
    await db.insert(questions).values({
      id:           q.id,
      materialId:   q.materialId,
      question:     q.question,
      options:      q.options,
      correctIndex: q.correctIndex,
      explanation:  q.explanation,
    }).onConflictDoNothing();
  }

  console.log(`Done: ${MATERIALS.length} materi, ${QUESTIONS.length} soal seeded.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
```

- [ ] **Step 2: Run seed**

```bash
npx tsx src/lib/db/seed.ts
```

Expected output:
```
Seeding materials...
Seeding questions...
Done: 15 materi, 25 soal seeded.
```

- [ ] **Step 3: Verify in database**

```bash
npx drizzle-kit studio
```

Open the URL shown in browser. Confirm `materials` table has 15 rows and `questions` has 25 rows. Then Ctrl+C to close studio.

- [ ] **Step 4: Commit**

```bash
git add src/lib/db/seed.ts
git commit -m "feat: add seed script to populate DB from mockData"
```

---

### Task 3: Public Materials API (User-Facing)

**Files:**
- Create: `src/app/api/materials/route.ts`
- Create: `src/app/api/materials/[id]/route.ts`

**Interfaces:**
- Consumes: `materials` table (Task 1)
- Produces:
  - `GET /api/materials` — returns `MaterialRow[]` for any authenticated user
  - `GET /api/materials/[id]` — returns single `MaterialRow` or 404
  - `MaterialRow`: `{ id: string, title: string, category: string, icon: string|null, description: string|null, readTime: number|null, color: string|null, fileUrl: string|null, fileType: string|null, createdAt: Date|null }`

- [ ] **Step 1: Create list endpoint**

Create `src/app/api/materials/route.ts`:

```typescript
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { materials } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const rows = await db.select().from(materials).orderBy(asc(materials.createdAt));
  return Response.json(rows);
}
```

- [ ] **Step 2: Create single-item endpoint**

Create `src/app/api/materials/[id]/route.ts`:

```typescript
import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { materials } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const { id } = await params;
  const [row]  = await db.select().from(materials).where(eq(materials.id, id));
  if (!row) return Response.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });
  return Response.json(row);
}
```

- [ ] **Step 3: Verify endpoints**

Start dev server (`npm run dev`). Open browser DevTools while logged in and run:

```javascript
fetch('/api/materials').then(r=>r.json()).then(d=>console.log('count:', d.length))
// Expected: count: 15

fetch('/api/materials/check-sheet').then(r=>r.json()).then(console.log)
// Expected: object with id:"check-sheet", title:"Check Sheet", etc.
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/materials/
git commit -m "feat: add public materials API for authenticated users"
```

---

### Task 4: Admin Materials API (CRUD + File Upload)

**Files:**
- Create: `src/app/api/admin/materials/route.ts`
- Create: `src/app/api/admin/materials/[id]/route.ts`

**Interfaces:**
- Consumes: `materials` table (Task 1); `public/uploads/materials/` directory (Task 1)
- Produces:
  - `GET /api/admin/materials` — `MaterialRow[]` (ADMIN only)
  - `POST /api/admin/materials` — multipart/form-data, fields: `id`, `title`, `category`, `icon`, `description`, `readTime`, `color`, `file` (optional File) — returns `{ success: true, id: string }` (201)
  - `PUT /api/admin/materials/[id]` — same fields minus `id` — returns `{ success: true }`
  - `DELETE /api/admin/materials/[id]` — returns `{ success: true }`, deletes file from disk

- [ ] **Step 1: Create GET + POST handler**

Create `src/app/api/admin/materials/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { materials } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const rows = await db.select().from(materials).orderBy(asc(materials.createdAt));
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const fd = await req.formData();
  const id          = String(fd.get('id') ?? '').trim().toLowerCase().replace(/\s+/g, '-');
  const title       = String(fd.get('title') ?? '').trim();
  const category    = String(fd.get('category') ?? '').trim();
  const icon        = String(fd.get('icon') ?? '').trim();
  const description = String(fd.get('description') ?? '').trim();
  const readTime    = parseInt(String(fd.get('readTime') ?? '0')) || null;
  const color       = String(fd.get('color') ?? '#4F8EF7').trim();
  const file        = fd.get('file') as File | null;

  if (!id || !title || !category)
    return Response.json({ error: 'ID, judul, dan kategori wajib diisi.' }, { status: 400 });

  let fileUrl: string | null = null;
  let fileType: string | null = null;

  if (file && file.size > 0) {
    if (file.size > 10 * 1024 * 1024)
      return Response.json({ error: 'File maksimal 10 MB.' }, { status: 400 });
    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    if (!['pdf', 'docx'].includes(ext))
      return Response.json({ error: 'Hanya file PDF atau DOCX yang diizinkan.' }, { status: 400 });
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'materials');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${id}-${Date.now()}.${ext}`;
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    fileUrl  = `/uploads/materials/${filename}`;
    fileType = ext;
  }

  try {
    await db.insert(materials).values({
      id, title, category,
      icon:        icon        || null,
      description: description || null,
      readTime,
      color:       color       || null,
      fileUrl,
      fileType,
    });
    return Response.json({ success: true, id }, { status: 201 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('duplicate') || msg.includes('unique'))
      return Response.json({ error: `ID "${id}" sudah digunakan.` }, { status: 409 });
    console.error('POST /api/admin/materials', e);
    return Response.json({ error: 'Gagal menyimpan ke database.' }, { status: 500 });
  }
}
```

- [ ] **Step 2: Create PUT + DELETE handler**

Create `src/app/api/admin/materials/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { materials } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { id } = await params;
  const fd = await req.formData();
  const title       = String(fd.get('title') ?? '').trim();
  const category    = String(fd.get('category') ?? '').trim();
  const icon        = String(fd.get('icon') ?? '').trim();
  const description = String(fd.get('description') ?? '').trim();
  const readTime    = parseInt(String(fd.get('readTime') ?? '0')) || null;
  const color       = String(fd.get('color') ?? '').trim();
  const file        = fd.get('file') as File | null;

  if (!title || !category)
    return Response.json({ error: 'Judul dan kategori wajib diisi.' }, { status: 400 });

  const [existing] = await db.select().from(materials).where(eq(materials.id, id));
  if (!existing) return Response.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });

  let fileUrl  = existing.fileUrl;
  let fileType = existing.fileType;

  if (file && file.size > 0) {
    if (file.size > 10 * 1024 * 1024)
      return Response.json({ error: 'File maksimal 10 MB.' }, { status: 400 });
    const ext = (file.name.split('.').pop() ?? '').toLowerCase();
    if (!['pdf', 'docx'].includes(ext))
      return Response.json({ error: 'Hanya file PDF atau DOCX yang diizinkan.' }, { status: 400 });
    if (existing.fileUrl) {
      await unlink(join(process.cwd(), 'public', existing.fileUrl)).catch(() => {});
    }
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'materials');
    await mkdir(uploadDir, { recursive: true });
    const filename = `${id}-${Date.now()}.${ext}`;
    await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    fileUrl  = `/uploads/materials/${filename}`;
    fileType = ext;
  }

  await db.update(materials).set({
    title, category,
    icon:        icon        || null,
    description: description || null,
    readTime,
    color:       color       || null,
    fileUrl,
    fileType,
  }).where(eq(materials.id, id));

  return Response.json({ success: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { id } = await params;
  const [existing] = await db.select().from(materials).where(eq(materials.id, id));
  if (!existing) return Response.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });

  if (existing.fileUrl) {
    await unlink(join(process.cwd(), 'public', existing.fileUrl)).catch(() => {});
  }

  await db.delete(materials).where(eq(materials.id, id));
  return Response.json({ success: true });
}
```

- [ ] **Step 3: Verify via DevTools (admin session)**

```javascript
// GET list
fetch('/api/admin/materials').then(r=>r.json()).then(d=>console.log('count:', d.length))

// POST new (without file)
const fd = new FormData();
fd.append('id','test-del'); fd.append('title','Test'); fd.append('category','seven-tools');
fetch('/api/admin/materials', {method:'POST', body:fd}).then(r=>r.json()).then(console.log)
// Expected: {success:true, id:"test-del"}

// DELETE it
fetch('/api/admin/materials/test-del', {method:'DELETE'}).then(r=>r.json()).then(console.log)
// Expected: {success:true}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/materials/
git commit -m "feat: add admin materials CRUD API with file upload"
```

---

### Task 5: Admin Questions API (CRUD)

**Files:**
- Create: `src/app/api/admin/questions/route.ts`
- Create: `src/app/api/admin/questions/[id]/route.ts`

**Interfaces:**
- Consumes: `questions` table (Task 1)
- Produces:
  - `GET /api/admin/questions` — `QuestionRow[]`
  - `POST /api/admin/questions` — JSON body: `{ materialId?, question, options: string[4], correctIndex: 0-3, explanation? }` — returns `QuestionRow` (201)
  - `PUT /api/admin/questions/[id]` — same JSON body — returns `{ success: true }`
  - `DELETE /api/admin/questions/[id]` — returns `{ success: true }`
  - `QuestionRow`: `{ id: number, materialId: string|null, question: string, options: string[], correctIndex: number, explanation: string|null, createdAt: Date|null }`

- [ ] **Step 1: Create GET + POST handler**

Create `src/app/api/admin/questions/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const rows = await db.select().from(questions).orderBy(asc(questions.id));
  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const body         = await req.json();
  const materialId   = String(body.materialId  ?? '').trim() || null;
  const question     = String(body.question    ?? '').trim();
  const options      = body.options as unknown;
  const correctIndex = parseInt(String(body.correctIndex ?? '-1'));
  const explanation  = String(body.explanation ?? '').trim() || null;

  if (!question)
    return Response.json({ error: 'Pertanyaan wajib diisi.' }, { status: 400 });
  if (!Array.isArray(options) || (options as string[]).length !== 4)
    return Response.json({ error: 'Harus ada tepat 4 pilihan jawaban.' }, { status: 400 });
  if (correctIndex < 0 || correctIndex > 3)
    return Response.json({ error: 'correct_index harus antara 0 dan 3.' }, { status: 400 });

  const [saved] = await db.insert(questions).values({
    materialId,
    question,
    options:      options as string[],
    correctIndex,
    explanation,
  }).returning();

  return Response.json(saved, { status: 201 });
}
```

- [ ] **Step 2: Create PUT + DELETE handler**

Create `src/app/api/admin/questions/[id]/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { id }       = await params;
  const qid          = parseInt(id);
  const body         = await req.json();
  const materialId   = String(body.materialId  ?? '').trim() || null;
  const question     = String(body.question    ?? '').trim();
  const options      = body.options as unknown;
  const correctIndex = parseInt(String(body.correctIndex ?? '-1'));
  const explanation  = String(body.explanation ?? '').trim() || null;

  if (!question)
    return Response.json({ error: 'Pertanyaan wajib diisi.' }, { status: 400 });
  if (!Array.isArray(options) || (options as string[]).length !== 4)
    return Response.json({ error: 'Harus ada tepat 4 pilihan jawaban.' }, { status: 400 });
  if (correctIndex < 0 || correctIndex > 3)
    return Response.json({ error: 'correct_index harus antara 0 dan 3.' }, { status: 400 });

  const [existing] = await db.select().from(questions).where(eq(questions.id, qid));
  if (!existing) return Response.json({ error: 'Soal tidak ditemukan.' }, { status: 404 });

  await db.update(questions).set({
    materialId,
    question,
    options:      options as string[],
    correctIndex,
    explanation,
  }).where(eq(questions.id, qid));

  return Response.json({ success: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { id } = await params;
  await db.delete(questions).where(eq(questions.id, parseInt(id)));
  return Response.json({ success: true });
}
```

- [ ] **Step 3: Verify**

```javascript
// POST a question
fetch('/api/admin/questions', {
  method: 'POST',
  headers: {'Content-Type':'application/json'},
  body: JSON.stringify({
    materialId: 'check-sheet',
    question: 'Soal test?',
    options: ['A','B','C','D'],
    correctIndex: 0,
    explanation: 'Karena A'
  })
}).then(r=>r.json()).then(d=>{ console.log(d); window._tid = d.id; })

// DELETE it
fetch(`/api/admin/questions/${window._tid}`, {method:'DELETE'}).then(r=>r.json()).then(console.log)
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/admin/questions/
git commit -m "feat: add admin questions CRUD API"
```

---

### Task 6: CSV Import API + Template File

**Files:**
- Create: `src/app/api/admin/questions/import/route.ts`
- Create: `public/template-soal.csv`

**Interfaces:**
- Consumes: `questions` table (Task 1)
- Produces:
  - `POST /api/admin/questions/import` — multipart/form-data, field `file` (.csv) — returns `{ success: true, inserted: number, errors: string[] }`
  - CSV headers: `material_id, question, option_a, option_b, option_c, option_d, correct_index, explanation`

- [ ] **Step 1: Create CSV template**

Create `public/template-soal.csv` with this exact content (no trailing newline):

```
material_id,question,option_a,option_b,option_c,option_d,correct_index,explanation
check-sheet,"Apa fungsi utama Check Sheet?","Membuat laporan","Mengumpulkan data sistematis","Membuat diagram","Menghitung biaya",1,"Check Sheet memudahkan pengumpulan data secara sistematis."
histogram,"Histogram bimodal mengindikasikan?","Proses stabil","Kemungkinan dua proses","Data tidak cukup","Proses cepat",1,"Bimodal menunjukkan dua populasi data yang berbeda."
```

- [ ] **Step 2: Create import route**

Create `src/app/api/admin/questions/import/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const fd   = await req.formData();
  const file = fd.get('file') as File | null;
  if (!file) return Response.json({ error: 'File CSV tidak ditemukan.' }, { status: 400 });

  const text  = await file.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length < 2)
    return Response.json({ error: 'File CSV kosong atau hanya berisi header.' }, { status: 400 });

  if (lines.length - 1 > 500)
    return Response.json({ error: 'Maksimal 500 soal per import.' }, { status: 400 });

  const headers  = parseCSVLine(lines[0]).map(h => h.trim());
  const required = ['material_id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_index', 'explanation'];
  const missing  = required.filter(r => !headers.includes(r));
  if (missing.length > 0)
    return Response.json({ error: `Kolom wajib tidak ada: ${missing.join(', ')}` }, { status: 400 });

  const toInsert: Array<{
    materialId:   string | null;
    question:     string;
    options:      string[];
    correctIndex: number;
    explanation:  string | null;
  }> = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]).map(v => v.trim());
    const row  = Object.fromEntries(headers.map((h, j) => [h, vals[j] ?? '']));

    if (!row['question']) { errors.push(`Baris ${i + 1}: kolom 'question' kosong`); continue; }
    if (!row['option_a'] || !row['option_b'] || !row['option_c'] || !row['option_d']) {
      errors.push(`Baris ${i + 1}: pilihan jawaban tidak lengkap`); continue;
    }
    const correctIndex = parseInt(row['correct_index']);
    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      errors.push(`Baris ${i + 1}: 'correct_index' harus angka 0-3`); continue;
    }

    toInsert.push({
      materialId:  row['material_id'] || null,
      question:    row['question'],
      options:     [row['option_a'], row['option_b'], row['option_c'], row['option_d']],
      correctIndex,
      explanation: row['explanation'] || null,
    });
  }

  if (toInsert.length === 0)
    return Response.json({ error: 'Tidak ada baris yang valid untuk diimport.', errors }, { status: 400 });

  await db.insert(questions).values(toInsert);
  return Response.json({ success: true, inserted: toInsert.length, errors });
}
```

- [ ] **Step 3: Verify template download**

Navigate to `http://localhost:3000/template-soal.csv` in browser. Should trigger download of a CSV file.

- [ ] **Step 4: Verify import**

```javascript
const text = `material_id,question,option_a,option_b,option_c,option_d,correct_index,explanation
check-sheet,"Import test soal?","A","B","C","D",0,"Karena A benar"`;
const blob = new Blob([text], {type:'text/csv'});
const fd = new FormData();
fd.append('file', blob, 'test.csv');
fetch('/api/admin/questions/import', {method:'POST', body:fd}).then(r=>r.json()).then(console.log)
// Expected: { success: true, inserted: 1, errors: [] }
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/admin/questions/import/ public/template-soal.csv
git commit -m "feat: add CSV bulk import API and template file for questions"
```

---

### Task 7: Quiz Questions API (Server-Side Shuffle)

**Files:**
- Create: `src/app/api/quiz/questions/route.ts`

**Interfaces:**
- Consumes: `questions` table (Task 1)
- Produces:
  - `GET /api/quiz/questions?topic=all|seven-tools|8-steps` — returns array of 25 `ShuffledQuestion` or 422 if pool < 25
  - `ShuffledQuestion`: `{ id: number, materialId: string|null, question: string, options: string[], correctIndex: number, explanation: string|null, createdAt: Date|null }`
  - Note: `options` array is shuffled, `correctIndex` reflects new position in the shuffled array

- [ ] **Step 1: Create quiz questions route**

Create `src/app/api/quiz/questions/route.ts`:

```typescript
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOptions(q: {
  id: number; materialId: string | null; question: string;
  options: string[]; correctIndex: number; explanation: string | null;
  createdAt: Date | null;
}) {
  const indices    = fisherYates([0, 1, 2, 3]);
  const newOptions = indices.map(i => q.options[i]);
  const newCorrect = indices.indexOf(q.correctIndex);
  return { ...q, options: newOptions, correctIndex: newCorrect };
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const topic = req.nextUrl.searchParams.get('topic') ?? 'all';
  const all   = await db.select().from(questions);

  const pool =
    topic === 'seven-tools' ? all.filter(q => q.materialId && !q.materialId.startsWith('langkah'))
    : topic === '8-steps'   ? all.filter(q => q.materialId && q.materialId.startsWith('langkah'))
    : all;

  if (pool.length < 25)
    return Response.json(
      { error: `Bank soal untuk topik "${topic}" belum mencukupi (${pool.length} soal, minimal 25).` },
      { status: 422 }
    );

  const shuffled = fisherYates(pool)
    .slice(0, 25)
    .map(q => shuffleOptions({ ...q, options: q.options as string[] }));

  return Response.json(shuffled);
}
```

- [ ] **Step 2: Verify**

```javascript
fetch('/api/quiz/questions?topic=all').then(r=>r.json()).then(d=>{
  console.log('count:', d.length);              // 25
  console.log('options:', d[0].options.length); // 4
})
```

Run this twice. The first question should differ between runs (shuffled).

- [ ] **Step 3: Commit**

```bash
git add src/app/api/quiz/questions/
git commit -m "feat: add quiz questions API with server-side shuffle"
```

---

### Task 8: Update Admin Materi UI

**Files:**
- Modify: `src/app/admin/materi/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/materials` (Task 4), `POST /api/admin/materials` (Task 4), `PUT /api/admin/materials/[id]` (Task 4), `DELETE /api/admin/materials/[id]` (Task 4)

- [ ] **Step 1: Replace admin materi page**

Replace entire contents of `src/app/admin/materi/page.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, FileText } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Material {
  id: string; title: string; category: string;
  icon: string | null; description: string | null;
  readTime: number | null; color: string | null;
  fileUrl: string | null; fileType: string | null;
}

const emptyForm = { id: '', title: '', category: 'seven-tools', icon: '', description: '', readTime: '', color: '#4F8EF7' };

export default function AdminMateriPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'seven-tools' | '8-steps'>('all');
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState(emptyForm);
  const [file,      setFile]      = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/materials')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMaterials(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = materials.filter(m =>
    (catFilter === 'all' || m.category === catFilter) &&
    (search === '' || m.title.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => { setForm(emptyForm); setFile(null); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.title || !form.category || (!editId && !form.id)) {
      alert('ID, judul, dan kategori wajib diisi'); return;
    }
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    const url    = editId ? `/api/admin/materials/${editId}` : '/api/admin/materials';
    const method = editId ? 'PUT' : 'POST';
    const res  = await fetch(url, { method, body: fd });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { alert(data.error ?? 'Gagal menyimpan'); return; }
    resetForm(); load();
  };

  const handleEdit = (m: Material) => {
    setForm({ id: m.id, title: m.title, category: m.category, icon: m.icon ?? '', description: m.description ?? '', readTime: String(m.readTime ?? ''), color: m.color ?? '#4F8EF7' });
    setEditId(m.id); setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus materi "${title}"? File terkait juga akan dihapus.`)) return;
    const res = await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Gagal menghapus'); return; }
    load();
  };

  return (
    <AppShell title="Kelola Materi" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">KELOLA MATERI</div>
        <div className="page-subtitle">Tambah, edit, dan hapus materi pembelajaran</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari judul materi..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'seven-tools', '8-steps'] as const).map(c => (
            <button key={c} className={`chip${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>
              {c === 'all' ? 'Semua' : c === 'seven-tools' ? 'Seven Tools' : '8 Steps'}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={14} /> Tambah Materi
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(5,150,105,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ backgroundColor: '#22c55e', color: '#000' }}>
              {editId ? 'Edit Materi' : 'Tambah Materi Baru'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {!editId && (
              <div>
                <label className="form-label">ID (slug, contoh: check-sheet)</label>
                <input className="input" placeholder="check-sheet" value={form.id}
                  onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              </div>
            )}
            <div>
              <label className="form-label">Judul Materi</label>
              <input className="input" placeholder="Check Sheet" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select className="input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="seven-tools">Seven Tools</option>
                <option value="8-steps">8 Steps</option>
              </select>
            </div>
            <div>
              <label className="form-label">Ikon (emoji)</label>
              <input className="input" placeholder="📋" value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Waktu Baca (menit)</label>
              <input className="input" type="number" placeholder="10" value={form.readTime}
                onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Deskripsi Singkat</label>
              <input className="input" placeholder="Deskripsi singkat materi..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Upload File (PDF / DOCX) — maks. 10 MB</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Upload size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={13} style={{ color: 'var(--green)' }} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{file.name}</span>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => setFile(null)}>✕</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pilih file PDF atau DOCX...</span>
                  )}
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  Browse
                  <input type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Menyimpan...' : (editId ? 'Update Materi' : 'Simpan Materi')}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(materials.length), label: 'Total Materi', color: 'var(--blue)' },
          { value: String(materials.filter(m => m.category === 'seven-tools').length), label: 'Seven Tools', color: 'var(--amber)' },
          { value: String(materials.filter(m => m.category === '8-steps').length), label: '8 Steps', color: 'var(--indigo)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16, backgroundColor: '#f97316', color: '#000' }}>
          Daftar Materi ({filtered.length})
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Memuat data...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Ikon</th><th>Judul</th><th>Kategori</th><th>Baca</th><th>File</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Tidak ada materi</td></tr>
                )}
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${m.color ?? '#4F8EF7'}15`, border: `1px solid ${m.color ?? '#4F8EF7'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {m.icon}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.id}</div>
                    </td>
                    <td>
                      <span className={`badge ${m.category === 'seven-tools' ? 'badge-amber' : 'badge-blue'}`}>
                        {m.category === 'seven-tools' ? 'Seven Tools' : '8 Steps'}
                      </span>
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.readTime} mnt</span></td>
                    <td>
                      {m.fileUrl ? (
                        <a href={m.fileUrl} target="_blank" rel="noreferrer">
                          <span className="badge badge-green" style={{ fontSize: 10, cursor: 'pointer' }}>
                            {(m.fileType ?? 'FILE').toUpperCase()} ↗
                          </span>
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleEdit(m)}><Edit2 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--red)' }} onClick={() => handleDelete(m.id, m.title)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/admin/materi`. Confirm:
1. 15 materi load from database (not mockData)
2. Tambah Materi form: fill ID + title + category, upload a PDF, click Simpan — row appears with PDF badge
3. Click PDF badge — PDF opens in new tab
4. Edit button: form pre-fills, save updates the row
5. Delete button: confirm dialog → row disappears

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/materi/page.tsx
git commit -m "feat: connect admin materi UI to real API with file upload"
```

---

### Task 9: Update Admin Soal UI

**Files:**
- Modify: `src/app/admin/soal/page.tsx`

**Interfaces:**
- Consumes: `GET /api/admin/questions` (Task 5), `GET /api/admin/materials` (Task 4), `POST /api/admin/questions` (Task 5), `PUT /api/admin/questions/[id]` (Task 5), `DELETE /api/admin/questions/[id]` (Task 5), `POST /api/admin/questions/import` (Task 6)

- [ ] **Step 1: Replace admin soal page**

Replace entire contents of `src/app/admin/soal/page.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Upload, Download } from 'lucide-react';
import AppShell from '@/components/AppShell';

const KEYS = ['A', 'B', 'C', 'D'];

interface Question {
  id: number; materialId: string | null;
  question: string; options: string[];
  correctIndex: number; explanation: string | null;
}
interface Material { id: string; title: string; }

const emptyForm = { materialId: '', question: '', options: ['', '', '', ''] as string[], correctIndex: 0, explanation: '' };

export default function AdminSoalPage() {
  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [materials,  setMaterials]  = useState<Material[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [matFilter,  setMatFilter]  = useState('all');
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState<number | null>(null);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [csvFile,    setCsvFile]    = useState<File | null>(null);
  const [importing,  setImporting]  = useState(false);
  const [importMsg,  setImportMsg]  = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/questions').then(r => r.json()),
      fetch('/api/admin/materials').then(r => r.json()),
    ]).then(([q, m]) => {
      if (Array.isArray(q)) setQuestions(q);
      if (Array.isArray(m)) setMaterials(m);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const materialMap = Object.fromEntries(materials.map(m => [m.id, m.title]));
  const filtered    = questions.filter(q =>
    (matFilter === 'all' || q.materialId === matFilter) &&
    (search === '' || q.question.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.question) { alert('Pertanyaan wajib diisi'); return; }
    if (form.options.some(o => !o.trim())) { alert('Semua pilihan jawaban harus diisi'); return; }
    setSaving(true);
    const body   = { ...form, materialId: form.materialId || null, explanation: form.explanation || null };
    const url    = editId ? `/api/admin/questions/${editId}` : '/api/admin/questions';
    const method = editId ? 'PUT' : 'POST';
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { alert(data.error ?? 'Gagal menyimpan'); return; }
    resetForm(); load();
  };

  const handleEdit = (q: Question) => {
    setForm({ materialId: q.materialId ?? '', question: q.question, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation ?? '' });
    setEditId(q.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus soal #${id}?`)) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Gagal menghapus soal'); return; }
    load();
  };

  const handleImport = async () => {
    if (!csvFile) { alert('Pilih file CSV terlebih dahulu'); return; }
    setImporting(true); setImportMsg(null);
    const fd = new FormData(); fd.append('file', csvFile);
    const res  = await fetch('/api/admin/questions/import', { method: 'POST', body: fd });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) { setImportMsg({ type: 'error', text: data.error ?? 'Gagal import' }); return; }
    setImportMsg({ type: 'success', text: `Berhasil import ${data.inserted} soal.${data.errors?.length ? ` ${data.errors.length} baris dilewati.` : ''}` });
    setCsvFile(null); load();
  };

  const setOption = (i: number, val: string) =>
    setForm(f => { const opts = [...f.options]; opts[i] = val; return { ...f, options: opts }; });

  return (
    <AppShell title="Bank Soal" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">BANK SOAL</div>
        <div className="page-subtitle">Kelola pertanyaan kuis — {questions.length} soal tersedia</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari soal..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ maxWidth: 200 }} value={matFilter} onChange={e => setMatFilter(e.target.value)}>
          <option value="all">Semua Materi</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <a href="/template-soal.csv" download className="btn btn-secondary btn-sm">
          <Download size={14} /> Template CSV
        </a>
        <button className="btn btn-secondary btn-sm" onClick={() => { setShowImport(s => !s); setImportMsg(null); }}>
          <Upload size={14} /> Import CSV
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={14} /> Tambah Soal
        </button>
      </div>

      {showImport && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-title" style={{ backgroundColor: '#6366f1', color: '#fff' }}>Import Soal via CSV</div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowImport(false); setImportMsg(null); setCsvFile(null); }}>✕</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Format: material_id, question, option_a, option_b, option_c, option_d, correct_index (0-3), explanation. Maks. 500 baris.
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              {csvFile ? csvFile.name : 'Pilih file CSV'}
              <input type="file" accept=".csv" style={{ display: 'none' }}
                onChange={e => { setCsvFile(e.target.files?.[0] ?? null); setImportMsg(null); }} />
            </label>
            {csvFile && (
              <button className="btn btn-primary btn-sm" onClick={handleImport} disabled={importing}>
                {importing ? 'Mengimport...' : `Import ${csvFile.name}`}
              </button>
            )}
          </div>
          {importMsg && (
            <div className={`alert ${importMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 12 }}>
              {importMsg.text}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(5,150,105,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ backgroundColor: '#8b5cf6', color: '#fff' }}>
              {editId ? `Edit Soal #${editId}` : 'Tambah Soal Baru'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Materi Terkait</label>
              <select className="input" value={form.materialId}
                onChange={e => setForm(f => ({ ...f, materialId: e.target.value }))}>
                <option value="">— Pilih materi (opsional) —</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Pertanyaan</label>
              <textarea className="input" rows={3} placeholder="Tulis pertanyaan..."
                value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
            </div>
            {KEYS.map((k, i) => (
              <div key={k}>
                <label className="form-label">Pilihan {k}</label>
                <input className="input" placeholder={`Jawaban pilihan ${k}...`}
                  value={form.options[i]} onChange={e => setOption(i, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="form-label">Jawaban Benar</label>
              <select className="input" value={form.correctIndex}
                onChange={e => setForm(f => ({ ...f, correctIndex: parseInt(e.target.value) }))}>
                {KEYS.map((k, i) => <option key={k} value={i}>Pilihan {k}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Penjelasan</label>
              <textarea className="input" rows={2} placeholder="Penjelasan jawaban benar..."
                value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Menyimpan...' : (editId ? 'Update Soal' : 'Simpan Soal')}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(questions.length), label: 'Total Soal', color: 'var(--blue)' },
          { value: String(questions.filter(q => q.materialId && !q.materialId.startsWith('langkah')).length), label: 'Seven Tools', color: 'var(--amber)' },
          { value: String(questions.filter(q => q.materialId?.startsWith('langkah')).length), label: '8 Steps', color: 'var(--indigo)' },
          { value: String(filtered.length), label: 'Ditampilkan', color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Memuat data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada soal</div>
          )}
          {filtered.map(q => (
            <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setExpanded(e => e === q.id ? null : q.id)}>
                <span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, color: 'var(--amber)', minWidth: 36, lineHeight: 1.2 }}>#{q.id}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>{q.question}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Materi: {q.materialId ? (materialMap[q.materialId] ?? q.materialId) : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>Jawaban: {KEYS[q.correctIndex]}</span>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }}
                    onClick={e => { e.stopPropagation(); handleEdit(q); }}><Edit2 size={12} /></button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', color: 'var(--red)' }}
                    onClick={e => { e.stopPropagation(); handleDelete(q.id); }}><Trash2 size={12} /></button>
                  {expanded === q.id ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
                </div>
              </div>
              {expanded === q.id && (
                <div style={{ borderTop: '1px solid var(--border-dim)', padding: '14px 16px', background: 'var(--bg-elevated)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                    {q.options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ width: 22, height: 22, borderRadius: 6, background: i === q.correctIndex ? 'var(--green-dim)' : 'var(--bg-card)', border: `1px solid ${i === q.correctIndex ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === q.correctIndex ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0 }}>
                          {KEYS[i]}
                        </span>
                        <span style={{ fontSize: 13, color: i === q.correctIndex ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{opt}</span>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--green)' }}>Penjelasan:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
```

- [ ] **Step 2: Verify in browser**

Navigate to `/admin/soal`. Confirm:
1. 25 soal load from database
2. Tambah Soal form saves a new question, appears in list
3. Import CSV: click "Import CSV", click "Template CSV" to download, upload template, click Import — success message + count increases by 2
4. Edit soal: form pre-fills, save updates
5. Delete soal: confirm dialog, row disappears

- [ ] **Step 3: Commit**

```bash
git add src/app/admin/soal/page.tsx
git commit -m "feat: connect admin soal UI to API with CSV import"
```

---

### Task 10: Update User-Facing Pages

**Files:**
- Modify: `src/app/materi/page.tsx`
- Modify: `src/app/materi/[id]/page.tsx`
- Modify: `src/app/quezee/[id]/page.tsx`

**Interfaces:**
- Consumes: `GET /api/materials` (Task 3), `GET /api/materials/[id]` (Task 3), `GET /api/quiz/questions` (Task 7)

- [ ] **Step 1: Update materi list page**

Replace entire contents of `src/app/materi/page.tsx`:

```tsx
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Material {
  id: string; title: string; category: string;
  icon: string | null; description: string | null;
  readTime: number | null; fileUrl: string | null;
}

const NEO_SEVEN = [
  { bg: '#ef4444', fg: '#fff', pat: 'pat-dots-w' },
  { bg: '#2563eb', fg: '#fff', pat: 'pat-stripes-w' },
  { bg: '#ffd23f', fg: '#000', pat: 'pat-dots' },
  { bg: '#22c55e', fg: '#000', pat: 'pat-lines' },
  { bg: '#ec4899', fg: '#fff', pat: 'pat-zigzag-w' },
  { bg: '#06b6d4', fg: '#000', pat: 'pat-checker' },
  { bg: '#a855f7', fg: '#fff', pat: 'pat-grid-w' },
];

const NEO_EIGHT = [
  { bg: '#f97316', fg: '#000', pat: 'pat-stripes' },
  { bg: '#84cc16', fg: '#000', pat: 'pat-dots' },
  { bg: '#6b7280', fg: '#fff', pat: 'pat-stripes-w' },
  { bg: '#14b8a6', fg: '#000', pat: 'pat-grid' },
  { bg: '#f43f5e', fg: '#fff', pat: 'pat-checker-w' },
  { bg: '#8b5cf6', fg: '#fff', pat: 'pat-zigzag-w' },
  { bg: '#0ea5e9', fg: '#fff', pat: 'pat-dots-w' },
  { bg: '#fbbf24', fg: '#000', pat: 'pat-lines' },
];

export default function MateriPage() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(d => { if (Array.isArray(d)) setMaterials(d); }).catch(() => {});
  }, []);

  const sevenTools = materials.filter(m => m.category === 'seven-tools');
  const eightSteps = materials.filter(m => m.category === '8-steps');

  return (
    <AppShell title="Materi">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">MATERI PEMBELAJARAN</div>
        <div className="page-subtitle">Seven Tools & 8 Steps — Metodologi QCC Pabrik</div>
      </div>

      <section style={{ marginBottom: 32 }}>
        <div className="neo-card pat-dots" style={{ backgroundColor: '#ffd23f', padding: '16px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 34 }}>🔧</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '0.06em', color: '#000', lineHeight: 1 }}>SEVEN TOOLS</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.60)', marginTop: 2 }}>7 Alat Pengendalian Kualitas Dasar</div>
          </div>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 40, color: '#000', lineHeight: 1 }}>{sevenTools.length}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {sevenTools.map((m, i) => {
            const c = NEO_SEVEN[i % NEO_SEVEN.length];
            const dim = c.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)';
            return (
              <Link key={m.id} href={`/materi/${m.id}`}
                className={`neo-card ${c.pat} animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, backgroundColor: c.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, background: c.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)', border: `2px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.30)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.fg }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={11} style={{ color: dim }} />
                      <span style={{ fontSize: 11, color: dim }}>{m.readTime} mnt baca</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: dim, flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 13, color: dim, lineHeight: 1.5, margin: 0 }}>{m.description}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', background: c.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)', color: c.fg, width: 'fit-content' }}>Seven Tools</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="neo-card pat-stripes-w" style={{ backgroundColor: '#2563eb', padding: '16px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 34 }}>📋</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '0.06em', color: '#fff', lineHeight: 1 }}>8 LANGKAH (8 STEPS)</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>Metode Penyelesaian Masalah Sistematis</div>
          </div>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 40, color: '#fff', lineHeight: 1 }}>{eightSteps.length}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {eightSteps.map((m, i) => {
            const c = NEO_EIGHT[i % NEO_EIGHT.length];
            const dim = c.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)';
            return (
              <Link key={m.id} href={`/materi/${m.id}`}
                className={`neo-card ${c.pat} animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, backgroundColor: c.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: c.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)', border: `2px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.30)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, color: c.fg }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={11} style={{ color: dim }} />
                      <span style={{ fontSize: 11, color: dim }}>{m.readTime} mnt baca</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: dim, flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 13, color: dim, lineHeight: 1.5, margin: 0 }}>{m.description}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', background: c.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)', color: c.fg, width: 'fit-content' }}>8 Steps</div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="neo-card-lg pat-zigzag-w" style={{ marginTop: 32, padding: '24px 28px', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <BookOpen size={28} style={{ color: '#fff', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 22, letterSpacing: '0.04em', color: '#fff', lineHeight: 1 }}>SUDAH MEMBACA SEMUA MATERI?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Uji pemahaman Anda dengan Quezee untuk mendapatkan poin!</div>
        </div>
        <Link href="/quezee" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: '#000', border: '2px solid #000', color: '#ffd23f', fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: '0.04em', boxShadow: '3px 3px 0 0 rgba(255,255,255,0.35)' }}>
          Mulai Quezee →
        </Link>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 2: Update materi detail page**

Replace entire contents of `src/app/materi/[id]/page.tsx`:

```tsx
'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Brain, ChevronRight } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Material {
  id: string; title: string; category: string;
  icon: string | null; description: string | null;
  readTime: number | null; color: string | null;
  fileUrl: string | null; fileType: string | null;
}

export default function MateriDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }     = use(params);
  const router     = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [allMats,  setAllMats]  = useState<Material[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(d => { if (Array.isArray(d)) setAllMats(d); }).catch(() => {});
    fetch(`/api/materials/${id}`).then(r => {
      if (r.status === 404) { setNotFound(true); return null; }
      return r.json();
    }).then(d => { if (d) setMaterial(d); }).catch(() => {});
  }, [id]);

  if (notFound) return (
    <AppShell title="Materi">
      <div className="empty-state">
        <div style={{ fontSize: 40 }}>📚</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Materi tidak ditemukan</div>
        <Link href="/materi" className="btn btn-primary btn-sm">Kembali</Link>
      </div>
    </AppShell>
  );

  if (!material) return (
    <AppShell title="Materi">
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Memuat materi...</div>
    </AppShell>
  );

  const matIndex = allMats.findIndex(m => m.id === id);
  const prev     = matIndex > 0 ? allMats[matIndex - 1] : null;
  const next     = matIndex < allMats.length - 1 ? allMats[matIndex + 1] : null;
  const accent   = material.color ?? '#4F8EF7';

  return (
    <AppShell title={material.title}>
      <div style={{ maxWidth: 760 }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Kembali
        </button>

        <div style={{ background: `linear-gradient(135deg, var(--bg-card) 0%, ${accent}10 100%)`, border: `1px solid ${accent}30`, borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `${accent}18`, border: `1px solid ${accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              {material.icon}
            </div>
            <div>
              <div className={`badge badge-${material.category === 'seven-tools' ? 'amber' : 'blue'}`} style={{ marginBottom: 8 }}>
                {material.category === 'seven-tools' ? 'Seven Tools' : '8 Steps'}
              </div>
              <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 28, letterSpacing: '0.04em', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{material.title.toUpperCase()}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '8px 0 0' }}>{material.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}><Clock size={13} /> {material.readTime} menit baca</div>
                {matIndex >= 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}><BookOpen size={13} /> Materi #{matIndex + 1}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: material.fileUrl ? 0 : '28px 32px', marginBottom: 24, overflow: 'hidden' }}>
          {material.fileUrl ? (
            <iframe
              src={material.fileUrl}
              style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
              title={material.title}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14 }}>Konten materi belum diupload oleh admin.</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {prev && (
            <Link href={`/materi/${prev.id}`} className="card card-hover" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ArrowLeft size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Sebelumnya</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{prev.title}</div>
              </div>
            </Link>
          )}
          {next && (
            <Link href={`/materi/${next.id}`} className="card card-hover" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Berikutnya</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{next.title}</div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          )}
        </div>

        <div style={{ padding: '20px 24px', background: 'var(--amber-glow)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Brain size={22} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Siap diuji?</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kerjakan Quezee dan kumpulkan poin dari materi ini.</div>
          </div>
          <Link href="/quezee" className="btn btn-primary btn-sm">Mulai Quezee →</Link>
        </div>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Update quezee quiz page**

Replace entire contents of `src/app/quezee/[id]/page.tsx`:

```tsx
'use client';
import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, Clock } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface QuizQuestion {
  id: number; materialId: string | null;
  question: string; options: string[];
  correctIndex: number; explanation: string | null;
}

const KEYS  = ['A', 'B', 'C', 'D'];
const TIMER = 45;

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [answered,  setAnswered]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [results,   setResults]   = useState<boolean[]>([]);
  const [done,      setDone]      = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(TIMER);

  useEffect(() => {
    fetch(`/api/quiz/questions?topic=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoadError(d.error); setLoading(false); return; }
        if (Array.isArray(d)) { setQuestions(d); setLoading(false); }
      })
      .catch(() => { setLoadError('Gagal memuat soal. Periksa koneksi dan coba lagi.'); setLoading(false); });
  }, [id]);

  const handleNext = useCallback(() => {
    if (!answered || questions.length === 0) return;
    const correct = selected === questions[current].correctIndex;
    setScore(s => s + (correct ? 5 : 0));
    setResults(r => [...r, correct]);
    if (current + 1 >= questions.length) { setDone(true); }
    else { setCurrent(c => c + 1); setSelected(null); setAnswered(false); setTimeLeft(TIMER); }
  }, [answered, selected, questions, current]);

  useEffect(() => {
    if (done || answered || loading || questions.length === 0) return;
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); setAnswered(true); setSelected(null); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [current, done, answered, loading, questions.length]);

  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(handleNext, 2000);
    return () => clearTimeout(t);
  }, [answered, handleNext]);

  const topicLabel = id === 'all' ? 'Semua Materi' : id === 'seven-tools' ? 'Seven Tools' : '8 Langkah';

  useEffect(() => {
    if (!done) return;
    const correct = results.filter(Boolean).length;
    fetch('/api/quiz/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicLabel, correctAnswers: correct, wrongAnswers: results.length - correct }),
    }).catch(() => {});
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <AppShell title="Quezee">
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div>Memuat soal...</div>
      </div>
    </AppShell>
  );

  if (loadError) return (
    <AppShell title="Quezee">
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>{loadError}</div>
        <button className="btn btn-secondary" onClick={() => router.push('/quezee')}><RotateCcw size={14} /> Kembali</button>
      </div>
    </AppShell>
  );

  if (done) {
    const correctCount = results.filter(Boolean).length;
    const pct   = Math.round((correctCount / questions.length) * 100);
    const grade = pct >= 80 ? { label: 'LUAR BIASA!', color: 'var(--green)' }
      : pct >= 60 ? { label: 'BAGUS!', color: 'var(--amber)' }
      : { label: 'TERUS BELAJAR', color: 'var(--blue)' };
    return (
      <AppShell title="Hasil Quezee">
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: `4px solid ${grade.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 0 32px ${grade.color}30` }}>
              <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 36, color: grade.color, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SKOR</div>
            </div>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 32, letterSpacing: '0.06em', color: grade.color }}>{grade.label}</div>
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
              {[
                { value: String(correctCount), label: 'Benar', color: 'var(--green)' },
                { value: String(questions.length - correctCount), label: 'Salah', color: 'var(--red)' },
                { value: String(score), label: 'Poin', color: 'var(--amber)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: 16, borderRight: i < 2 ? '1px solid var(--border-dim)' : '' }}>
                  <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 32, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginBottom: 24, textAlign: 'left' }}>
            <div className="section-title" style={{ marginBottom: 12, backgroundColor: '#2563eb', color: '#fff' }}>Review Jawaban</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {results.map((r, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: r ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${r ? 'var(--green)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: r ? 'var(--green)' : 'var(--red)' }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/quezee')}><RotateCcw size={15} /> Ulangi</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push('/performance')}><Trophy size={15} /> Lihat Performa</button>
          </div>
        </div>
      </AppShell>
    );
  }

  const q = questions[current];
  const correctCount = results.filter(Boolean).length;

  return (
    <AppShell title={`Quezee — ${current + 1}/${questions.length}`}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}><div className="progress"><div className="progress-bar" style={{ width: `${(current / questions.length) * 100}%` }} /></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: timeLeft <= 10 ? 'var(--red)' : 'var(--text-muted)', minWidth: 56 }}><Clock size={13} /> {timeLeft}s</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}><span style={{ color: 'var(--amber)', fontWeight: 700 }}>{score}</span> pts</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Soal {current + 1} dari {questions.length}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{correctCount} ✓</span>
            <span style={{ fontSize: 12, color: 'var(--red)' }}>{results.length - correctCount} ✗</span>
          </div>
        </div>

        <div className="card card-amber" style={{ marginBottom: 20, padding: '24px 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 12 }}>PERTANYAAN #{current + 1}</div>
          <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{q.question}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (answered) {
              if (i === q.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' incorrect';
            } else if (i === selected) cls += ' selected';
            return (
              <div key={i} className={cls} onClick={() => { if (!answered) { setSelected(i); setAnswered(true); } }}>
                <div className="quiz-option-key">{KEYS[i]}</div>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>{opt}</span>
                {answered && i === q.correctIndex && <CheckCircle2 size={18} style={{ color: 'var(--green)', marginLeft: 'auto', flexShrink: 0 }} />}
                {answered && i === selected && i !== q.correctIndex && <XCircle size={18} style={{ color: 'var(--red)', marginLeft: 'auto', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>

        {answered && (
          <div className={`alert ${selected === q.correctIndex ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16, animation: 'fadeUp 0.3s ease forwards' }}>
            {selected === q.correctIndex ? <CheckCircle2 size={14} style={{ flexShrink: 0 }} /> : <XCircle size={14} style={{ flexShrink: 0 }} />}
            <div><strong>{selected === q.correctIndex ? '+5 poin! ' : 'Jawaban salah. '}</strong>{q.explanation}</div>
          </div>
        )}

        <button className="btn btn-primary btn-block btn-lg" onClick={handleNext} disabled={!answered}>
          {current + 1 === questions.length ? 'Lihat Hasil' : 'Soal Berikutnya'} <ChevronRight size={16} />
        </button>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 4: Verify all user pages**

1. `/materi` — 15 materi cards load from DB
2. `/materi/check-sheet` — placeholder message ("belum diupload") shown since seeded data has no fileUrl
3. `/quezee` → click "Semua Topik" → `/quezee/all` — 25 soal load, timer works, options and order are randomized per run
4. Complete quiz → result screen appears, points saved correctly

- [ ] **Step 5: Commit**

```bash
git add src/app/materi/ src/app/quezee/[id]/page.tsx
git commit -m "feat: update user pages to fetch materials and questions from DB"
```

---

## Self-Review

**Spec coverage:**

| Requirement | Task |
|-------------|------|
| Admin upload PDF/Word untuk materi | Task 4 (POST + PUT with file write) |
| Admin import soal via CSV (massal) | Task 6 (import route) |
| Template CSV tersedia untuk download | Task 6 (public/template-soal.csv) |
| Pool 100 soal, tampil 25 per sesi | Task 7 (slice 25 dari shuffled pool) |
| Soal diacak per user | Task 7 (fisherYates on pool) |
| Pilihan jawaban diacak per user | Task 7 (shuffleOptions per question) |
| Seed data dari mockData | Task 2 |
| PDF viewer via iframe | Task 10 (materi/[id] page) |
| File max 10 MB | Task 4 (enforced in API) |
| CSV max 500 baris | Task 6 (enforced in API) |
| Min 25 soal untuk kuis | Task 7 (422 if pool < 25) |
| Admin CRUD materi | Task 4 |
| Admin CRUD soal | Task 5 |
| File lama dihapus saat update | Task 4 (unlink before new writeFile) |
| File dihapus saat materi dihapus | Task 4 (unlink in DELETE) |

**Type consistency:**

- `MaterialRow`: defined in Task 3 routes, reused identically in Task 4, 8, 10 interfaces
- `QuestionRow`: defined in Task 5 routes, reused identically in Task 6, 9 interfaces
- `ShuffledQuestion` (Task 7 output) = `QuizQuestion` interface in Task 10 quiz page — same fields
- `fisherYates<T>()` defined only in Task 7 (not duplicated)
- Auth guard string is identical in every admin route task
