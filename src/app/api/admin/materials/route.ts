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
