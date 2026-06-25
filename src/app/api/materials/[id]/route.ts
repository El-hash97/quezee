import { eq } from 'drizzle-orm';
import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { materials } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const { id } = await params;
  const [row]  = await db.select().from(materials).where(eq(materials.id, id));
  if (!row) return Response.json({ error: 'Materi tidak ditemukan.' }, { status: 404 });
  return Response.json(row);
}
