import { eq, sum, count } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
import { db } from '@/lib/db';
import { quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const [agg] = await db
    .select({
      totalPoints: sum(quizAttempts.pointsEarned),
      attempts:    count(quizAttempts.id),
    })
    .from(quizAttempts)
    .where(eq(quizAttempts.noreg, session.sub));

  return Response.json({
    noreg:       session.sub,
    name:        session.name,
    role:        session.role,
    line:        session.line    ?? '',
    division:    session.division ?? '',
    totalPoints: Number(agg?.totalPoints ?? 0),
    attempts:    Number(agg?.attempts    ?? 0),
  });
}
