'use client';
import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Star, TrendingUp, Award } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { getLevel } from '@/lib/mockData';

interface Attempt {
  id: number; attemptNumber: number; topic: string | null;
  correctAnswers: number; wrongAnswers: number; pointsEarned: number;
  createdAt: string | null;
}
interface UserData { noreg: string; name: string; totalPoints: number; attempts: number; }

const BADGES = ['', '🌱', '⭐', '🔥', '💎', '🏆', '👑'];

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function PerformancePage() {
  const [view, setView] = useState<'line' | 'bar'>('line');
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    fetch('/api/quiz/attempts').then(r => r.json()).then(d => { if (Array.isArray(d)) setAttempts(d); }).catch(() => {});
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.noreg) setUserData(d); }).catch(() => {});
  }, []);

  const user = userData ?? { noreg: '…', name: '…', totalPoints: 0, attempts: 0 };
  const lvl = getLevel(user.totalPoints);
  const progress = ((user.totalPoints - lvl.min) / (lvl.max - lvl.min)) * 100;

  const sorted = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const chartData = sorted.map(a => ({
    name: `#${a.attemptNumber}`, Benar: a.correctAnswers, Salah: a.wrongAnswers, Poin: a.pointsEarned,
  }));

  const bestAttempt = sorted.length ? sorted.reduce((b, a) => a.pointsEarned > b.pointsEarned ? a : b) : null;
  const avgCorrect = sorted.length ? Math.round(sorted.reduce((s, a) => s + a.correctAnswers, 0) / sorted.length) : 0;
  const trend = sorted.length >= 3 && sorted.slice(-3).every((a, i, arr) => i === 0 || a.correctAnswers >= arr[i - 1].correctAnswers);

  const Tip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) =>
    active && payload?.length ? (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
        {payload.map((p, i) => <div key={i} style={{ color: p.color, display: 'flex', gap: 8 }}><span>{p.name}:</span><strong>{p.value}</strong></div>)}
      </div>
    ) : null;

  return (
    <AppShell title="Performa">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">PERFORMA KUIS</div>
        <div className="page-subtitle">Statistik & grafik progres pembelajaran pribadi</div>
      </div>

      {/* Level card */}
      <div className="neo-card-lg pat-grid-w" style={{ backgroundColor: '#a855f7', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.20)', border: '2px solid rgba(255,255,255,0.40)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, flexShrink: 0 }}>
            {BADGES[lvl.level]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', color: '#fff' }}>Level {lvl.level} — {lvl.label}</div>
            <div style={{ marginTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)' }}>Progress ke Level {lvl.level + 1}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#ffd23f' }}>{user.totalPoints} / {lvl.max} pts</span>
              </div>
              <div style={{ height: 10, background: 'rgba(255,255,255,0.20)', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.30)' }}>
                <div style={{ height: '100%', width: `${Math.min(progress, 100)}%`, background: '#ffd23f', transition: 'width 0.4s ease' }} />
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.70)', marginTop: 4 }}>{lvl.max - user.totalPoints} poin lagi</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', color: '#ffd23f', lineHeight: 1 }}>{user.totalPoints}</div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.70)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>Total Poin</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { value: String(sorted.length),                              label: 'Total Percobaan',  icon: <TrendingUp size={15} />, bg: '#2563eb', fg: '#fff', pat: 'pat-dots-w' },
          { value: bestAttempt ? `${bestAttempt.correctAnswers}/25` : '—', label: 'Terbaik',      icon: <Award size={15} />,     bg: '#22c55e', fg: '#000', pat: 'pat-stripes' },
          { value: sorted.length ? `${avgCorrect}/25` : '—',          label: 'Rata-rata',         icon: <Star size={15} />,      bg: '#f97316', fg: '#000', pat: 'pat-zigzag' },
          { value: trend ? '↑ Naik' : '→ Stabil',                     label: 'Tren 3 Terakhir',  icon: <TrendingUp size={15} />, bg: trend ? '#ffd23f' : '#a855f7', fg: trend ? '#000' : '#fff', pat: 'pat-grid-w' },
        ].map((s, i) => (
          <div key={i} className={`neo-card ${s.pat} animate-fade-up stagger-${i+1}`} style={{
            backgroundColor: s.bg, padding: '18px 22px',
            display: 'flex', flexDirection: 'column', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>
              {s.icon}<span>{s.label}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 36, lineHeight: 1, fontWeight: 800, color: s.fg, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Benar vs Salah chart */}
      <div className="neo-card pat-dots" style={{ backgroundColor: '#ffd23f', marginBottom: 24, padding: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, flexWrap: 'wrap', gap: 10 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#000' }}>TREN JAWABAN BENAR VS SALAH</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.60)', marginTop: 2 }}>Per percobaan kuis yang diselesaikan</div>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className={`chip${view === 'line' ? ' active' : ''}`} onClick={() => setView('line')}>Garis</button>
            <button className={`chip${view === 'bar' ? ' active' : ''}`} onClick={() => setView('bar')}>Batang</button>
          </div>
        </div>
        <div style={{ height: 280 }}>
          <ResponsiveContainer width="100%" height="100%">
            {view === 'line' ? (
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(0,0,0,0.65)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(0,0,0,0.65)', fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#000' }} />
                <Line type="monotone" dataKey="Benar" stroke="#059669" strokeWidth={2.5} dot={{ fill: '#059669', r: 3 }} />
                <Line type="monotone" dataKey="Salah" stroke="#dc2626" strokeWidth={2} strokeDasharray="4 2" dot={{ fill: '#dc2626', r: 3 }} />
              </LineChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.12)" />
                <XAxis dataKey="name" tick={{ fill: 'rgba(0,0,0,0.65)', fontSize: 11 }} />
                <YAxis tick={{ fill: 'rgba(0,0,0,0.65)', fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Legend wrapperStyle={{ fontSize: 12, color: '#000' }} />
                <Bar dataKey="Benar" fill="#059669" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Salah" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* Points trend */}
      <div className="neo-card pat-stripes-w" style={{ backgroundColor: '#2563eb', marginBottom: 24, padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16 }}>POIN PER PERCOBAAN</div>
        <div style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.20)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.80)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.80)', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Line type="monotone" dataKey="Poin" stroke="#ffd23f" strokeWidth={2.5} dot={{ fill: '#ffd23f', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="neo-card pat-checker-w" style={{ backgroundColor: '#6b7280', padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16 }}>RIWAYAT LENGKAP</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>#</th><th>Topik</th><th>Benar</th><th>Salah</th><th>Poin</th><th>Tanggal</th></tr></thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Belum ada percobaan kuis</td></tr>
              )}
              {[...sorted].reverse().map(a => (
                <tr key={a.id}>
                  <td style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>#{a.attemptNumber}</td>
                  <td><span className="badge badge-muted">{a.topic ?? '—'}</span></td>
                  <td><span style={{ color: 'var(--green)', fontWeight: 700 }}>{a.correctAnswers}</span></td>
                  <td><span style={{ color: 'var(--red)' }}>{a.wrongAnswers}</span></td>
                  <td><span style={{ color: 'var(--amber)', fontWeight: 700 }}>{a.pointsEarned}</span></td>
                  <td style={{ fontSize: 12 }}>{fmtDate(a.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
