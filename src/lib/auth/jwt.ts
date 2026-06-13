import { SignJWT, jwtVerify } from 'jose';

export interface SessionPayload {
  sub: string;
  name: string;
  role: string;
  line?: string | null;
  division?: string | null;
}

const secret = () =>
  new TextEncoder().encode(
    process.env.JWT_SECRET ?? 'qcc-dev-secret-change-in-production-32c'
  );

export async function signToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret());
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as SessionPayload;
  } catch {
    return null;
  }
}
