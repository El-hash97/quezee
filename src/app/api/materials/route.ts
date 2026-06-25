import { asc } from 'drizzle-orm';
import { db } from '@/lib/db';
import { materials } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session)
    return Response.json({ error: 'Tidak terautentikasi.' }, { status: 401 });

  const rows = await db.select().from(materials).orderBy(asc(materials.createdAt));
  return Response.json(rows);
}
