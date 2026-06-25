'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Upload, Download } from 'lucide-react';
import AppShell from '@/components/AppShell';

const KEYS = ['A', 'B', 'C', 'D'];

interface Question {
  id: number; materialId: string | null;
  question: string; options: string[];
  correctIndex: number; explanation: string | null;
}
interface Material { id: string; title: string; }

const emptyForm = { materialId: '', question: '', options: ['', '', '', ''] as string[], correctIndex: 0, explanation: '' };

export default function AdminSoalPage() {
  const [questions,  setQuestions]  = useState<Question[]>([]);
  const [materials,  setMaterials]  = useState<Material[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [matFilter,  setMatFilter]  = useState('all');
  const [expanded,   setExpanded]   = useState<number | null>(null);
  const [showForm,   setShowForm]   = useState(false);
  const [editId,     setEditId]     = useState<number | null>(null);
  const [form,       setForm]       = useState(emptyForm);
  const [saving,     setSaving]     = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [csvFile,    setCsvFile]    = useState<File | null>(null);
  const [importing,  setImporting]  = useState(false);
  const [importMsg,  setImportMsg]  = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const load = () => {
    setLoading(true);
    Promise.all([
      fetch('/api/admin/questions').then(r => r.json()),
      fetch('/api/admin/materials').then(r => r.json()),
    ]).then(([q, m]) => {
      if (Array.isArray(q)) setQuestions(q);
      if (Array.isArray(m)) setMaterials(m);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const materialMap = Object.fromEntries(materials.map(m => [m.id, m.title]));
  const filtered    = questions.filter(q =>
    (matFilter === 'all' || q.materialId === matFilter) &&
    (search === '' || q.question.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => { setForm(emptyForm); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.question) { alert('Pertanyaan wajib diisi'); return; }
    if (form.options.some(o => !o.trim())) { alert('Semua pilihan jawaban harus diisi'); return; }
    setSaving(true);
    const body   = { ...form, materialId: form.materialId || null, explanation: form.explanation || null };
    const url    = editId ? `/api/admin/questions/${editId}` : '/api/admin/questions';
    const method = editId ? 'PUT' : 'POST';
    const res  = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { alert(data.error ?? 'Gagal menyimpan'); return; }
    resetForm(); load();
  };

  const handleEdit = (q: Question) => {
    setForm({ materialId: q.materialId ?? '', question: q.question, options: [...q.options], correctIndex: q.correctIndex, explanation: q.explanation ?? '' });
    setEditId(q.id); setShowForm(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm(`Hapus soal #${id}?`)) return;
    const res = await fetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Gagal menghapus soal'); return; }
    load();
  };

  const handleImport = async () => {
    if (!csvFile) { alert('Pilih file CSV terlebih dahulu'); return; }
    setImporting(true); setImportMsg(null);
    const fd = new FormData(); fd.append('file', csvFile);
    const res  = await fetch('/api/admin/questions/import', { method: 'POST', body: fd });
    const data = await res.json();
    setImporting(false);
    if (!res.ok) { setImportMsg({ type: 'error', text: data.error ?? 'Gagal import' }); return; }
    setImportMsg({ type: 'success', text: `Berhasil import ${data.inserted} soal.${data.errors?.length ? ` ${data.errors.length} baris dilewati.` : ''}` });
    setCsvFile(null); load();
  };

  const setOption = (i: number, val: string) =>
    setForm(f => { const opts = [...f.options]; opts[i] = val; return { ...f, options: opts }; });

  return (
    <AppShell title="Bank Soal" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">BANK SOAL</div>
        <div className="page-subtitle">Kelola pertanyaan kuis — {questions.length} soal tersedia</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari soal..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ maxWidth: 200 }} value={matFilter} onChange={e => setMatFilter(e.target.value)}>
          <option value="all">Semua Materi</option>
          {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
        </select>
        <a href="/template-soal.csv" download className="btn btn-secondary btn-sm">
          <Download size={14} /> Template CSV
        </a>
        <button className="btn btn-secondary btn-sm" onClick={() => { setShowImport(s => !s); setImportMsg(null); }}>
          <Upload size={14} /> Import CSV
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={14} /> Tambah Soal
        </button>
      </div>

      {showImport && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(99,102,241,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div className="section-title" style={{ backgroundColor: '#6366f1', color: '#fff' }}>Import Soal via CSV</div>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowImport(false); setImportMsg(null); setCsvFile(null); }}>✕</button>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 12 }}>
            Format: material_id, question, option_a, option_b, option_c, option_d, correct_index (0-3), explanation. Maks. 500 baris.
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
              {csvFile ? csvFile.name : 'Pilih file CSV'}
              <input type="file" accept=".csv" style={{ display: 'none' }}
                onChange={e => { setCsvFile(e.target.files?.[0] ?? null); setImportMsg(null); }} />
            </label>
            {csvFile && (
              <button className="btn btn-primary btn-sm" onClick={handleImport} disabled={importing}>
                {importing ? 'Mengimport...' : `Import ${csvFile.name}`}
              </button>
            )}
          </div>
          {importMsg && (
            <div className={`alert ${importMsg.type === 'success' ? 'alert-success' : 'alert-error'}`} style={{ marginTop: 12 }}>
              {importMsg.text}
            </div>
          )}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(5,150,105,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ backgroundColor: '#8b5cf6', color: '#fff' }}>
              {editId ? `Edit Soal #${editId}` : 'Tambah Soal Baru'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>✕</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label className="form-label">Materi Terkait</label>
              <select className="input" value={form.materialId}
                onChange={e => setForm(f => ({ ...f, materialId: e.target.value }))}>
                <option value="">— Pilih materi (opsional) —</option>
                {materials.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Pertanyaan</label>
              <textarea className="input" rows={3} placeholder="Tulis pertanyaan..."
                value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} />
            </div>
            {KEYS.map((k, i) => (
              <div key={k}>
                <label className="form-label">Pilihan {k}</label>
                <input className="input" placeholder={`Jawaban pilihan ${k}...`}
                  value={form.options[i]} onChange={e => setOption(i, e.target.value)} />
              </div>
            ))}
            <div>
              <label className="form-label">Jawaban Benar</label>
              <select className="input" value={form.correctIndex}
                onChange={e => setForm(f => ({ ...f, correctIndex: parseInt(e.target.value) }))}>
                {KEYS.map((k, i) => <option key={k} value={i}>Pilihan {k}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Penjelasan</label>
              <textarea className="input" rows={2} placeholder="Penjelasan jawaban benar..."
                value={form.explanation} onChange={e => setForm(f => ({ ...f, explanation: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Menyimpan...' : (editId ? 'Update Soal' : 'Simpan Soal')}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(questions.length), label: 'Total Soal', color: 'var(--blue)' },
          { value: String(questions.filter(q => q.materialId && !q.materialId.startsWith('langkah')).length), label: 'Seven Tools', color: 'var(--amber)' },
          { value: String(questions.filter(q => q.materialId?.startsWith('langkah')).length), label: '8 Steps', color: 'var(--indigo)' },
          { value: String(filtered.length), label: 'Ditampilkan', color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Memuat data...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Tidak ada soal</div>
          )}
          {filtered.map(q => (
            <div key={q.id} className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '14px 16px', cursor: 'pointer' }}
                onClick={() => setExpanded(e => e === q.id ? null : q.id)}>
                <span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, color: 'var(--amber)', minWidth: 36, lineHeight: 1.2 }}>#{q.id}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5, fontWeight: 500 }}>{q.question}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    Materi: {q.materialId ? (materialMap[q.materialId] ?? q.materialId) : '—'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  <span className="badge badge-green" style={{ fontSize: 10 }}>Jawaban: {KEYS[q.correctIndex]}</span>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px' }}
                    onClick={e => { e.stopPropagation(); handleEdit(q); }}><Edit2 size={12} /></button>
                  <button className="btn btn-ghost btn-sm" style={{ padding: '4px 6px', color: 'var(--red)' }}
                    onClick={e => { e.stopPropagation(); handleDelete(q.id); }}><Trash2 size={12} /></button>
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
                  {q.explanation && (
                    <div style={{ padding: '10px 12px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 'var(--radius)', fontSize: 12, color: 'var(--text-secondary)' }}>
                      <strong style={{ color: 'var(--green)' }}>Penjelasan:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AppShell>
  );
}
