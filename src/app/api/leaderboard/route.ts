import { NextRequest } from 'next/server';
import { eq, desc, sum, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const lineFilter     = searchParams.get('line');
  const divisionFilter = searchParams.get('division');

  const rows = await db
    .select({
      noreg:       users.noreg,
      name:        users.name,
      line:        users.line,
      division:    users.division,
      totalPoints: sum(quizAttempts.pointsEarned),
      attempts:    count(quizAttempts.id),
    })
    .from(users)
    .leftJoin(quizAttempts, eq(users.noreg, quizAttempts.noreg))
    .where(
      lineFilter     ? eq(users.line,     lineFilter)     :
      divisionFilter ? eq(users.division, divisionFilter) :
      undefined
    )
    .groupBy(users.noreg, users.name, users.line, users.division)
    .orderBy(desc(sum(quizAttempts.pointsEarned)));

  const ranked = rows.map((r, i) => ({
    rank:        i + 1,
    noreg:       r.noreg,
    name:        r.name,
    line:        r.line     ?? '-',
    division:    r.division ?? '-',
    totalPoints: Number(r.totalPoints ?? 0),
    attempts:    Number(r.attempts    ?? 0),
  }));

  return Response.json(ranked);
}
