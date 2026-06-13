import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { SESSION_COOKIE } from '@/lib/auth/session';

const PARTICIPANT_PATHS = ['/dashboard', '/materi', '/quezee', '/performance', '/leaderboard'];
const ADMIN_PATHS       = ['/admin'];
const AUTH_PAGES        = ['/login', '/activate'];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token   = req.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  /* Redirect already-logged-in users away from auth pages */
  if (AUTH_PAGES.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    if (session) {
      const dest = session.role === 'ADMIN' ? '/admin' : '/dashboard';
      return NextResponse.redirect(new URL(dest, req.url));
    }
    return NextResponse.next();
  }

  /* Protect participant pages */
  if (PARTICIPANT_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    if (!session)
      return NextResponse.redirect(new URL('/login', req.url));
    return NextResponse.next();
  }

  /* Protect admin pages */
  if (ADMIN_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'))) {
    if (!session)
      return NextResponse.redirect(new URL('/login', req.url));
    if (session.role !== 'ADMIN')
      return NextResponse.redirect(new URL('/dashboard', req.url));
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
