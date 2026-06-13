import { sum, count, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const rows = await db
    .select({
      topic:         quizAttempts.topic,
      wrongCount:    sum(quizAttempts.wrongAnswers),
      totalAttempts: count(quizAttempts.id),
    })
    .from(quizAttempts)
    .where(sql`${quizAttempts.topic} IS NOT NULL`)
    .groupBy(quizAttempts.topic);

  const stats = rows
    .map(r => ({
      topic:         r.topic ?? '—',
      wrongCount:    Number(r.wrongCount    ?? 0),
      totalAttempts: Number(r.totalAttempts ?? 0),
      pct: Math.round(
        Number(r.wrongCount ?? 0) / (Number(r.totalAttempts ?? 1) * 25) * 100
      ),
    }))
    .sort((a, b) => b.wrongCount - a.wrongCount);

  return Response.json(stats);
}
