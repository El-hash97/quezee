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

const BOARD_COLORS = [
  '#fbbf24','#f97316','#84cc16','#06b6d4',
  '#a78bfa','#f472b6','#34d399','#60a5fa',
  '#fb923c','#4ade80','#38bdf8','#c084fc',
  '#facc15','#f87171','#a3e635','#22d3ee',
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

  const chartData = filtered.slice(0, 10).map((u, i) => ({
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
      <div style={{ marginBottom: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {/* Label + Line row */}
        <div className="lb-filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
        <div className="lb-filter-row" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
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
        <div className="neo-card pat-stripes lb-rank-banner" style={{ padding: '16px 22px', backgroundColor: '#ffd23f', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
          <Trophy size={20} style={{ color: '#000', flexShrink: 0 }} />
          <span style={{ fontSize: 15, fontWeight: 700, color: '#000' }}>
            Peringkat kamu: <span style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '-0.02em' }}>#{myRank}</span> dari {filtered.length} peserta
          </span>
        </div>
      )}

      {/* Podium top 10 */}
      {top10.length > 0 && (
        <div className="neo-card-lg pat-grid-w lb-section" style={{ backgroundColor: '#a855f7', marginBottom: 24, padding: 20, position: 'relative', overflow: 'hidden' }}>

          {/* ── Background decorations ── */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>

            {/* Trophy – top-left */}
            <div style={{ position: 'absolute', top: 8, left: 10, transform: 'rotate(-14deg)', opacity: 0.28 }}>
              <svg width="46" height="52" viewBox="0 0 40 46">
                <rect x="10" y="36" width="20" height="6" rx="1" fill="#fff" stroke="#000" strokeWidth="2.5"/>
                <rect x="13" y="28" width="14" height="10" rx="1" fill="#ffd23f" stroke="#000" strokeWidth="2.5"/>
                <path d="M5 6 Q5 24 20 24 Q35 24 35 6 Z" fill="#ffd23f" stroke="#000" strokeWidth="2.5"/>
                <path d="M5 6 Q0 6 0 14 Q0 24 7 24" fill="none" stroke="#000" strokeWidth="2.5"/>
                <path d="M35 6 Q40 6 40 14 Q40 24 33 24" fill="none" stroke="#000" strokeWidth="2.5"/>
                <rect x="2" y="4" width="36" height="5" rx="1" fill="#ffd23f" stroke="#000" strokeWidth="2.5"/>
              </svg>
            </div>

            {/* Medal – top-right */}
            <div style={{ position: 'absolute', top: 6, right: 10, transform: 'rotate(14deg)', opacity: 0.28 }}>
              <svg width="44" height="52" viewBox="0 0 40 52">
                <line x1="10" y1="0" x2="20" y2="18" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
                <line x1="30" y1="0" x2="20" y2="18" stroke="#ef4444" strokeWidth="5" strokeLinecap="round"/>
                <circle cx="20" cy="34" r="16" fill="#ffd23f" stroke="#000" strokeWidth="2.5"/>
                <circle cx="20" cy="34" r="10" fill="none" stroke="#000" strokeWidth="2"/>
                <text x="20" y="39" textAnchor="middle" fill="#000" fontSize="11" fontWeight="900" fontFamily="sans-serif">1</text>
              </svg>
            </div>

            {/* Gift box – bottom-left */}
            <div style={{ position: 'absolute', bottom: 8, left: 8, transform: 'rotate(9deg)', opacity: 0.26 }}>
              <svg width="52" height="52" viewBox="0 0 44 46">
                <rect x="0" y="16" width="44" height="30" rx="2" fill="#ef4444" stroke="#000" strokeWidth="2.5"/>
                <rect x="0" y="8" width="44" height="10" rx="1" fill="#ffd23f" stroke="#000" strokeWidth="2.5"/>
                <line x1="22" y1="8" x2="22" y2="46" stroke="#000" strokeWidth="2.5"/>
                <path d="M22 8 Q12 -2 6 2 Q0 6 22 8" fill="#22c55e" stroke="#000" strokeWidth="2"/>
                <path d="M22 8 Q32 -2 38 2 Q44 6 22 8" fill="#22c55e" stroke="#000" strokeWidth="2"/>
              </svg>
            </div>

            {/* Star burst – bottom-right */}
            <div style={{ position: 'absolute', bottom: 10, right: 8, transform: 'rotate(-8deg)', opacity: 0.26 }}>
              <svg width="52" height="52" viewBox="0 0 44 44">
                {[0,45,90,135,22.5,67.5,112.5,157.5].map((deg) => (
                  <line key={deg}
                    x1="22" y1="22"
                    x2={22 + 22*Math.cos((deg-90)*Math.PI/180)}
                    y2={22 + 22*Math.sin((deg-90)*Math.PI/180)}
                    stroke="#ffd23f" strokeWidth="4" strokeLinecap="round"/>
                ))}
                <circle cx="22" cy="22" r="11" fill="#ec4899" stroke="#000" strokeWidth="2.5"/>
                <text x="22" y="27" textAnchor="middle" fill="#fff" fontSize="13" fontWeight="900" fontFamily="sans-serif">★</text>
              </svg>
            </div>

            {/* Bow / ribbon – center top */}
            <div style={{ position: 'absolute', top: 6, left: '50%', transform: 'translateX(-50%) rotate(-4deg)', opacity: 0.22 }}>
              <svg width="48" height="28" viewBox="0 0 48 28">
                <path d="M24 16 Q8 0 0 8 Q6 20 24 16" fill="#f97316" stroke="#000" strokeWidth="2"/>
                <path d="M24 16 Q40 0 48 8 Q42 20 24 16" fill="#f97316" stroke="#000" strokeWidth="2"/>
                <line x1="24" y1="16" x2="24" y2="28" stroke="#f97316" strokeWidth="3" strokeLinecap="round"/>
                <circle cx="24" cy="16" r="5" fill="#ffd23f" stroke="#000" strokeWidth="2"/>
              </svg>
            </div>

            {/* Medal #2 – mid-left */}
            <div style={{ position: 'absolute', top: '45%', left: 6, transform: 'rotate(-8deg)', opacity: 0.20 }}>
              <svg width="32" height="32" viewBox="0 0 32 32">
                <polygon points="16,2 19,12 30,12 21,19 24,30 16,23 8,30 11,19 2,12 13,12" fill="#ffd23f" stroke="#000" strokeWidth="2"/>
              </svg>
            </div>

            {/* Confetti rects – scattered */}
            {([
              { top:'20%', left:'22%', w:10, h:5,  fill:'#ffd23f', rot: 20 },
              { top:'75%', left:'30%', w:8,  h:4,  fill:'#22c55e', rot:-15 },
              { top:'15%', left:'70%', w:10, h:5,  fill:'#06b6d4', rot: 35 },
              { top:'80%', left:'65%', w:8,  h:4,  fill:'#f97316', rot:-25 },
              { top:'50%', left:'88%', w:9,  h:5,  fill:'#ec4899', rot: 10 },
              { top:'55%', left:'12%', w:8,  h:4,  fill:'#a855f7', rot:-18 },
              { top:'38%', left:'48%', w:7,  h:4,  fill:'#ffd23f', rot: 40 },
            ] as {top:string;left:string;w:number;h:number;fill:string;rot:number}[]).map((d, i) => (
              <div key={i} style={{
                position: 'absolute', top: d.top, left: d.left,
                width: d.w, height: d.h,
                backgroundColor: d.fill,
                border: '1.5px solid #000',
                transform: `rotate(${d.rot}deg)`,
                opacity: 0.35,
              }}/>
            ))}
          </div>

          <div className="lb-section-title" style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16, position: 'relative' }}>PODIUM TERATAS</div>
          {/* Podium top 3 */}
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 20, paddingBottom: 4, position: 'relative' }}>
            {[1, 0, 2].map((idx) => {
              const u = top10[idx];
              if (!u) return null;
              const c = TOP10_COLORS[idx];
              const lvl = getLevel(u.totalPoints);
              const isFirst = idx === 0;
              const podiumHeight = idx === 0 ? 110 : idx === 1 ? 76 : 58;
              const cardMinWidth = idx === 0 ? 156 : 124;
              return (
                <div key={u.noreg} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: cardMinWidth, flexShrink: 0 }}>
                  {/* Info card */}
                  <div className={`neo-card ${c.pat}`} style={{
                    backgroundColor: c.bg,
                    width: '100%',
                    padding: isFirst ? '18px 14px' : '14px 10px',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isFirst ? 9 : 6,
                  }}>
                    <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: isFirst ? 28 : 21, lineHeight: 1, color: c.fg }}>
                      #{idx + 1}
                    </div>
                    {idx === 0 && <Crown size={20} style={{ color: c.fg }} />}
                    {idx === 1 && <Trophy size={17} style={{ color: c.fg }} />}
                    {idx === 2 && <Medal size={17} style={{ color: c.fg }} />}
                    <div style={{
                      width: isFirst ? 58 : 44, height: isFirst ? 58 : 44,
                      background: c.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)',
                      border: `2px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--font-bebas),sans-serif', fontSize: isFirst ? 30 : 23, color: c.fg,
                    }}>
                      {u.name.charAt(0)}
                    </div>
                    <div style={{ fontSize: isFirst ? 12 : 10, fontWeight: 700, color: c.fg, textAlign: 'center', lineHeight: 1.3, maxWidth: isFirst ? 136 : 108 }}>
                      {u.name.split(' ').slice(0, 2).join(' ')}
                    </div>
                    <div style={{ fontSize: 14 }}>{BADGES[lvl.level]}</div>
                    <div style={{
                      fontFamily: 'var(--font-bebas),sans-serif', fontSize: isFirst ? 17 : 14, color: c.fg,
                      background: c.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)',
                      padding: '3px 12px', letterSpacing: '0.02em', whiteSpace: 'nowrap',
                    }}>
                      {u.totalPoints} pts
                    </div>
                  </div>
                  {/* Podium base */}
                  <div style={{
                    width: '100%', height: podiumHeight,
                    backgroundColor: c.bg,
                    border: `3px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.60)' : 'rgba(255,255,255,0.70)'}`,
                    boxShadow: '4px 4px 0 0 rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'var(--font-bebas),sans-serif', fontSize: 40, color: c.fg,
                    opacity: 0.88,
                  }}>
                    {idx + 1}
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Bar chart */}
      <div className="neo-card pat-dots-w lb-section" style={{ backgroundColor: '#ec4899', marginBottom: 24, padding: 20 }}>
        <div className="lb-section-title" style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#fff', marginBottom: 16 }}>TOP 10 PESERTA</div>
        <div className="lb-chart">
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

      {/* Full list – papan kayu */}
      <div className="neo-card pat-lines lb-section" style={{ backgroundColor: '#bfdbfe', padding: 20 }}>
        <div className="lb-section-title" style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, letterSpacing: '0.06em', color: '#111', marginBottom: 16 }}>
          DAFTAR LENGKAP ({filtered.length} PESERTA)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {filtered.map((u, i) => {
            const lvl = getLevel(u.totalPoints);
            const isMe = u.noreg === myNoreg;
            const bg = BOARD_COLORS[i % BOARD_COLORS.length];
            const rankIcon = i === 0 ? '👑' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;
            return (
              <div
                key={u.noreg}
                style={{
                  background: `repeating-linear-gradient(
                    90deg,
                    rgba(255,255,255,0.18) 0px,
                    rgba(255,255,255,0.06) 2px,
                    transparent 3px,
                    transparent 11px,
                    rgba(0,0,0,0.06) 12px,
                    transparent 14px,
                    transparent 22px
                  ), ${bg}`,
                  border: '2.5px solid #000',
                  borderBottom: '4px solid #000',
                  boxShadow: isMe ? '3px 3px 0 0 #059669' : '2px 2px 0 0 rgba(0,0,0,0.35)',
                  padding: '7px 10px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {/* Rank */}
                <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 17, lineHeight: 1, color: '#000', minWidth: 34, textAlign: 'center', flexShrink: 0 }}>
                  {rankIcon ? <span style={{ fontSize: 16 }}>{rankIcon}</span> : `#${i + 1}`}
                </div>

                {/* Avatar */}
                <div style={{
                  width: 30, height: 30, flexShrink: 0,
                  background: 'rgba(0,0,0,0.18)',
                  border: `2px solid ${isMe ? '#059669' : 'rgba(0,0,0,0.30)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-bebas),sans-serif', fontSize: 16, color: '#000',
                }}>
                  {u.name.charAt(0)}
                </div>

                {/* Name + noreg */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#000', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {u.name}
                    {isMe && (
                      <span style={{ fontSize: 9, fontWeight: 700, color: '#fff', background: '#059669', border: '1.5px solid #000', padding: '1px 4px', marginLeft: 5 }}>
                        KAMU
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 10, color: '#000', opacity: 0.6 }}>{u.noreg.padStart(7, '0')}</div>
                </div>

                {/* Line – hidden on mobile */}
                <div className="lb-col-hide" style={{
                  fontSize: 9, fontWeight: 700, color: '#000',
                  background: 'rgba(0,0,0,0.14)', border: '1.5px solid rgba(0,0,0,0.25)',
                  padding: '2px 5px', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {u.line}
                </div>

                {/* Level */}
                <div style={{ flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'center', minWidth: 36 }}>
                  <div style={{ fontSize: 13, lineHeight: 1 }}>{BADGES[lvl.level]}</div>
                  <div style={{ fontSize: 9, fontWeight: 700, color: '#000', opacity: 0.7 }}>Lv.{lvl.level}</div>
                </div>

                {/* Points */}
                <div style={{
                  fontFamily: 'var(--font-bebas),sans-serif', fontSize: 19, color: '#000',
                  background: 'rgba(0,0,0,0.16)', border: '2px solid rgba(0,0,0,0.25)',
                  padding: '1px 8px', flexShrink: 0, whiteSpace: 'nowrap',
                  letterSpacing: '0.02em',
                }}>
                  {u.totalPoints}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
