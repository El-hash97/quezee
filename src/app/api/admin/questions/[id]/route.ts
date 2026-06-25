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
