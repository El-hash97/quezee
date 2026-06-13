'use client';
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { QUESTIONS, MATERIALS } from '@/lib/mockData';

const KEYS = ['A', 'B', 'C', 'D'];

export default function AdminSoalPage() {
  const [search, setSearch] = useState('');
  const [matFilter, setMatFilter] = useState('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);

  const materialMap = Object.fromEntries(MATERIALS.map(m => [m.id, m.title]));

  const filtered = QUESTIONS.filter(q =>
    (matFilter === 'all' || q.materialId === matFilter) &&
    (search === '' || q.question.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell title="Bank Soal" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">BANK SOAL</div>
        <div className="page-subtitle">Kelola pertanyaan kuis — {QUESTIONS.length} soal tersedia</div>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari soal..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ maxWidth: 200 }} value={matFilter} onChange={e => setMatFilter(e.target.value)}>
          <option value="all">Semua Materi</option>
          {MATERIALS.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Tambah Soal
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(5,150,105,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ backgroundColor: '#8b5cf6', color: '#fff' }}>Tambah Soal Baru</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div><label className="form-label">Materi Terkait</label>
              <select className="input">
                <option value="">Pilih materi...</option>
                {MATERIALS.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div><label className="form-label">Pertanyaan</label><textarea className="input" rows={2} placeholder="Tulis pertanyaan..." /></div>
            {KEYS.map(k => (
              <div key={k}><label className="form-label">Pilihan {k}</label><input className="input" placeholder={`Jawaban pilihan ${k}...`} /></div>
            ))}
            <div><label className="form-label">Jawaban Benar</label>
              <select className="input">{KEYS.map(k => <option key={k}>{k}</option>)}</select>
            </div>
            <div><label className="form-label">Penjelasan</label><textarea className="input" rows={2} placeholder="Penjelasan jawaban benar..." /></div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={() => { alert('Demo: Soal berhasil disimpan!'); setShowForm(false); }}>Simpan Soal</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(QUESTIONS.length), label: 'Total Soal', color: 'var(--blue)' },
          { value: String(QUESTIONS.filter(q => !q.materialId.startsWith('langkah')).length), label: 'Seven Tools', color: 'var(--amber)' },
          { value: String(QUESTIONS.filter(q => q.materialId.startsWith('langkah')).length), label: '8 Steps', color: 'var(--indigo)' },
          { value: String(filtered.length), label: 'Ditampilkan', color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Question list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(q => (
          <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
              onClick={() => setExpanded(e => e === q.id ? null : q.id)}>
              <span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, color: 'var(--amber)', minWidth: 32, lineHeight: 1.2 }}>#{q.id}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>{q.question}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>Materi: {materialMap[q.materialId] || q.materialId}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span className="badge badge-green" style={{ fontSize: 10 }}>Jawaban: {KEYS[q.correctIndex]}</span>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }}
                  onClick={e => { e.stopPropagation(); alert(`Demo: Edit soal #${q.id}`); }}><Edit2 size={12} /></button>
                <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', color: 'var(--red)' }}
                  onClick={e => { e.stopPropagation(); alert(`Demo: Hapus soal #${q.id}`); }}><Trash2 size={12} /></button>
                {expanded === q.id ? <ChevronUp size={14} style={{ color: 'var(--text-muted)' }} /> : <ChevronDown size={14} style={{ color: 'var(--text-muted)' }} />}
              </div>
            </div>

            {expanded === q.id && (
              <div style={{ borderTop: '1px solid var(--border-dim)', padding: '14px 16px', background: 'var(--bg-elevated)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
                  {q.options.map((opt, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ width: 22, height: 22, borderRadius: 6, background: i === q.correctIndex ? 'var(--green-dim)' : 'var(--bg-card)', border: `1px solid ${i === q.correctIndex ? 'var(--green)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: i === q.correctIndex ? 'var(--green)' : 'var(--text-muted)', flexShrink: 0 }}>
                        {KEYS[i]}
                      </span>
                      <span style={{ fontSize: 13, color: i === q.correctIndex ? 'var(--text-primary)' : 'var(--text-secondary)', lineHeight: 1.5 }}>{opt}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-secondary)' }}>
                  <strong style={{ color: 'var(--green)' }}>Penjelasan:</strong> {q.explanation}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
