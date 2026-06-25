import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users, quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  ctx: RouteContext<'/api/admin/users/[noreg]'>
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { noreg } = await ctx.params;
  const body = await req.json();
  const line: string = body.line;
  const division: string = body.division;
  const name: string | undefined = body.name;

  if (!line || !division)
    return Response.json({ error: 'Line dan shift wajib diisi.' }, { status: 400 });

  const updateData: { line: string; division: string; name?: string } = { line: String(line), division: String(division) };
  if (name && name.trim()) updateData.name = name.trim();

  try {
    await db
      .update(users)
      .set(updateData)
      .where(eq(users.noreg, String(noreg)));
    return Response.json({ success: true, saved: { line, division, name: updateData.name } });
  } catch (e) {
    console.error('PATCH /api/admin/users/[noreg]', e);
    return Response.json({ error: 'Gagal update database.' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<'/api/admin/users/[noreg]'>
) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const { noreg } = await ctx.params;

  try {
    await db.delete(quizAttempts).where(eq(quizAttempts.noreg, String(noreg)));
    return Response.json({ success: true });
  } catch (e) {
    console.error('DELETE /api/admin/users/[noreg]', e);
    return Response.json({ error: 'Gagal reset poin.' }, { status: 500 });
  }
}
