'use client';
import { useState, useEffect } from 'react';
import { Search, Download, Users, Pencil, X, Check, AlertCircle, RotateCcw, AlertTriangle, UserPlus } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { getLevel, LINES, SHIFTS } from '@/lib/mockData';

const BADGES = ['', '🌱', '⭐', '🔥', '💎', '🏆', '👑'];

interface UserRow {
  noreg: string; name: string; line: string; division: string;
  role: string; totalPoints: number; attempts: number;
}

function exportCSV(rows: UserRow[]) {
  const header = ['No.Reg', 'Nama', 'Line', 'Shift', 'Level', 'Total Poin', 'Percobaan'];
  const body = rows.map(u => {
    const lvl = getLevel(u.totalPoints);
    return [u.noreg, u.name, u.line, u.division, `Lv.${lvl.level} ${lvl.label}`, u.totalPoints, u.attempts].join(',');
  });
  const csv = [header.join(','), ...body].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'qcc_peserta.csv'; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [search, setSearch] = useState('');
  const [lineFilter, setLineFilter] = useState('Semua Line');
  const [divFilter, setDivFilter] = useState('Semua Shift');

  /* ── Edit modal state ── */
  const [editing, setEditing] = useState<UserRow | null>(null);
  const [editName, setEditName] = useState('');
  const [editLine, setEditLine] = useState('');
  const [editShift, setEditShift] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveOk, setSaveOk] = useState(false);

  /* ── Add user modal state ── */
  const [addOpen, setAddOpen] = useState(false);
  const [addNoreg, setAddNoreg] = useState('');
  const [addName, setAddName] = useState('');
  const [addLine, setAddLine] = useState('');
  const [addShift, setAddShift] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');
  const [addOk, setAddOk] = useState(false);

  /* ── Reset per-user modal state ── */
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [resetting, setResetting] = useState(false);
  const [resetError, setResetError] = useState('');

  /* ── Reset all modal state ── */
  const [resetAllOpen, setResetAllOpen] = useState(false);
  const [resetAllConfirm, setResetAllConfirm] = useState('');
  const [resettingAll, setResettingAll] = useState(false);
  const [resetAllError, setResetAllError] = useState('');

  useEffect(() => {
    fetch('/api/admin/users', { cache: 'no-store' })
      .then(r => r.json())
      .then(d => { if (Array.isArray(d)) setUsers(d); })
      .catch(() => {});
  }, []);

  const filtered = users
    .filter(u => lineFilter === 'Semua Line' || u.line === lineFilter)
    .filter(u => divFilter === 'Semua Shift' || u.division === divFilter)
    .filter(u => search === '' ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.noreg.includes(search))
    .sort((a, b) => b.totalPoints - a.totalPoints);

  function openEdit(u: UserRow) {
    setEditing(u);
    setEditName(u.name);
    setEditLine(u.line || LINES[1]);
    setEditShift(u.division || SHIFTS[1]);
    setSaveError('');
    setSaveOk(false);
  }

  function closeEdit() { setEditing(null); setSaveError(''); setSaveOk(false); }

  function openAdd() {
    setAddNoreg(''); setAddName(''); setAddLine(LINES[1] || ''); setAddShift(SHIFTS[1] || '');
    setAddError(''); setAddOk(false); setAddOpen(true);
  }
  function closeAdd() { setAddOpen(false); setAddError(''); setAddOk(false); }

  function openReset(u: UserRow) { setResetTarget(u); setResetError(''); }
  function closeReset() { setResetTarget(null); setResetError(''); }

  function openResetAll() { setResetAllOpen(true); setResetAllConfirm(''); setResetAllError(''); }
  function closeResetAll() { setResetAllOpen(false); setResetAllConfirm(''); setResetAllError(''); }

  async function refetch() {
    const res = await fetch('/api/admin/users', { cache: 'no-store' });
    const d = await res.json();
    if (Array.isArray(d)) setUsers(d);
  }

  async function handleAddUser() {
    setAdding(true); setAddError(''); setAddOk(false);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noreg: addNoreg, name: addName, line: addLine, division: addShift }),
      });
      const data = await res.json();
      if (!res.ok) { setAddError(`[${res.status}] ${data.error ?? 'Gagal menambah.'}`); return; }
      setAddOk(true);
      await refetch();
      setTimeout(closeAdd, 1000);
    } catch (e) {
      setAddError(`Error: ${e instanceof Error ? e.message : 'Kesalahan jaringan.'}`);
    } finally {
      setAdding(false);
    }
  }

  async function handleSave() {
    if (!editing) return;
    setSaving(true); setSaveError(''); setSaveOk(false);
    try {
      const res = await fetch(`/api/admin/users/${editing.noreg}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: editName, line: editLine, division: editShift }),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(`[${res.status}] ${data.error ?? 'Gagal menyimpan.'}`); return; }
      setUsers(prev => prev.map(u =>
        u.noreg === editing.noreg
          ? { ...u, name: data.saved?.name ?? editName, line: data.saved?.line ?? editLine, division: data.saved?.division ?? editShift }
          : u
      ));
      setLineFilter('Semua Line');
      setDivFilter('Semua Shift');
      refetch().catch(() => {});
      setSaveOk(true);
      setTimeout(closeEdit, 900);
    } catch (e) {
      setSaveError(`Error: ${e instanceof Error ? e.message : 'Kesalahan jaringan.'}`);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    if (!resetTarget) return;
    setResetting(true); setResetError('');
    try {
      const res = await fetch(`/api/admin/users/${resetTarget.noreg}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) { setResetError(`[${res.status}] ${data.error ?? 'Gagal reset.'}`); return; }
      setUsers(prev => prev.map(u =>
        u.noreg === resetTarget.noreg ? { ...u, totalPoints: 0, attempts: 0 } : u
      ));
      refetch().catch(() => {});
      closeReset();
    } catch (e) {
      setResetError(`Error: ${e instanceof Error ? e.message : 'Kesalahan jaringan.'}`);
    } finally {
      setResetting(false);
    }
  }

  async function handleResetAll() {
    if (resetAllConfirm !== 'RESET') return;
    setResettingAll(true); setResetAllError('');
    try {
      const res = await fetch('/api/admin/users/reset', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) { setResetAllError(`[${res.status}] ${data.error ?? 'Gagal reset.'}`); return; }
      setUsers(prev => prev.map(u => ({ ...u, totalPoints: 0, attempts: 0 })));
      refetch().catch(() => {});
      closeResetAll();
    } catch (e) {
      setResetAllError(`Error: ${e instanceof Error ? e.message : 'Kesalahan jaringan.'}`);
    } finally {
      setResettingAll(false);
    }
  }

  return (
    <AppShell title="Pengguna" isAdmin>
      <div style={{ marginBottom: 24 }}>
        <div className="page-title">MANAJEMEN PENGGUNA</div>
        <div className="page-subtitle">Daftar peserta terdaftar dan data performa</div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { value: String(users.length), label: 'Total Peserta', color: 'var(--blue)' },
          { value: String(new Set(users.map(u => u.line).filter(Boolean)).size), label: 'Line Aktif', color: 'var(--amber)' },
          { value: String(new Set(users.map(u => u.division).filter(Boolean)).size), label: 'Shift', color: 'var(--indigo)' },
          { value: users.length ? String(Math.round(users.reduce((s, u) => s + u.totalPoints, 0) / users.length)) : '0', label: 'Rata-rata Poin', color: 'var(--green)' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{ padding: '12px 16px' }}>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value" style={{ color: s.color, fontSize: 28 }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Cari nama atau No.Reg..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="input" style={{ maxWidth: 140 }} value={lineFilter} onChange={e => setLineFilter(e.target.value)}>
          {LINES.map(l => <option key={l}>{l}</option>)}
        </select>
        <select className="input" style={{ maxWidth: 160 }} value={divFilter} onChange={e => setDivFilter(e.target.value)}>
          {SHIFTS.map(d => <option key={d}>{d}</option>)}
        </select>
        <button className="btn btn-primary btn-sm" onClick={openAdd}
          style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--green)', color: '#000', border: '2px solid #000', boxShadow: '3px 3px 0 0 #000', fontWeight: 700 }}>
          <UserPlus size={14} /> Tambah Peserta
        </button>
        <button className="btn btn-primary btn-sm" onClick={() => exportCSV(filtered)}>
          <Download size={14} /> Export CSV ({filtered.length})
        </button>
        <button
          className="btn btn-sm"
          onClick={openResetAll}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: '#ef4444', color: '#fff',
            border: '2px solid #000', boxShadow: '3px 3px 0 0 #000',
            fontWeight: 700, fontSize: 12, padding: '6px 14px', cursor: 'pointer',
          }}
        >
          <RotateCcw size={13} /> Reset Semua Poin
        </button>
      </div>

      {/* Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <Users size={16} style={{ color: 'var(--text-muted)' }} />
          <div className="section-title" style={{ backgroundColor: '#14b8a6', color: '#000' }}>Daftar Peserta ({filtered.length})</div>
        </div>
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr><th>#</th><th>Peserta</th><th>Line</th><th>Shift</th><th>Level</th><th>Total Poin</th><th>Percobaan</th><th></th></tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const lvl = getLevel(u.totalPoints);
                return (
                  <tr key={u.noreg}>
                    <td><span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 16, color: 'var(--text-muted)' }}>{i + 1}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: 'var(--text-muted)', flexShrink: 0 }}>
                          {u.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.noreg.padStart(7, '0')}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge badge-muted">{u.line || '-'}</span></td>
                    <td><span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.division || '-'}</span></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ fontSize: 16 }}>{BADGES[lvl.level]}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>Lv.{lvl.level}</div>
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{lvl.label}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 18, color: 'var(--amber)' }}>{u.totalPoints}</span></td>
                    <td><span style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.attempts}x</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button
                          onClick={() => openEdit(u)}
                          className="btn btn-ghost btn-sm"
                          style={{ padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4 }}
                          title="Edit line & shift"
                        >
                          <Pencil size={13} /> <span style={{ fontSize: 11 }}>Edit</span>
                        </button>
                        <button
                          onClick={() => openReset(u)}
                          className="btn btn-sm"
                          style={{
                            padding: '4px 8px', display: 'flex', alignItems: 'center', gap: 4,
                            background: 'transparent', border: '1.5px solid var(--red)',
                            color: 'var(--red)', cursor: 'pointer', fontSize: 11, fontWeight: 600,
                          }}
                          title="Reset poin pengguna"
                        >
                          <RotateCcw size={12} /> Reset
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Modal ── */}
      {editing && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={closeEdit}>
          <div className="neo-card pat-grid"
            style={{ backgroundColor: '#1a1a2e', width: '100%', maxWidth: 420, padding: 28, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>EDIT PESERTA</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {editing.name} · <span style={{ color: 'var(--amber)' }}>{editing.noreg.padStart(7, '0')}</span>
                </div>
              </div>
              <button onClick={closeEdit} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
              <div style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Line Saat Ini</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{editing.line || '-'}</div>
              </div>
              <div style={{ flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '8px 12px' }}>
                <div style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 2 }}>Shift Saat Ini</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{editing.division || '-'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">Nama</label>
                <input className="input" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Nama peserta..." />
              </div>
              <div className="input-group">
                <label className="input-label">Line Baru</label>
                <select className="input" value={editLine} onChange={e => setEditLine(e.target.value)}>
                  {LINES.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Shift Baru</label>
                <select className="input" value={editShift} onChange={e => setEditShift(e.target.value)}>
                  {SHIFTS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {saveError && (
                <div className="alert alert-error"><AlertCircle size={14} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12 }}>{saveError}</span></div>
              )}
              {saveOk && (
                <div className="alert alert-success"><Check size={14} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12 }}>Tersimpan!</span></div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={closeEdit}>Batal</button>
                <button type="button" className="btn btn-primary btn-lg" style={{ flex: 2 }} disabled={saving || (!editLine || !editShift || !editName.trim())} onClick={handleSave}>
                  {saving ? 'Menyimpan...' : <><Check size={15} /> Simpan Perubahan</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset Per-User Modal ── */}
      {resetTarget && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={closeReset}>
          <div className="neo-card pat-dots-w"
            style={{ backgroundColor: '#1a1a2e', width: '100%', maxWidth: 400, padding: 28, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: '#ef4444', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <RotateCcw size={18} color="#fff" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>RESET POIN</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Tindakan ini tidak dapat dibatalkan</div>
                </div>
              </div>
              <button onClick={closeReset} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 16px', marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{resetTarget.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                {resetTarget.noreg.padStart(7, '0')} · {resetTarget.line} · {resetTarget.division}
              </div>
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Total Poin</div>
                  <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 22, color: 'var(--amber)' }}>{resetTarget.totalPoints}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Percobaan</div>
                  <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 22, color: 'var(--text-secondary)' }}>{resetTarget.attempts}x</div>
                </div>
              </div>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.35)', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 12, color: '#fca5a5', lineHeight: 1.5 }}>
              Semua riwayat kuis pengguna ini akan dihapus permanen. Poin akan kembali ke 0.
            </div>

            {resetError && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}><AlertCircle size={14} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12 }}>{resetError}</span></div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={closeReset}>Batal</button>
              <button
                type="button"
                disabled={resetting}
                onClick={handleReset}
                style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px', background: resetting ? '#555' : '#ef4444',
                  border: '2px solid #000', boxShadow: '3px 3px 0 0 #000',
                  color: '#fff', fontWeight: 700, fontSize: 14, cursor: resetting ? 'not-allowed' : 'pointer',
                }}
              >
                <RotateCcw size={15} /> {resetting ? 'Mereset...' : 'Ya, Reset Poin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Add User Modal ── */}
      {addOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.72)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={closeAdd}>
          <div className="neo-card pat-grid"
            style={{ backgroundColor: '#1a1a2e', width: '100%', maxWidth: 420, padding: 28, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, background: 'var(--green)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UserPlus size={18} color="#000" />
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 20, letterSpacing: '0.06em', color: 'var(--text-primary)' }}>TAMBAH PESERTA</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>Daftarkan peserta baru</div>
                </div>
              </div>
              <button onClick={closeAdd} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="input-group">
                <label className="input-label">No. Registrasi <span style={{ color: 'var(--red)' }}>*</span></label>
                <input className="input" value={addNoreg} onChange={e => setAddNoreg(e.target.value)} placeholder="Contoh: 0012345" maxLength={7} />
              </div>
              <div className="input-group">
                <label className="input-label">Nama Lengkap <span style={{ color: 'var(--red)' }}>*</span></label>
                <input className="input" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Nama peserta..." />
              </div>
              <div className="input-group">
                <label className="input-label">Line</label>
                <select className="input" value={addLine} onChange={e => setAddLine(e.target.value)}>
                  <option value="">-- Pilih Line --</option>
                  {LINES.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Shift</label>
                <select className="input" value={addShift} onChange={e => setAddShift(e.target.value)}>
                  <option value="">-- Pilih Shift --</option>
                  {SHIFTS.slice(1).map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {addError && (
                <div className="alert alert-error"><AlertCircle size={14} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12 }}>{addError}</span></div>
              )}
              {addOk && (
                <div className="alert alert-success"><Check size={14} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12 }}>Peserta berhasil ditambahkan!</span></div>
              )}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={closeAdd}>Batal</button>
                <button
                  type="button"
                  className="btn btn-lg"
                  style={{ flex: 2, background: 'var(--green)', color: '#000', border: '2px solid #000', boxShadow: '3px 3px 0 0 #000', fontWeight: 700 }}
                  disabled={adding || !addNoreg.trim() || !addName.trim()}
                  onClick={handleAddUser}
                >
                  {adding ? 'Menyimpan...' : <><UserPlus size={15} /> Tambah Peserta</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Reset All Modal ── */}
      {resetAllOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          background: 'rgba(0,0,0,0.80)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }} onClick={closeResetAll}>
          <div className="neo-card pat-stripes"
            style={{ backgroundColor: '#1a0a0a', width: '100%', maxWidth: 420, padding: 28, position: 'relative' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 40, height: 40, background: '#ef4444', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={20} color="#fff" />
              </div>
              <div>
                <div style={{ fontFamily: 'var(--font-bebas),sans-serif', fontSize: 22, letterSpacing: '0.06em', color: '#fff' }}>RESET SEMUA POIN</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>Aksi berbahaya — tidak dapat dibatalkan</div>
              </div>
              <button onClick={closeResetAll} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.50)', padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.40)', borderRadius: 6, padding: '12px 16px', marginBottom: 20, marginTop: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#fca5a5', marginBottom: 6 }}>Perhatian!</div>
              <div style={{ fontSize: 12, color: '#fca5a5', lineHeight: 1.6 }}>
                Seluruh riwayat kuis dari <strong>{users.filter(u => u.attempts > 0).length} peserta</strong> akan dihapus permanen.
                Total poin semua peserta akan kembali ke 0.
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', marginBottom: 8 }}>
                Ketik <strong style={{ color: '#ef4444', fontFamily: 'monospace' }}>RESET</strong> untuk mengkonfirmasi:
              </div>
              <input
                className="input"
                placeholder="Ketik RESET di sini..."
                value={resetAllConfirm}
                onChange={e => setResetAllConfirm(e.target.value)}
                style={{ fontFamily: 'monospace', letterSpacing: '0.12em', fontWeight: 700 }}
                autoFocus
              />
            </div>

            {resetAllError && (
              <div className="alert alert-error" style={{ marginBottom: 14 }}><AlertCircle size={14} style={{ flexShrink: 0 }} /><span style={{ fontSize: 12 }}>{resetAllError}</span></div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={closeResetAll}>Batal</button>
              <button
                type="button"
                disabled={resettingAll || resetAllConfirm !== 'RESET'}
                onClick={handleResetAll}
                style={{
                  flex: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  padding: '12px 20px',
                  background: resetAllConfirm === 'RESET' ? '#ef4444' : 'rgba(239,68,68,0.25)',
                  border: '2px solid #000', boxShadow: resetAllConfirm === 'RESET' ? '3px 3px 0 0 #000' : 'none',
                  color: '#fff', fontWeight: 700, fontSize: 14,
                  cursor: (resettingAll || resetAllConfirm !== 'RESET') ? 'not-allowed' : 'pointer',
                  opacity: (resettingAll || resetAllConfirm !== 'RESET') ? 0.6 : 1,
                  transition: 'all 150ms ease',
                }}
              >
                <AlertTriangle size={15} /> {resettingAll ? 'Mereset...' : 'Reset Semua Poin'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
