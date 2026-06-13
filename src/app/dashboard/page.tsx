'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Brain, TrendingUp, Trophy, Star, ChevronRight, Zap, ArrowUpRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { MATERIALS, getLevel } from '@/lib/mockData';

interface Attempt {
  id: number; attemptNumber: number; topic: string | null;
  correctAnswers: number; wrongAnswers: number; pointsEarned: number;
  createdAt: string | null;
}

interface UserData {
  noreg: string; name: string; role: string;
  line: string; division: string;
  totalPoints: number; attempts: number;
}

export default function DashboardPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [leaderboard, setLeaderboard] = useState<Array<{ noreg: string; rank: number }>>([]);

  useEffect(() => {
    fetch('/api/auth/me', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (d.noreg) setUserData(d); })
      .catch(() => {});
    fetch('/api/quiz/attempts', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setAttempts(d); })
      .catch(() => {});
    fetch('/api/leaderboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setLeaderboard(d); })
      .catch(() => {});
  }, []);

  const user = userData ?? {
    noreg: '…', name: '…', role: 'PARTICIPANT',
    line: '…', division: '…', totalPoints: 0, attempts: 0,
  };

  const rank = userData ? (leaderboard.find(u => u.noreg === userData.noreg)?.rank ?? null) : null;

  const sortedAttempts = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const lvl = getLevel(user.totalPoints);
  const progress = ((user.totalPoints - lvl.min) / (lvl.max - lvl.min)) * 100;
  const lastAttempt = sortedAttempts[sortedAttempts.length - 1] ?? null;
  const recent = [...sortedAttempts].reverse().slice(0, 3);

  const quickLinks = [
    { label: 'Baca Materi',  desc: 'Seven Tools & 8 Steps',   href: '/materi',      icon: <BookOpen size={20} />,   bg: '#2563eb', fg: '#fff', pat: 'pat-dots-w' },
    { label: 'Mulai Kuis',   desc: 'Quezee — uji pemahaman',  href: '/quezee',      icon: <Brain size={20} />,      bg: '#ffd23f', fg: '#000', pat: 'pat-stripes' },
    { label: 'Performa',     desc: 'Grafik progres kuis',      href: '/performance', icon: <TrendingUp size={20} />, bg: '#a855f7', fg: '#fff', pat: 'pat-grid-w' },
    { label: 'Leaderboard',  desc: 'Peringkat global & line',  href: '/leaderboard', icon: <Trophy size={20} />,     bg: '#22c55e', fg: '#000', pat: 'pat-lines' },
  ];

  return (
    <AppShell title="Dashboard">
      {/* Welcome banner — neobrutalism */}
      <div className="neo-card-lg pat-dots-w" style={{
        backgroundColor: '#ef4444',
        padding: '28px 32px', marginBottom: 24,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{ position: 'absolute', width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(0,0,0,0.10)', top: -80, right: -40, pointerEvents: 'none' }} />

        <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#ffd23f', marginBottom: 6 }}>
              Selamat Datang Kembali
            </div>
            <div style={{
              fontFamily: 'var(--font-bebas), sans-serif', fontSize: 34, fontWeight: 800,
              letterSpacing: '-0.02em', color: '#fff', lineHeight: 1,
            }}>
              {user.name}
            </div>
            <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 6 }}>
              {user.line} &middot; {user.division} &middot;
              <span style={{ color: '#ffd23f', marginLeft: 4 }}>{user.noreg}</span>
            </div>
          </div>
          <div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 5,
              padding: '5px 14px',
              background: 'rgba(0,0,0,0.18)', border: '2px solid rgba(0,0,0,0.30)',
              fontSize: 12, fontWeight: 700, color: '#fff', letterSpacing: '0.04em',
            }}>
              <Star size={11} /> Level {lvl.level} — {lvl.label}
            </span>
          </div>
        </div>

        <div style={{ position: 'relative', marginTop: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)' }}>Progress ke Level {lvl.level + 1}</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: '#ffd23f' }}>{user.totalPoints} / {lvl.max} pts</span>
          </div>
          <div style={{ height: 7, background: 'rgba(0,0,0,0.15)', overflow: 'hidden', border: '1px solid rgba(0,0,0,0.25)' }}>
            <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: '#ffd23f', transition: 'width 0.4s ease' }} />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { value: user.totalPoints.toLocaleString(), label: 'Total Poin',      sub: lastAttempt ? `+${lastAttempt.pointsEarned} kuis terakhir` : 'Belum ada kuis', bg: '#ffd23f', fg: '#000', pat: 'pat-dots' },
          { value: rank ? `#${rank}` : '#—',            label: 'Peringkat Global', sub: 'lihat leaderboard',                                                            bg: '#2563eb', fg: '#fff', pat: 'pat-stripes-w' },
          { value: String(user.attempts),             label: 'Total Percobaan', sub: 'kuis diselesaikan',                                                             bg: '#a855f7', fg: '#fff', pat: 'pat-grid-w' },
          { value: lastAttempt ? `${lastAttempt.correctAnswers}/25` : '—', label: 'Skor Terakhir', sub: lastAttempt ? `${lastAttempt.pointsEarned} pts` : '—',       bg: '#22c55e', fg: '#000', pat: 'pat-zigzag' },
        ].map((s, i) => (
          <div key={i} className={`neo-card ${s.pat} animate-fade-up stagger-${i + 1}`} style={{
            backgroundColor: s.bg, padding: '20px 22px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 40, lineHeight: 1, fontWeight: 800, color: s.fg, letterSpacing: '-0.03em' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: s.fg === '#000' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.65)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Quick access */}
      <div style={{ marginBottom: 24 }}>
        <div className="section-title" style={{ marginBottom: 14, backgroundColor: '#f97316', color: '#000' }}>Akses Cepat</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
          {quickLinks.map((q, i) => (
            <Link key={q.href} href={q.href}
              className={`neo-card ${q.pat} animate-fade-up stagger-${i + 1}`}
              style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 14, backgroundColor: q.bg, padding: 18 }}>
              <div style={{
                width: 44, height: 44, flexShrink: 0,
                background: q.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)',
                border: `2px solid ${q.fg === '#000' ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.30)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: q.fg,
              }}>
                {q.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: q.fg }}>{q.label}</div>
                <div style={{ fontSize: 12, marginTop: 2, color: q.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)' }}>{q.desc}</div>
              </div>
              <ArrowUpRight size={14} style={{ color: q.fg, flexShrink: 0, opacity: 0.7 }} />
            </Link>
          ))}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        <div className="neo-card pat-checker" style={{ backgroundColor: '#14b8a6', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#000' }}>KUIS TERAKHIR</div>
            <Link href="/performance" style={{ fontSize: 12, color: '#000', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, opacity: 0.65 }}>
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {recent.length === 0 && (
              <div style={{ textAlign: 'center', color: 'rgba(0,0,0,0.55)', padding: '20px 0', fontSize: 13 }}>Belum ada percobaan kuis</div>
            )}
            {recent.map(a => (
              <div key={a.id} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: 'rgba(0,0,0,0.10)',
                border: '1px solid rgba(0,0,0,0.18)',
              }}>
                <div style={{
                  width: 34, height: 34,
                  background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Zap size={15} style={{ color: '#000' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>Percobaan #{a.attemptNumber}</div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.60)' }}>{a.topic ?? '—'} · {a.createdAt ? new Date(a.createdAt).toLocaleDateString('id-ID') : '—'}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#000' }}>{a.pointsEarned} pts</div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.60)' }}>{a.correctAnswers}/25 benar</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="neo-card pat-stripes" style={{ backgroundColor: '#f97316', padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#000' }}>MATERI UNGGULAN</div>
            <Link href="/materi" style={{ fontSize: 12, color: '#000', textDecoration: 'none', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3, opacity: 0.65 }}>
              Lihat Semua <ChevronRight size={12} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {MATERIALS.slice(0, 4).map(m => (
              <Link key={m.id} href={`/materi/${m.id}`} style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px', background: 'rgba(0,0,0,0.10)',
                border: '1px solid rgba(0,0,0,0.18)', textDecoration: 'none',
              }}>
                <div style={{
                  width: 34, height: 34, background: 'rgba(0,0,0,0.15)', border: '1px solid rgba(0,0,0,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, flexShrink: 0,
                }}>
                  {m.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#000' }}>{m.title}</div>
                  <div style={{ fontSize: 11, color: 'rgba(0,0,0,0.60)' }}>{m.readTime} mnt baca</div>
                </div>
                <ChevronRight size={13} style={{ color: 'rgba(0,0,0,0.40)', flexShrink: 0 }} />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
