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
