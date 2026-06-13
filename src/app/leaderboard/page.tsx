'use client';
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Trophy, Medal, Crown } from 'lucide-react';

const TOP10_COLORS = [
  { bg: '#ffd23f', fg: '#000', pat: 'pat-dots' },
  { bg: '#94a3b8', fg: '#fff', pat: 'pat-stripes-w' },
  { bg: '#f97316', fg: '#000', pat: 'pat-lines' },
  { bg: '#ef4444', fg: '#fff', pat: 'pat-dots-w' },
  { bg: '#2563eb', fg: '#fff', pat: 'pat-stripes-w' },
  { bg: '#22c55e', fg: '#000', pat: 'pat-checker' },
  { bg: '#ec4899', fg: '#fff', pat: 'pat-zigzag-w' },
  { bg: '#06b6d4', fg: '#000', pat: 'pat-grid' },
  { bg: '#a855f7', fg: '#fff', pat: 'pat-dots-w' },
  { bg: '#84cc16', fg: '#000', pat: 'pat-lines' },
];
import AppShell from '@/components/AppShell';
import { getLevel } from '@/lib/mockData';

interface LBEntry { rank: number; noreg: string; name: string; line: string | null; division: string | null; totalPoints: number; attempts: number; }

const BADGES = ['', '🌱', '⭐', '🔥', '💎', '🏆', '👑'];

const LINE_OPTS: { label: string; bg: string; fg: string; pat: string; shadow: string }[] = [
  { label: 'Semua Line',   bg: '#1a1a1a', fg: '#fff',   pat: 'pat-grid',      shadow: '#555555'  },
  { label: 'MELTING',      bg: '#f97316', fg: '#000',   pat: 'pat-dots',      shadow: '#000000'  },
  { label: 'CORE MAKING',  bg: '#ffd23f', fg: '#000',   pat: 'pat-stripes',   shadow: '#000000'  },
  { label: 'MOULDING',     bg: '#2563eb', fg: '#fff',   pat: 'pat-lines-w',   shadow: '#000000'  },
  { label: 'FINISHING',    bg: '#22c55e', fg: '#000',   pat: 'pat-checker',   shadow: '#000000'  },
  { label: 'DIE PRESS',    bg: '#ef4444', fg: '#fff',   pat: 'pat-dots-w',    shadow: '#000000'  },
  { label: 'MAINTENANCE',  bg: '#a855f7', fg: '#fff',   pat: 'pat-zigzag-w',  shadow: '#000000'  },
  { label: 'ENGINEERING',  bg: '#06b6d4', fg: '#000',   pat: 'pat-grid',      shadow: '#000000'  },
];

const SHIFT_OPTS: { label: string; bg: string; fg: string; pat: string; shadow: string }[] = [
  { label: 'Semua Shift', bg: '#1a1a1a', fg: '#fff', pat: 'pat-grid',   shadow: '#555555' },
  { label: 'RED',         bg: '#ef4444', fg: '#fff', pat: 'pat-dots-w', shadow: '#000000' },
  { label: 'WHITE',       bg: '#f1f5f9', fg: '#000', pat: 'pat-lines',  shadow: '#000000' },
];

export default function LeaderboardPage() {
  const [all, setAll] = useState<LBEntry[]>([]);
  const [myNoreg, setMyNoreg] = useState<string>('');
  const [lineFilter, setLineFilter] = useState('Semua Line');
  const [divFilter, setDivFilter] = useState('Semua Shift');

  useEffect(() => {
    fetch('/api/leaderboard').then(r => r.json()).then(d => { if (Array.isArray(d)) setAll(d); }).catch(() => {});
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.noreg) setMyNoreg(d.noreg); }).catch(() => {});
  }, []);

  const filtered = all
    .filter(u => lineFilter === 'Semua Line' || u.line === lineFilter)
    .filter(u => divFilter === 'Semua Shift' || u.division === divFilter);

  const top10 = filtered.slice(0, 10);
  const myRank = filtered.findIndex(u => u.noreg === myNoreg) + 1;

  const chartData = filtered.slice(0, 8).map((u, i) => ({
    name: u.name.split(' ')[0],
    Poin: u.totalPoints,
    rank: i + 1,
  }));

  const Tip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) =>
    active && payload?.length ? (
      <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 12px', fontSize: 12 }}>
        <div style={{ fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>{label}</div>
        <div style={{ color: 'var(--amber)' }}>{payload[0].value} pts</div>
      </div>
    ) : null;

  return (
    <AppShell title="Leaderboard">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">LEADERBOARD</div>
        <div className="page-subtitle">Peringkat peserta berdasarkan total poin yang dikumpulkan</div>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {/* Label + Line row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 36 }}>LINE</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {LINE_OPTS.map(opt => {
              const active = lineFilter === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => setLineFilter(opt.label)}
                  className={opt.pat}
                  style={{
                    backgroundColor: opt.bg,
                    color: opt.fg,
                    border: `2px solid ${opt.fg === '#000' ? 'rgba(0,0,0,0.70)' : 'rgba(255,255,255,0.80)'}`,
                    boxShadow: active ? 'none' : `3px 3px 0 0 ${opt.shadow}`,
                    transform: active ? 'translate(2px,2px)' : 'none',
                    padding: '4px 10px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    outline: 'none',
                    transition: 'transform 0.08s, box-shadow 0.08s',
                    opacity: active ? 1 : 0.82,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
        {/* Label + Shift row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.10em', color: 'var(--text-muted)', textTransform: 'uppercase', whiteSpace: 'nowrap', minWidth: 36 }}>SHIFT</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {SHIFT_OPTS.map(opt => {
              const active = divFilter === opt.label;
              return (
                <button
                  key={opt.label}
                  onClick={() => setDivFilter(opt.label)}
                  className={opt.pat}
                  style={{
                    backgroundColor: opt.bg,
                    color: opt.fg,
                    border: `2px solid ${opt.fg === '#000' ? 'rgba(0,0,0,0.70)' : 'rgba(255,255,255,0.80)'}`,
                    boxShadow: active ? 'none' : `3px 3px 0 0 ${opt.shadow}`,
                    transform: active ? 'translate(2px,2px)' : 'none',
                    padding: '4px 14px',
                    fontSize: 10,
                    fontWeight: 700,
                    letterSpacing: '0.07em',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    outline: 'none',
                    transition: 'transform 0.08s, box-shadow 0.08s',
                    opacity: active ? 1 : 0.82,
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* My rank banner */}
      {myRank > 0 && (
        <div className="neo-card pat-stripes" style={{ padding: '16px 22px', backgroundColor: '#ffd23f', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Trophy size={20} style={{ color: '#000', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>
            Peringkat kamu: <span style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '-0.02em' }}>#{myRank}</span> dari {filtered.length} peserta
          </span>
        </div>
      )}

      {/* Podium top 10 */}
      {top10.length > 0 && (
        <div className="neo-card-lg pat-grid-w" style={{ backgroundColor: '#a855f7', marginBottom: 24, padding: 20 }}>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16 }}>PODIUM TERATAS</div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
            {top10.map((u, i) => {
              const c = TOP10_COLORS[i];
              const lvl = getLevel(u.totalPoints);
              const isFirst = i === 0;
              const dim = c.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)';
              return (
                <div key={u.noreg}
                  className={`neo-card ${c.pat}`}
                  style={{
                    backgroundColor: c.bg,
                    minWidth: isFirst ? 116 : 96,
                    padding: isFirst ? '14px 10px' : '12px 8px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                    flexShrink: 0,
                  }}
                >
                  <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: isFirst ? 24 : 18, lineHeight: 1, color: c.fg }}>
                    #{i + 1}
                  </div>
                  {i === 0 && <Crown size={14} style={{ color: c.fg }} />}
                  {i === 1 && <Trophy size={13} style={{ color: c.fg }} />}
                  {i === 2 && <Medal size={13} style={{ color: c.fg }} />}
                  <div style={{
                    width: isFirst ? 44 : 34, height: isFirst ? 44 : 34,
                    background: c.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)',
                    border: `2px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-bebas),sans-serif', fontSize: isFirst ? 22 : 17, color: c.fg,
                  }}>
                    {u.name.charAt(0)}
                  </div>
                  <div style={{ fontSize: isFirst ? 12 : 10, fontWeight: 700, color: c.fg, textAlign: 'center', lineHeight: 1.2, maxWidth: isFirst ? 100 : 84 }}>
                    {u.name.split(' ')[0]}
                  </div>
                  <div style={{ fontSize: 13 }}>{BADGES[lvl.level]}</div>
                  <div style={{
                    fontFamily: 'var(--font-bebas),sans-serif', fontSize: isFirst ? 15 : 13, color: c.fg,
                    background: c.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)',
                    padding: '2px 8px', letterSpacing: '0.02em', whiteSpace: 'nowrap',
                  }}>
                    {u.totalPoints} pts
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Bar chart */}
      <div className="neo-card pat-dots-w" style={{ backgroundColor: '#ec4899', marginBottom: 24, padding: 20 }}>
        <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16 }}>TOP 8 PESERTA</div>
        <div style={{ height: 240 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.20)" />
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.80)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.80)', fontSize: 11 }} />
              <Tooltip content={<Tip />} />
              <Bar dataKey="Poin" radius={[4, 4, 0, 0]}>
                {chartData.map((_, i) => (
                  <Cell key={i} fill={i === 0 ? '#F59E0B' : i === 1 ? '#e2e8f0' : i === 2 ? '#fbbf24' : 'rgba(255,255,255,0.65)'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Full table */}
      <div className="neo-card pat-lines" style={{ backgroundColor: '#bfdbfe', padding: 20, '--text-primary': '#111111', '--text-secondary': '#374151', '--text-muted': '#6b7280', '--bg-elevated': '#dbeafe', '--border': 'rgba(0,0,0,0.15)' } as React.CSSProperties}>
        <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#111', marginBottom: 16 }}>DAFTAR LENGKAP ({filtered.length} PESERTA)</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Nama</th><th>Line</th><th>Shift</th><th>Level</th><th>Poin</th><th>Percobaan</th></tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const lvl = getLevel(u.totalPoints);
                const isMe = u.noreg === myNoreg;
                return (
                  <tr key={u.noreg} style={{ background: isMe ? 'rgba(5,150,105,0.06)' : '' }}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 16, color: i === 0 ? 'var(--amber)' : i === 1 ? '#9CA3AF' : i === 2 ? '#CD7F32' : 'var(--text-muted)' }}>#{i + 1}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--bg-elevated)', border: isMe ? '1px solid var(--amber)' : '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: isMe ? 'var(--amber)' : 'var(--text-muted)', flexShrink: 0 }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
                            {u.name} {isMe && <span style={{ fontSize: 10, color: 'var(--amber)', fontWeight: 700 }}>(Kamu)</span>}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.noreg.padStart(7, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-muted">{u.line}</span></td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.division}</span></td>
                    <td>
                      <span style={{ fontSize: 13 }}>{BADGES[lvl.level]}</span>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)', marginLeft: 4 }}>Lv.{lvl.level}</span>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 17, fontWeight: 800, color: '#ffd23f', textShadow: '0 1px 2px rgba(0,0,0,0.40)' }}>{u.totalPoints}</span></td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.attempts}x</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
