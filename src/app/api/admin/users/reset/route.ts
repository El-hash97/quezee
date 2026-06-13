import { db } from '@/lib/db';
import { quizAttempts } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST() {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  try {
    await db.delete(quizAttempts);
    return Response.json({ success: true });
  } catch (e) {
    console.error('POST /api/admin/users/reset', e);
    return Response.json({ error: 'Gagal reset semua poin.' }, { status: 500 });
  }
}
