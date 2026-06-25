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
