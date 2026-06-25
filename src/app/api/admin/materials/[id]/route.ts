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
  const doRemove    = fd.get('removeFile') === 'true';

  if (!title || !category)
    return Response.json({ error: 'Judul dan kategori wajib diisi.' }, { status: 400 });

  const [existing] = await db.select().from(materials).where(eq(materials.id, id));
  if (!existing) return Response.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });

  let fileUrl  = existing.fileUrl;
  let fileType = existing.fileType;

  if (doRemove && !(file && file.size > 0)) {
    if (existing.fileUrl) {
      await unlink(join(process.cwd(), 'public', existing.fileUrl)).catch(() => {});
    }
    fileUrl  = null;
    fileType = null;
  } else if (file && file.size > 0) {
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
