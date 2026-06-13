import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  const { noreg, line, division, password } = await req.json();

  if (!noreg || !line || !division || !password)
    return Response.json({ error: 'Semua field wajib diisi.' }, { status: 400 });

  if (password.length < 8)
    return Response.json({ error: 'Password minimal 8 karakter.' }, { status: 400 });

  const user = await db.query.users.findFirst({
    where: eq(users.noreg, String(noreg)),
  });

  if (!user)
    return Response.json({ error: 'No. Reg tidak terdaftar.' }, { status: 404 });

  if (user.passwordHash)
    return Response.json(
      { error: 'Akun sudah diaktivasi.', alreadyActivated: true },
      { status: 409 }
    );

  const passwordHash = await bcrypt.hash(password, 12);

  await db
    .update(users)
    .set({ passwordHash, line, division })
    .where(eq(users.noreg, String(noreg)));

  return Response.json({ success: true });
}
