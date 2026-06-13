'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, BookOpen, Brain, AlertTriangle, Palette, Check } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { MATERIALS, QUESTIONS } from '@/lib/mockData';
import { THEME_COLORS, THEME_KEY, applyTheme } from '@/lib/theme';

const BAR_COLORS = ['#F87171', '#FB923C', '#FBBF24', '#34D399', '#60A5FA', '#A78BFA', '#F472B6'];

interface UserRow {
  noreg: string; name: string; line: string; division: string;
  role: string; totalPoints: number; attempts: number;
}

interface WrongStat {
  topic: string; wrongCount: number; totalAttempts: number; pct: number;
}

export default function AdminDashboardPage() {
  const [activeBg, setActiveBg] = useState('#000000');
  const [saved, setSaved] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [wrongStats, setWrongStats] = useState<WrongStat[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored) setActiveBg(stored);

    fetch('/api/admin/users', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setUsers(d); })
      .catch(() => {});

    fetch('/api/admin/stats', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setWrongStats(d); })
      .catch(() => {});
  }, []);

  function handleThemeSave() {
    localStorage.setItem(THEME_KEY, activeBg);
    applyTheme(activeBg);
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  }

  const participants = users.filter(u => u.role !== 'ADMIN');
  const totalAttempts = participants.reduce((s, u) => s + u.attempts, 0);
  const activeParticipants = participants.filter(u => u.attempts > 0).length;
  const top5 = [...participants].sort((a, b) => b.totalPoints - a.totalPoints).slice(0, 5);

  const chartData = wrongStats.map(s => ({ name: s.topic, 'Jawaban Salah': s.wrongCount, pct: s.pct }));
  const totalAttemptsForSubtitle = wrongStats.reduce((s, r) => s + r.totalAttempts, 0);

  const Tip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) =>
    active && payload?.length ? (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px', fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
        <div style={{ color: 'var(--red)' }}>{payload[0].value} jawaban salah</div>
      </div>
    ) : null;

  return (
    <AppShell title="Admin Dashboard" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">ADMIN DASHBOARD</div>
        <div className="page-subtitle">Ringkasan platform & analitik jawaban salah peserta</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { value: String(participants.length), label: 'Total Peserta',   icon: <Users size={16} />,    bg: '#2563eb', fg: '#fff', pat: 'pat-dots-w' },
          { value: String(MATERIALS.length),    label: 'Total Materi',    icon: <BookOpen size={16} />, bg: '#ffd23f', fg: '#000', pat: 'pat-stripes' },
          { value: String(QUESTIONS.length),    label: 'Bank Soal',       icon: <Brain size={16} />,    bg: '#a855f7', fg: '#fff', pat: 'pat-grid-w' },
          { value: String(totalAttempts),       label: 'Total Percobaan', icon: <Brain size={16} />,    bg: '#22c55e', fg: '#000', pat: 'pat-checker' },
          { value: String(activeParticipants),    label: 'Sudah Ikut Kuis', icon: <Users size={16} />,    bg: '#ef4444', fg: '#fff', pat: 'pat-dots-w' },
        ].map((s, i) => (
          <div key={i} className={`neo-card ${s.pat} animate-fade-up stagger-${i + 1}`} style={{ backgroundColor: s.bg, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: s.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)', fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', textTransform: 'uppercase' }}>{s.icon}<span>{s.label}</span></div>
            <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 40, fontWeight: 800, color: s.fg, lineHeight: 1, letterSpacing: '-0.02em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Wrong answer bar chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <div className="section-title" style={{ backgroundColor: '#2563eb', color: '#fff' }}>Wrong Answer Insights</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
            {totalAttemptsForSubtitle > 0
              ? `Topik dengan jawaban salah terbanyak dari ${totalAttemptsForSubtitle} percobaan`
              : 'Belum ada data percobaan kuis'}
          </div>
        </div>
        {chartData.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 13 }}>
            Belum ada data kuis untuk ditampilkan
          </div>
        ) : (
          <div style={{ height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 40, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-dim)" horizontal={false} />
                <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={160} tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                <Tooltip content={<Tip />} />
                <Bar dataKey="Jawaban Salah" radius={[0, 4, 4, 0]}>
                  {chartData.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <AlertTriangle size={16} style={{ color: 'var(--red)' }} />
          <div className="section-title" style={{ backgroundColor: '#ef4444', color: '#fff' }}>Detail Topik Bermasalah</div>
        </div>
        {wrongStats.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 13 }}>
            Belum ada data
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead><tr><th>Topik</th><th>Jawaban Salah</th><th>Total Attempt</th><th>% Salah</th><th>Tingkat</th></tr></thead>
              <tbody>
                {wrongStats.map((s, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: 13 }}>{s.topic}</td>
                    <td><span style={{ color: 'var(--red)', fontWeight: 700, fontFamily: 'var(--font-bebas),sans-serif', fontSize: 16 }}>{s.wrongCount}</span></td>
                    <td><span style={{ color: 'var(--text-muted)', fontSize: 13 }}>{s.totalAttempts}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div className="progress" style={{ width: 80, height: 6 }}>
                          <div className="progress-bar" style={{ width: `${s.pct}%`, background: s.pct > 60 ? 'var(--red)' : s.pct > 40 ? 'var(--amber)' : 'var(--green)' }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 700, color: s.pct > 60 ? 'var(--red)' : s.pct > 40 ? 'var(--amber)' : 'var(--green)' }}>{s.pct}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${s.pct > 60 ? 'badge-red' : s.pct > 40 ? 'badge-amber' : 'badge-green'}`}>
                        {s.pct > 60 ? 'Kritis' : s.pct > 40 ? 'Perlu Perhatian' : 'Normal'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Theme color picker */}
      <div className="neo-card-lg pat-dots-w" style={{ backgroundColor: '#a855f7', padding: '24px 28px', marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <Palette size={18} style={{ color: '#fff' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, letterSpacing: '0.06em', color: '#fff', lineHeight: 1 }}>TEMA WARNA APLIKASI</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>Pilih warna latar belakang untuk seluruh tampilan aplikasi</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
          {THEME_COLORS.map(tc => (
            <button
              key={tc.value}
              onClick={() => setActiveBg(tc.value)}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                padding: '10px 14px', cursor: 'pointer', border: 'none', background: 'transparent',
              }}
            >
              <div style={{
                width: 44, height: 44,
                backgroundColor: tc.value,
                border: activeBg === tc.value ? '3px solid #fff' : '3px solid rgba(255,255,255,0.30)',
                boxShadow: activeBg === tc.value ? '0 0 0 2px #000, 4px 4px 0 0 rgba(0,0,0,0.40)' : '2px 2px 0 0 rgba(0,0,0,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'all 120ms ease',
              }}>
                {activeBg === tc.value && <Check size={20} color={tc.value === '#000000' ? '#fff' : '#000'} strokeWidth={3} />}
              </div>
              <span style={{ fontSize: 10, fontWeight: 700, color: activeBg === tc.value ? '#fff' : 'rgba(255,255,255,0.70)', letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
                {tc.label}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={handleThemeSave}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', background: saved ? '#22c55e' : '#000',
            border: '2px solid #000', color: saved ? '#fff' : '#ffd23f',
            fontWeight: 700, fontSize: 14, letterSpacing: '0.04em', cursor: 'pointer',
            boxShadow: '3px 3px 0 0 rgba(255,255,255,0.35)', transition: 'background 150ms ease',
          }}
        >
          {saved ? <><Check size={14} /> Tersimpan!</> : 'Terapkan Tema'}
        </button>
      </div>

      {/* Top participants */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16, backgroundColor: '#ec4899', color: '#fff' }}>Top 5 Peserta</div>
        {top5.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '24px 0', fontSize: 13 }}>
            Belum ada peserta terdaftar
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {top5.map((u, i) => (
              <div key={u.noreg} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 'var(--radius)' }}>
                <span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, color: i < 3 ? 'var(--amber)' : 'var(--text-muted)', minWidth: 24 }}>#{i + 1}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.line} · {u.division}</div>
                </div>
                <span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, color: 'var(--amber)' }}>{u.totalPoints}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
