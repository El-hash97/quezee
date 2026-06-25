'use client';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, Upload, FileText } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface Material {
  id: string; title: string; category: string;
  icon: string | null; description: string | null;
  readTime: number | null; color: string | null;
  fileUrl: string | null; fileType: string | null;
}

const emptyForm = { id: '', title: '', category: 'seven-tools', icon: '', description: '', readTime: '', color: '#4F8EF7' };

export default function AdminMateriPage() {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'seven-tools' | '8-steps'>('all');
  const [showForm,  setShowForm]  = useState(false);
  const [editId,    setEditId]    = useState<string | null>(null);
  const [form,      setForm]      = useState(emptyForm);
  const [file,      setFile]      = useState<File | null>(null);
  const [saving,    setSaving]    = useState(false);

  const load = () => {
    setLoading(true);
    fetch('/api/admin/materials')
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setMaterials(d); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const filtered = materials.filter(m =>
    (catFilter === 'all' || m.category === catFilter) &&
    (search === '' || m.title.toLowerCase().includes(search.toLowerCase()))
  );

  const resetForm = () => { setForm(emptyForm); setFile(null); setEditId(null); setShowForm(false); };

  const handleSubmit = async () => {
    if (!form.title || !form.category || (!editId && !form.id)) {
      alert('ID, judul, dan kategori wajib diisi'); return;
    }
    setSaving(true);
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append('file', file);
    const url    = editId ? `/api/admin/materials/${editId}` : '/api/admin/materials';
    const method = editId ? 'PUT' : 'POST';
    const res  = await fetch(url, { method, body: fd });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { alert(data.error ?? 'Gagal menyimpan'); return; }
    resetForm(); load();
  };

  const handleEdit = (m: Material) => {
    setForm({ id: m.id, title: m.title, category: m.category, icon: m.icon ?? '', description: m.description ?? '', readTime: String(m.readTime ?? ''), color: m.color ?? '#4F8EF7' });
    setEditId(m.id); setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Hapus materi "${title}"? File terkait juga akan dihapus.`)) return;
    const res = await fetch(`/api/admin/materials/${id}`, { method: 'DELETE' });
    if (!res.ok) { alert('Gagal menghapus'); return; }
    load();
  };

  return (
    <AppShell title="Kelola Materi" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">KELOLA MATERI</div>
        <div className="page-subtitle">Tambah, edit, dan hapus materi pembelajaran</div>
      </div>

      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari judul materi..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {(['all', 'seven-tools', '8-steps'] as const).map(c => (
            <button key={c} className={`chip${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>
              {c === 'all' ? 'Semua' : c === 'seven-tools' ? 'Seven Tools' : '8 Steps'}
            </button>
          ))}
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus size={14} /> Tambah Materi
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(5,150,105,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ backgroundColor: '#22c55e', color: '#000' }}>
              {editId ? 'Edit Materi' : 'Tambah Materi Baru'}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={resetForm}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {!editId && (
              <div>
                <label className="form-label">ID (slug, contoh: check-sheet)</label>
                <input className="input" placeholder="check-sheet" value={form.id}
                  onChange={e => setForm(f => ({ ...f, id: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} />
              </div>
            )}
            <div>
              <label className="form-label">Judul Materi</label>
              <input className="input" placeholder="Check Sheet" value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Kategori</label>
              <select className="input" value={form.category}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                <option value="seven-tools">Seven Tools</option>
                <option value="8-steps">8 Steps</option>
              </select>
            </div>
            <div>
              <label className="form-label">Ikon (emoji)</label>
              <input className="input" placeholder="📋" value={form.icon}
                onChange={e => setForm(f => ({ ...f, icon: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Waktu Baca (menit)</label>
              <input className="input" type="number" placeholder="10" value={form.readTime}
                onChange={e => setForm(f => ({ ...f, readTime: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Deskripsi Singkat</label>
              <input className="input" placeholder="Deskripsi singkat materi..." value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label className="form-label">Upload File (PDF / DOCX) — maks. 10 MB</label>
              <div style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Upload size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  {file ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <FileText size={13} style={{ color: 'var(--green)' }} />
                      <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{file.name}</span>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '2px 6px' }} onClick={() => setFile(null)}>✕</button>
                    </div>
                  ) : (
                    <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Pilih file PDF atau DOCX...</span>
                  )}
                </div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  Browse
                  <input type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                    onChange={e => setFile(e.target.files?.[0] ?? null)} />
                </label>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={resetForm}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={saving}>
              {saving ? 'Menyimpan...' : (editId ? 'Update Materi' : 'Simpan Materi')}
            </button>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(materials.length), label: 'Total Materi', color: 'var(--blue)' },
          { value: String(materials.filter(m => m.category === 'seven-tools').length), label: 'Seven Tools', color: 'var(--amber)' },
          { value: String(materials.filter(m => m.category === '8-steps').length), label: '8 Steps', color: 'var(--indigo)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-title" style={{ marginBottom: 16, backgroundColor: '#f97316', color: '#000' }}>
          Daftar Materi ({filtered.length})
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 32, color: 'var(--text-muted)' }}>Memuat data...</div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr><th>Ikon</th><th>Judul</th><th>Kategori</th><th>Baca</th><th>File</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 24 }}>Tidak ada materi</td></tr>
                )}
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: `${m.color ?? '#4F8EF7'}15`, border: `1px solid ${m.color ?? '#4F8EF7'}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                        {m.icon}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{m.title}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.id}</div>
                    </td>
                    <td>
                      <span className={`badge ${m.category === 'seven-tools' ? 'badge-amber' : 'badge-blue'}`}>
                        {m.category === 'seven-tools' ? 'Seven Tools' : '8 Steps'}
                      </span>
                    </td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{m.readTime} mnt</span></td>
                    <td>
                      {m.fileUrl ? (
                        <a href={m.fileUrl} target="_blank" rel="noreferrer">
                          <span className="badge badge-green" style={{ fontSize: 10, cursor: 'pointer' }}>
                            {(m.fileType ?? 'FILE').toUpperCase()} ↗
                          </span>
                        </a>
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => handleEdit(m)}><Edit2 size={13} /></button>
                        <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--red)' }} onClick={() => handleDelete(m.id, m.title)}><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
