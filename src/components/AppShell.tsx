'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  LayoutDashboard, BookOpen, Brain, TrendingUp, Trophy,
  Users, FileText, BarChart2, LogOut, Menu, ChevronRight,
} from 'lucide-react';
import { getLevel } from '@/lib/mockData';
import { applyTheme, THEME_KEY } from '@/lib/theme';

gsap.registerPlugin(ScrollTrigger);

interface SessionUser {
  noreg: string; name: string; role: string;
  line?: string; division?: string; totalPoints: number; attempts: number;
}

interface NavItem { label: string; href: string; icon: React.ReactNode }

const participantNav: NavItem[] = [
  { label: 'Dashboard',   href: '/dashboard',   icon: <LayoutDashboard size={15} /> },
  { label: 'Materi',      href: '/materi',      icon: <BookOpen size={15} /> },
  { label: 'Quezee',      href: '/quezee',      icon: <Brain size={15} /> },
  { label: 'Performa',    href: '/performance', icon: <TrendingUp size={15} /> },
  { label: 'Leaderboard', href: '/leaderboard', icon: <Trophy size={15} /> },
];

const adminNav: NavItem[] = [
  { label: 'Dashboard',     href: '/admin',        icon: <BarChart2 size={15} /> },
  { label: 'Kelola Materi', href: '/admin/materi', icon: <FileText size={15} /> },
  { label: 'Bank Soal',     href: '/admin/soal',   icon: <Brain size={15} /> },
  { label: 'Pengguna',      href: '/admin/users',  icon: <Users size={15} /> },
];

export default function AppShell({ children, isAdmin = false, title }: {
  children: React.ReactNode; isAdmin?: boolean; title?: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => { if (d.noreg) setSessionUser(d); })
      .catch(() => {});
    const savedBg = localStorage.getItem(THEME_KEY);
    if (savedBg) applyTheme(savedBg);
  }, []);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let ctx: gsap.Context | undefined;

    const raf = requestAnimationFrame(() => {
      const content = document.querySelector<HTMLElement>('.app-content');
      if (!content) return;

      ctx = gsap.context(() => {
        // Page heading — slide in from left on page load
        gsap.from('.page-title', {
          x: -22, opacity: 0, duration: 0.40, ease: 'power3.out',
          clearProps: 'transform,opacity',
        });
        gsap.from('.page-subtitle', {
          y: 8, opacity: 0, delay: 0.10, duration: 0.30, ease: 'power2.out',
          clearProps: 'transform,opacity',
        });

        // Section labels — scroll-triggered, slide from left
        gsap.utils.toArray<HTMLElement>('.section-title').forEach(el => {
          gsap.from(el, {
            x: -14, opacity: 0, duration: 0.30, ease: 'power2.out',
            clearProps: 'transform,opacity',
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          });
        });

        // Cards — batched stagger reveal on scroll
        const CARD_SEL = '.neo-card, .neo-card-lg, .stat-card, .card, .tool-card';
        const cards = gsap.utils.toArray<HTMLElement>(CARD_SEL);
        if (cards.length) {
          ScrollTrigger.batch(cards, {
            onEnter: batch => gsap.from(batch, {
              y: 26, opacity: 0, duration: 0.44, ease: 'power3.out',
              stagger: 0.07, clearProps: 'transform,opacity',
            }),
            start: 'top 90%',
            once: true,
          });
        }

        ScrollTrigger.refresh();
      }, content);
    });

    return () => {
      cancelAnimationFrame(raf);
      ctx?.revert();
    };
  }, [pathname]);

  const user: SessionUser = sessionUser ?? {
    noreg: '…', name: '…', role: isAdmin ? 'ADMIN' : 'PARTICIPANT',
    totalPoints: 0, attempts: 0,
  };

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    router.push('/login');
  }

  const navItems = isAdmin ? adminNav : participantNav;
  const lvl = getLevel(user.totalPoints);
  const initials = user.name === '…' ? '…' : user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-[90] md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`app-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="nav-brand">
          <div className="nav-logo">QCC</div>
          <div>
            <div className="nav-brand-text">QCC Platform</div>
            <div className="nav-brand-sub">Seven Tools & 8 Steps</div>
          </div>
        </div>

        <nav className="nav-section">
          {isAdmin
            ? <div className="nav-label" style={{ color: 'var(--amber)' }}>Admin Panel</div>
            : <div className="nav-label">Menu Utama</div>
          }
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`nav-item${pathname.startsWith(item.href) ? ' active' : ''}`}
            >
              {item.icon}
              <span style={{ flex: 1 }}>{item.label}</span>
              {pathname.startsWith(item.href) && (
                <ChevronRight size={12} style={{ opacity: 0.5 }} />
              )}
            </Link>
          ))}

        </nav>

        <div className="nav-footer">
          <div className="nav-user">
            <div className="nav-avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {isAdmin ? 'Administrator' : `Lvl ${lvl.level} · ${lvl.label}`}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm btn-block"
            style={{ marginTop: 8, justifyContent: 'flex-start', color: 'var(--text-muted)' }}
          >
            <LogOut size={13} /> Keluar
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-topbar">
          <button
            className="btn btn-ghost btn-sm"
            style={{ padding: '6px 8px', display: 'none' }}
            id="mobile-menu-btn"
            onClick={() => setSidebarOpen(true)}
            aria-label="Buka menu"
          >
            <Menu size={18} />
          </button>
          <style>{`@media(max-width:768px){#mobile-menu-btn{display:flex}}`}</style>

          <div style={{ flex: 1 }}>
            {title && (
              <span style={{
                fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)',
                fontFamily: 'var(--font-bebas), sans-serif', letterSpacing: '-0.01em',
              }}>
                {title}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', background: 'var(--bg-elevated)', border: '2px solid var(--border)', boxShadow: 'var(--shadow-card)', flexShrink: 0 }}>
            <div className="topbar-user-text" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.noreg}</div>
            </div>
            <div className="nav-avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{initials}</div>
          </div>
        </header>

        <div className="app-content animate-fade-in">{children}</div>
      </main>

      {!isAdmin && (
        <nav className="mobile-nav">
          {participantNav.map(item => {
            const active = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3,
                padding: '4px 12px', textDecoration: 'none',
                fontSize: 9.5, fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase',
                color: active ? 'var(--amber)' : 'var(--text-muted)',
                transition: 'color 0.12s',
              }}>
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
      )}
    </div>
  );
}
