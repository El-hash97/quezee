import { NextRequest } from 'next/server';
import { eq, desc, count } from 'drizzle-orm';
import { db } from '@/lib/db';
import { quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export async function GET() {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const rows = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.noreg, session.sub))
    .orderBy(desc(quizAttempts.createdAt));

  return Response.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const { topic, correctAnswers, wrongAnswers } = await req.json();

  if (correctAnswers === undefined || wrongAnswers === undefined)
    return Response.json({ error: 'correctAnswers dan wrongAnswers wajib diisi.' }, { status: 400 });

  const [countRow] = await db
    .select({ c: count(quizAttempts.id) })
    .from(quizAttempts)
    .where(eq(quizAttempts.noreg, session.sub));

  const attemptNumber = Number(countRow?.c ?? 0) + 1;
  const pointsEarned  = Number(correctAnswers) * 5;

  const [saved] = await db
    .insert(quizAttempts)
    .values({
      noreg:          session.sub,
      attemptNumber,
      topic:          topic ?? null,
      correctAnswers: Number(correctAnswers),
      wrongAnswers:   Number(wrongAnswers),
      pointsEarned,
    })
    .returning();

  return Response.json(saved, { status: 201 });
}
