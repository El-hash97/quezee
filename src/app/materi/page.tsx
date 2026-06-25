'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Clock, ChevronRight, BookOpen } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Material {
  id: string; title: string; category: string;
  icon: string | null; description: string | null;
  readTime: number | null; fileUrl: string | null;
}

const NEO_SEVEN = [
  { bg: '#ef4444', fg: '#fff', pat: 'pat-dots-w' },
  { bg: '#2563eb', fg: '#fff', pat: 'pat-stripes-w' },
  { bg: '#ffd23f', fg: '#000', pat: 'pat-dots' },
  { bg: '#22c55e', fg: '#000', pat: 'pat-lines' },
  { bg: '#ec4899', fg: '#fff', pat: 'pat-zigzag-w' },
  { bg: '#06b6d4', fg: '#000', pat: 'pat-checker' },
  { bg: '#a855f7', fg: '#fff', pat: 'pat-grid-w' },
];

const NEO_EIGHT = [
  { bg: '#f97316', fg: '#000', pat: 'pat-stripes' },
  { bg: '#84cc16', fg: '#000', pat: 'pat-dots' },
  { bg: '#6b7280', fg: '#fff', pat: 'pat-stripes-w' },
  { bg: '#14b8a6', fg: '#000', pat: 'pat-grid' },
  { bg: '#f43f5e', fg: '#fff', pat: 'pat-checker-w' },
  { bg: '#8b5cf6', fg: '#fff', pat: 'pat-zigzag-w' },
  { bg: '#0ea5e9', fg: '#fff', pat: 'pat-dots-w' },
  { bg: '#fbbf24', fg: '#000', pat: 'pat-lines' },
];

export default function MateriPage() {
  const [materials, setMaterials] = useState<Material[]>([]);

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(d => { if (Array.isArray(d)) setMaterials(d); }).catch(() => {});
  }, []);

  const sevenTools = materials.filter(m => m.category === 'seven-tools');
  const eightSteps = materials.filter(m => m.category === '8-steps');

  return (
    <AppShell title="Materi">
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">MATERI PEMBELAJARAN</div>
        <div className="page-subtitle">Seven Tools & 8 Steps — Metodologi QCC Pabrik</div>
      </div>

      <section style={{ marginBottom: 32 }}>
        <div className="neo-card pat-dots" style={{ backgroundColor: '#ffd23f', padding: '16px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 34 }}>🔧</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '0.06em', color: '#000', lineHeight: 1 }}>SEVEN TOOLS</div>
            <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.60)', marginTop: 2 }}>7 Alat Pengendalian Kualitas Dasar</div>
          </div>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 40, color: '#000', lineHeight: 1 }}>{sevenTools.length}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {sevenTools.map((m, i) => {
            const c = NEO_SEVEN[i % NEO_SEVEN.length];
            const dim = c.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)';
            return (
              <Link key={m.id} href={`/materi/${m.id}`}
                className={`neo-card ${c.pat} animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, backgroundColor: c.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, background: c.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)', border: `2px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.30)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
                    {m.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 15, fontWeight: 700, color: c.fg }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={11} style={{ color: dim }} />
                      <span style={{ fontSize: 11, color: dim }}>{m.readTime} mnt baca</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: dim, flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 13, color: dim, lineHeight: 1.5, margin: 0 }}>{m.description}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', background: c.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)', color: c.fg, width: 'fit-content' }}>Seven Tools</div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <div className="neo-card pat-stripes-w" style={{ backgroundColor: '#2563eb', padding: '16px 22px', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 34 }}>📋</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '0.06em', color: '#fff', lineHeight: 1 }}>8 LANGKAH (8 STEPS)</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.70)', marginTop: 2 }}>Metode Penyelesaian Masalah Sistematis</div>
          </div>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 40, color: '#fff', lineHeight: 1 }}>{eightSteps.length}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {eightSteps.map((m, i) => {
            const c = NEO_EIGHT[i % NEO_EIGHT.length];
            const dim = c.fg === '#000' ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.70)';
            return (
              <Link key={m.id} href={`/materi/${m.id}`}
                className={`neo-card ${c.pat} animate-fade-up stagger-${Math.min(i + 1, 6)}`}
                style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', gap: 12, padding: 20, backgroundColor: c.bg }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 44, height: 44, flexShrink: 0, borderRadius: '50%', background: c.fg === '#000' ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.18)', border: `2px solid ${c.fg === '#000' ? 'rgba(0,0,0,0.22)' : 'rgba(255,255,255,0.30)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, color: c.fg }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: c.fg }}>{m.title}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                      <Clock size={11} style={{ color: dim }} />
                      <span style={{ fontSize: 11, color: dim }}>{m.readTime} mnt baca</span>
                    </div>
                  </div>
                  <ChevronRight size={16} style={{ color: dim, flexShrink: 0 }} />
                </div>
                <p style={{ fontSize: 13, color: dim, lineHeight: 1.5, margin: 0 }}>{m.description}</p>
                <div style={{ display: 'inline-flex', alignItems: 'center', padding: '3px 10px', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', background: c.fg === '#000' ? 'rgba(0,0,0,0.15)' : 'rgba(255,255,255,0.20)', color: c.fg, width: 'fit-content' }}>8 Steps</div>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="neo-card-lg pat-zigzag-w" style={{ marginTop: 32, padding: '24px 28px', backgroundColor: '#ec4899', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
        <BookOpen size={28} style={{ color: '#fff', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 22, letterSpacing: '0.04em', color: '#fff', lineHeight: 1 }}>SUDAH MEMBACA SEMUA MATERI?</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 }}>Uji pemahaman Anda dengan Quezee untuk mendapatkan poin!</div>
        </div>
        <Link href="/quezee" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 22px', background: '#000', border: '2px solid #000', color: '#ffd23f', fontWeight: 700, fontSize: 14, textDecoration: 'none', letterSpacing: '0.04em', boxShadow: '3px 3px 0 0 rgba(255,255,255,0.35)' }}>
          Mulai Quezee →
        </Link>
      </div>
    </AppShell>
  );
}
