'use client';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Brain, ChevronRight } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { MATERIALS } from '@/lib/mockData';

function renderContent(text: string) {
  return text.split('\n').map((line, i) => {
    if (line.startsWith('## '))   return <h2 key={i} style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 22, letterSpacing: '0.04em', color: 'var(--text-primary)', margin: '24px 0 12px', lineHeight: 1 }}>{line.slice(3)}</h2>;
    if (line.startsWith('### '))  return <h3 key={i} style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', margin: '20px 0 8px' }}>{line.slice(4)}</h3>;
    if (line.startsWith('#### ')) return <h4 key={i} style={{ fontSize: 14, fontWeight: 700, color: 'var(--amber)', margin: '16px 0 6px' }}>{line.slice(5)}</h4>;
    if (line.startsWith('- '))    return <li key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginLeft: 20, marginBottom: 4 }} dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />;
    if (/^\d+\./.test(line))      return <li key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, marginLeft: 20, marginBottom: 4, listStyleType: 'decimal' }} dangerouslySetInnerHTML={{ __html: line.replace(/^\d+\.\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>') }} />;
    if (line.trim() === '')        return <div key={i} style={{ height: 8 }} />;
    return <p key={i} style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.7, margin: '4px 0' }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*(.*?)\*\*/g, '<strong style="color:var(--text-primary)">$1</strong>').replace(/\*(.*?)\*/g, '<em>$1</em>') }} />;
  });
}

export default function MateriDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const material = MATERIALS.find(m => m.id === id);
  const matIndex = MATERIALS.findIndex(m => m.id === id);
  const prev = matIndex > 0 ? MATERIALS[matIndex - 1] : null;
  const next = matIndex < MATERIALS.length - 1 ? MATERIALS[matIndex + 1] : null;

  if (!material) return (
    <AppShell title="Materi">
      <div className="empty-state">
        <div style={{ fontSize: 40 }}>📚</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Materi tidak ditemukan</div>
        <Link href="/materi" className="btn btn-primary btn-sm">← Kembali</Link>
      </div>
    </AppShell>
  );

  return (
    <AppShell title={material.title}>
      <div style={{ maxWidth: 760 }}>
        <button onClick={() => router.back()} className="btn btn-ghost btn-sm" style={{ marginBottom: 20 }}>
          <ArrowLeft size={14} /> Kembali
        </button>

        {/* Header */}
        <div style={{ background: `linear-gradient(135deg, var(--bg-card) 0%, ${material.color}10 100%)`, border: `1px solid ${material.color}30`, borderRadius: 'var(--radius-xl)', padding: '28px 32px', marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
            <div style={{ width: 64, height: 64, borderRadius: 16, background: `${material.color}18`, border: `1px solid ${material.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, flexShrink: 0 }}>
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--text-muted)', fontSize: 13 }}><BookOpen size={13} /> Materi #{matIndex + 1}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="card" style={{ padding: '28px 32px', marginBottom: 24 }}>
          {renderContent(material.content)}
        </div>

        {/* Prev / Next */}
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

        {/* CTA */}
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
