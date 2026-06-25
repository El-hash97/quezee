import { eq, sum, count } from 'drizzle-orm';
import { NextRequest } from 'next/server';
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

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const body = await req.json();
  const noreg: string = String(body.noreg ?? '').trim();
  const name: string  = String(body.name  ?? '').trim();
  const line: string  = String(body.line  ?? '').trim();
  const division: string = String(body.division ?? '').trim();

  if (!noreg || !name)
    return Response.json({ error: 'No.Reg dan nama wajib diisi.' }, { status: 400 });
  if (noreg.length > 7)
    return Response.json({ error: 'No.Reg maksimal 7 karakter.' }, { status: 400 });

  try {
    await db.insert(users).values({ noreg, name, line: line || null, division: division || null, role: 'PARTICIPANT' });
    return Response.json({ success: true, noreg });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '';
    if (msg.includes('duplicate') || msg.includes('unique'))
      return Response.json({ error: `No.Reg ${noreg} sudah terdaftar.` }, { status: 409 });
    console.error('POST /api/admin/users', e);
    return Response.json({ error: 'Gagal menyimpan ke database.' }, { status: 500 });
  }
}
