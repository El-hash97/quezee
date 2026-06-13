import { eq, sum, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const rows = await db
    .select({
      noreg:       users.noreg,
      name:        users.name,
      line:        users.line,
      division:    users.division,
      role:        users.role,
      totalPoints: sum(quizAttempts.pointsEarned),
      attempts:    count(quizAttempts.id),
    })
    .from(users)
    .leftJoin(quizAttempts, eq(users.noreg, quizAttempts.noreg))
    .groupBy(users.noreg, users.name, users.line, users.division, users.role);

  return Response.json(rows.map(r => ({
    noreg:       r.noreg,
    name:        r.name,
    line:        r.line     ?? '',
    division:    r.division ?? '',
    role:        r.role,
    totalPoints: Number(r.totalPoints ?? 0),
    attempts:    Number(r.attempts    ?? 0),
  })));
}
