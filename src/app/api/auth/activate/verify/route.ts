import { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';

export async function POST(req: NextRequest) {
  const { noreg } = await req.json();

  if (!noreg)
    return Response.json({ error: 'No. Reg diperlukan.' }, { status: 400 });

  const user = await db.query.users.findFirst({
    where: eq(users.noreg, String(noreg)),
  });

  if (!user)
    return Response.json({ error: 'No. Reg tidak terdaftar dalam sistem.' }, { status: 404 });

  if (user.passwordHash)
    return Response.json(
      { error: 'Akun sudah diaktivasi, silakan login.', alreadyActivated: true },
      { status: 409 }
    );

  return Response.json({ name: user.name });
}
