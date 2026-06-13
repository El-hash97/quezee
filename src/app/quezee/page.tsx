'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Brain, ChevronRight, Zap, Clock } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Attempt {
  id: number; attemptNumber: number; topic: string | null;
  correctAnswers: number; wrongAnswers: number; pointsEarned: number;
  createdAt: string | null;
}

const QUIZ_TOPICS = [
  { id: 'all',         label: 'Semua Topik',  desc: '25 soal campuran Seven Tools & 8 Steps', icon: '🎯', bg: '#ffd23f', fg: '#000', pat: 'pat-dots' },
  { id: 'seven-tools', label: 'Seven Tools',  desc: '25 soal khusus 7 alat kualitas dasar',   icon: '🔧', bg: '#2563eb', fg: '#fff', pat: 'pat-stripes-w' },
  { id: '8-steps',     label: '8 Langkah',    desc: '25 soal metodologi 8 Steps QCC',          icon: '📋', bg: '#a855f7', fg: '#fff', pat: 'pat-grid-w' },
];

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default function QuezeePage() {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    fetch('/api/quiz/attempts').then(r => r.json()).then(d => { if (Array.isArray(d)) setAttempts(d); }).catch(() => {});
    fetch('/api/auth/me').then(r => r.json()).then(d => { if (d.noreg) setTotalPoints(d.totalPoints ?? 0); }).catch(() => {});
  }, []);

  const sorted = [...attempts].sort((a, b) => a.attemptNumber - b.attemptNumber);
  const bestScore = sorted.length ? Math.max(...sorted.map(a => a.pointsEarned)) : 0;
  const lastAttempt = sorted[sorted.length - 1] ?? null;

  return (
    <AppShell title="Quezee">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">QUEZEE</div>
        <div className="page-subtitle">Uji Pemahaman Seven Tools & 8 Steps — +5 poin per jawaban benar</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { value: String(sorted.length),                                    label: 'Total Percobaan', bg: '#2563eb', fg: '#fff', pat: 'pat-dots-w' },
          { value: String(bestScore),                                        label: 'Skor Terbaik',    bg: '#ffd23f', fg: '#000', pat: 'pat-stripes' },
          { value: lastAttempt ? `${lastAttempt.correctAnswers}/25` : '—',  label: 'Kuis Terakhir',   bg: '#22c55e', fg: '#000', pat: 'pat-zigzag' },
          { value: String(totalPoints),                                      label: 'Total Poin',      bg: '#a855f7', fg: '#fff', pat: 'pat-checker-w' },
        ].map((s, i) => (
          <div key={i} className={`neo-card ${s.pat} animate-fade-up stagger-${i+1}`} style={{
            backgroundColor: s.bg, padding: '18px 22px',
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: s.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.7)' }}>{s.label}</div>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 36, lineHeight: 1, fontWeight: 800, color: s.fg, letterSpacing: '-0.03em' }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Rules banner */}
      <div className="neo-card pat-stripes" style={{ backgroundColor: '#ffd23f', padding: '14px 20px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Zap size={16} style={{ color: '#000', flexShrink: 0 }} />
        <div style={{ fontSize: 13, color: '#000' }}>
          <strong>Aturan:</strong> Jawaban <span style={{ color: '#059669', fontWeight: 700 }}>Benar = +5 poin</span> &nbsp;&middot;&nbsp;
          Jawaban <span style={{ color: 'rgba(0,0,0,0.55)' }}>Salah = 0 poin</span> &nbsp;&middot;&nbsp;
          25 soal per sesi &nbsp;&middot;&nbsp; Tidak ada batas percobaan
        </div>
      </div>

      {/* Topic cards */}
      <div style={{ marginBottom: 28 }}>
        <div className="section-title" style={{ marginBottom: 14, backgroundColor: '#a855f7', color: '#fff' }}>Pilih Topik Kuis</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {QUIZ_TOPICS.map((topic, i) => (
            <Link key={topic.id} href={`/quezee/${topic.id}`}
              className={`neo-card-lg ${topic.pat} animate-fade-up stagger-${i+1}`}
              style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 16, padding: 22, backgroundColor: topic.bg }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{
                  width: 56, height: 56, flexShrink: 0,
                  background: topic.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)',
                  border: `2px solid ${topic.fg === '#000' ? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.30)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                }}>
                  {topic.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 22, letterSpacing: '0.04em', color: topic.fg, lineHeight: 1 }}>{topic.label.toUpperCase()}</div>
                  <div style={{ fontSize: 12, marginTop: 4, color: topic.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)' }}>{topic.desc}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: topic.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)' }}><Clock size={11} /> ~15 menit</span>
                  <span style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, color: topic.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)' }}><Brain size={11} /> 25 soal</span>
                </div>
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', fontSize: 12, fontWeight: 700,
                  background: topic.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)',
                  border: `2px solid ${topic.fg === '#000' ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.35)'}`,
                  color: topic.fg, pointerEvents: 'none',
                }}>Mulai <ChevronRight size={13} /></span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* History table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="section-title" style={{ backgroundColor: '#22c55e', color: '#000' }}>Riwayat Percobaan</div>
          <Link href="/performance" style={{ fontSize: 12, color: 'var(--amber)', textDecoration: 'none', fontWeight: 600 }}>Lihat grafik →</Link>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead><tr><th>No</th><th>Topik</th><th>Benar</th><th>Salah</th><th>Poin</th><th>Tanggal</th></tr></thead>
            <tbody>
              {sorted.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Belum ada riwayat kuis</td></tr>
              )}
              {[...sorted].reverse().slice(0, 6).map(a => (
                <tr key={a.id}>
                  <td><span style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 16, color: 'var(--text-primary)' }}>#{a.attemptNumber}</span></td>
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
