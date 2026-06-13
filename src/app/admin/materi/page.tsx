'use client';
import { useState } from 'react';
import { Plus, Search, Edit2, Trash2 } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { MATERIALS } from '@/lib/mockData';

export default function AdminMateriPage() {
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | 'seven-tools' | '8-steps'>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = MATERIALS.filter(m =>
    (catFilter === 'all' || m.category === catFilter) &&
    (search === '' || m.title.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <AppShell title="Kelola Materi" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">KELOLA MATERI</div>
        <div className="page-subtitle">Tambah, edit, dan hapus materi pembelajaran</div>
      </div>

      {/* Toolbar */}
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
        <button className="btn btn-primary btn-sm" onClick={() => setShowForm(true)}>
          <Plus size={14} /> Tambah Materi
        </button>
      </div>

      {/* Add form */}
      {showForm && (
        <div className="card" style={{ marginBottom: 20, border: '1px solid rgba(5,150,105,0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <div className="section-title" style={{ backgroundColor: '#22c55e', color: '#000' }}>Tambah Materi Baru</div>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowForm(false)}>✕</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div><label className="form-label">Judul Materi</label><input className="input" placeholder="Contoh: Check Sheet" /></div>
            <div><label className="form-label">Kategori</label>
              <select className="input"><option>Seven Tools</option><option>8 Steps</option></select>
            </div>
            <div><label className="form-label">Ikon (emoji)</label><input className="input" placeholder="📋" /></div>
            <div><label className="form-label">Waktu Baca (menit)</label><input className="input" type="number" placeholder="10" /></div>
            <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Deskripsi Singkat</label><input className="input" placeholder="Deskripsi singkat materi..." /></div>
            <div style={{ gridColumn: '1 / -1' }}><label className="form-label">Konten (Markdown)</label>
              <textarea className="input" rows={5} placeholder="## Judul&#10;&#10;Isi konten materi..."></textarea>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 16, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setShowForm(false)}>Batal</button>
            <button className="btn btn-primary btn-sm" onClick={() => { alert('Demo: Materi berhasil disimpan!'); setShowForm(false); }}>Simpan Materi</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(MATERIALS.length), label: 'Total Materi', color: 'var(--blue)' },
          { value: String(MATERIALS.filter(m => m.category === 'seven-tools').length), label: 'Seven Tools', color: 'var(--amber)' },
          { value: String(MATERIALS.filter(m => m.category === '8-steps').length), label: '8 Steps', color: 'var(--indigo)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="section-title" style={{ marginBottom: 16, backgroundColor: '#f97316', color: '#000' }}>Daftar Materi ({filtered.length})</div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>Ikon</th><th>Judul</th><th>Kategori</th><th>Baca</th><th>Deskripsi</th><th>Aksi</th></tr>
            </thead>
            <tbody>
              {filtered.map(m => (
                <tr key={m.id}>
                  <td>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: `${m.color}15`, border: `1px solid ${m.color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{m.icon}</div>
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
                  <td style={{ maxWidth: 220 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {m.description}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px' }} onClick={() => alert(`Demo: Edit "${m.title}"`)}>
                        <Edit2 size={13} />
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ padding: '4px 8px', color: 'var(--red)' }} onClick={() => alert(`Demo: Hapus "${m.title}"`)}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppShell>
  );
}
