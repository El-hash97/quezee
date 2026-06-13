import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { setSessionCookie } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  const { noreg, password } = await req.json();

  if (!noreg || !password)
    return Response.json({ error: 'No. Reg dan password wajib diisi.' }, { status: 400 });

  const user = await db.query.users.findFirst({
    where: eq(users.noreg, String(noreg)),
  });

  if (!user)
    return Response.json({ error: 'No. Reg tidak terdaftar dalam sistem.' }, { status: 401 });

  if (!user.passwordHash)
    return Response.json(
      { error: 'Akun belum diaktivasi. Silakan aktivasi terlebih dahulu.', notActivated: true },
      { status: 403 }
    );

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid)
    return Response.json({ error: 'Password salah.' }, { status: 401 });

  await setSessionCookie({
    sub: user.noreg,
    name: user.name,
    role: user.role,
    line: user.line,
    division: user.division,
  });

  return Response.json({ role: user.role, name: user.name });
}
