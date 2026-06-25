'use client';
import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Brain, ChevronRight } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Material {
  id: string; title: string; category: string;
  icon: string | null; description: string | null;
  readTime: number | null; color: string | null;
  fileUrl: string | null; fileType: string | null;
}

export default function MateriDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id }     = use(params);
  const router     = useRouter();
  const [material, setMaterial] = useState<Material | null>(null);
  const [allMats,  setAllMats]  = useState<Material[]>([]);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch('/api/materials').then(r => r.json()).then(d => { if (Array.isArray(d)) setAllMats(d); }).catch(() => {});
    fetch(`/api/materials/${id}`).then(r => {
      if (r.status === 404) { setNotFound(true); return null; }
      return r.json();
    }).then(d => { if (d) setMaterial(d); }).catch(() => {});
  }, [id]);

  if (notFound) return (
    <AppShell title="Materi">
      <div className="empty-state">
        <div style={{ fontSize: 40 }}>📚</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Materi tidak ditemukan</div>
        <Link href="/materi" className="btn btn-primary btn-sm">Kembali</Link>
      </div>
    </AppShell>
  );

  if (!material) return (
    <AppShell title="Materi">
      <div style={{ textAlign: 'center', padding: 48, color: 'var(--text-muted)' }}>Memuat materi...</div>
    </AppShell>
  );

  const matIndex = allMats.findIndex(m => m.id === id);
  const prev     = matIndex > 0 ? allMats[matIndex - 1] : null;
  const next     = matIndex < allMats.length - 1 ? allMats[matIndex + 1] : null;
  const accent   = material.color ?? '#4F8EF7';

  return (
    <AppShell title={material.title}>
      <div style={{ maxWidth: 760 }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Kembali
        </button>

        <div style={{ background: `linear-gradient(135deg, var(--bg-card) 0%, ${accent}10 100%)`, border: `1px solid ${accent}30`, borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `${accent}18`, border: `1px solid ${accent}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
              {material.icon}
            </div>
            <div>
              <div className={`badge badge-${material.category === 'seven-tools' ? 'amber' : 'blue'}`} style={{ marginBottom: 8 }}>
                {material.category === 'seven-tools' ? 'Seven Tools' : '8 Steps'}
              </div>
              <h1 style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 28, letterSpacing: '0.04em', color: 'var(--text-primary)', margin: 0, lineHeight: 1 }}>{material.title.toUpperCase()}</h1>
              <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '8px 0 0' }}>{material.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}><Clock size={13} /> {material.readTime} menit baca</div>
                {matIndex >= 0 && <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}><BookOpen size={13} /> Materi #{matIndex + 1}</div>}
              </div>
            </div>
          </div>
        </div>

        <div className="card" style={{ padding: material.fileUrl ? 0 : '28px 32px', marginBottom: 24, overflow: 'hidden' }}>
          {material.fileUrl ? (
            <iframe
              src={material.fileUrl}
              style={{ width: '100%', height: 600, border: 'none', display: 'block' }}
              title={material.title}
            />
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <div style={{ fontSize: 14 }}>Konten materi belum diupload oleh admin.</div>
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {prev && (
            <Link href={`/materi/${prev.id}`} className="card card-hover" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
              <ArrowLeft size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Sebelumnya</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{prev.title}</div>
              </div>
            </Link>
          )}
          {next && (
            <Link href={`/materi/${next.id}`} className="card card-hover" style={{ flex: 1, textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, textAlign: 'right' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 2 }}>Berikutnya</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{next.title}</div>
              </div>
              <ChevronRight size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            </Link>
          )}
        </div>

        <div style={{ padding: '20px 24px', background: 'var(--amber-glow)', border: '1px solid rgba(5,150,105,0.25)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <Brain size={22} style={{ color: 'var(--amber)', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Siap diuji?</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Kerjakan Quezee dan kumpulkan poin dari materi ini.</div>
          </div>
          <Link href="/quezee" className="btn btn-primary btn-sm">Mulai Quezee →</Link>
        </div>
      </div>
    </AppShell>
  );
}
