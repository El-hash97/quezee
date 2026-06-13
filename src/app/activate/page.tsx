'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Building2, Layers, Eye, EyeOff, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { LINES, SHIFTS } from '@/lib/mockData';

const steps = ['Verifikasi', 'Pilih Area', 'Buat Password'];

export default function ActivatePage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [noreg, setNoreg] = useState('');
  const [line, setLine] = useState('');
  const [division, setDivision] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState('');

  async function handleStep1(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!noreg.trim()) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/activate/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noreg }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Verifikasi gagal.');
        if (data.alreadyActivated) router.push('/login');
        return;
      }
      setStep(1);
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  function handleStep2(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!line || !division) return;
    setStep(2);
  }

  async function handleStep3(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!password || password !== confirmPw) return;
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noreg, line, division, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Aktivasi gagal.');
        return;
      }
      setDone(true);
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  if (done) return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up" style={{ textAlign: 'center' }}>
        <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--green-dim)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: 'var(--green)' }}>
          <CheckCircle2 size={36} />
        </div>
        <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 28, letterSpacing: '0.06em', marginBottom: 8 }}>AKUN AKTIF!</div>
        <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>
          Akun <strong style={{ color: 'var(--text-primary)' }}>{noreg}</strong> berhasil diaktivasi.
        </p>
        <button className="btn btn-primary btn-xl btn-block" onClick={() => router.push('/login')}>
          LANJUT KE LOGIN <ChevronRight size={18} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="auth-container">
      <div className="auth-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div className="auth-logo" style={{ margin: '0 auto 12px', animation: 'none' }}>QCC</div>
          <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 24, letterSpacing: '0.08em', color: 'var(--text-primary)' }}>AKTIVASI AKUN</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>Registrasi Pertama Kali</div>
        </div>

        {/* Step indicator */}
        <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: 28 }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700,
                  background: i < step ? 'var(--green)' : i === step ? 'var(--amber)' : 'var(--bg-elevated)',
                  color: i <= step ? 'var(--bg-base)' : 'var(--text-muted)',
                  border: i > step ? '1px solid var(--border)' : 'none',
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{ fontSize: 10, fontWeight: 600, color: i === step ? 'var(--amber)' : 'var(--text-muted)', letterSpacing: '0.06em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <div style={{ height: 1, flex: 1, background: i < step ? 'var(--green)' : 'var(--border)', marginBottom: 18, marginLeft: 4, marginRight: 4 }} />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="alert alert-warning">
              <AlertCircle size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12 }}>Pastikan No. Reg sesuai dengan data HR perusahaan.</span>
            </div>
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12 }}>{error}</span>
              </div>
            )}
            <div className="input-group">
              <label className="input-label">No. Registrasi Karyawan (7 digit)</label>
              <div className="input-icon">
                <User size={16} className="input-icon-left" />
                <input className="input" type="text" placeholder="Contoh: 1234567" maxLength={7} inputMode="numeric" pattern="[0-9]{7}" value={noreg} onChange={e => setNoreg(e.target.value.replace(/\D/g, '').slice(0, 7))} />
              </div>
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading || noreg.length !== 7}>
              {loading ? 'Memverifikasi...' : <>Verifikasi <ChevronRight size={16} /></>}
            </button>
          </form>
        )}

        {step === 1 && (
          <form onSubmit={handleStep2} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="alert alert-success">
              <CheckCircle2 size={14} style={{ flexShrink: 0 }} />
              <span style={{ fontSize: 12 }}><strong>{noreg}</strong> ditemukan. Pilih area kerja Anda.</span>
            </div>
            <div className="input-group">
              <label className="input-label">Line Produksi</label>
              <div className="input-icon">
                <Layers size={16} className="input-icon-left" />
                <select className="input" value={line} onChange={e => setLine(e.target.value)}>
                  <option value="">-- Pilih Line --</option>
                  {LINES.slice(1).map(l => <option key={l} value={l}>{l}</option>)}
                </select>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Shift</label>
              <div className="input-icon">
                <Building2 size={16} className="input-icon-left" />
                <select className="input" value={division} onChange={e => setDivision(e.target.value)}>
                  <option value="">-- Pilih Shift --</option>
                  {SHIFTS.slice(1).map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setStep(0)}>← Kembali</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 2 }} disabled={!line || !division}>Lanjut <ChevronRight size={16} /></button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep3} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {error && (
              <div className="alert alert-error">
                <AlertCircle size={14} style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 12 }}>{error}</span>
              </div>
            )}
            <div className="input-group">
              <label className="input-label">Password Baru</label>
              <div className="input-icon" style={{ position: 'relative' }}>
                <Lock size={16} className="input-icon-left" />
                <input className="input" type={showPw ? 'text' : 'password'} placeholder="Min. 8 karakter"
                  value={password} onChange={e => setPassword(e.target.value)} style={{ paddingRight: 44 }} />
                <button type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Konfirmasi Password</label>
              <div className="input-icon">
                <Lock size={16} className="input-icon-left" />
                <input className="input" type="password" placeholder="Ulangi password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              </div>
              {confirmPw && password !== confirmPw && <span style={{ fontSize: 12, color: 'var(--red)' }}>Password tidak cocok</span>}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-ghost btn-lg" style={{ flex: 1 }} onClick={() => setStep(1)}>← Kembali</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 2 }}
                disabled={loading || !password || password !== confirmPw || password.length < 8}>
                {loading ? 'Menyimpan...' : <>Aktivasi <ChevronRight size={16} /></>}
              </button>
            </div>
          </form>
        )}

        <div className="divider" />
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sudah punya akun? </span>
          <Link href="/login" style={{ fontSize: 13, color: 'var(--amber)', fontWeight: 600, textDecoration: 'none' }}>Login</Link>
        </div>
      </div>
    </div>
  );
}
