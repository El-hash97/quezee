'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Lock, Eye, EyeOff, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [noreg, setNoreg] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!noreg || !password) { setError('No. Registrasi dan Password wajib diisi.'); return; }
    setLoading(true);
    try {
      const res  = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ noreg, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Login gagal. Coba lagi.');
        if (data.notActivated) router.push('/activate');
        return;
      }
      router.push(data.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch {
      setError('Terjadi kesalahan jaringan. Coba lagi.');
    } finally {
      setLoading(false);
    }
  }

  const features = [
    'Seven Tools & 8 Steps QCC',
    'Quizee gamifikasi berhadiah poin',
    'Leaderboard & analitik progres',
  ];

  return (
    <div className="auth-split">
      {/* ── Left Brand Panel — dark #14131a + yellow accent ── */}
      <div className="auth-brand">
        <div className="auth-brand-grid" />

        <div style={{
          position: 'absolute', width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(243,243,246,0.06)',
          top: -80, right: -80, pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', width: 200, height: 200, borderRadius: '50%',
          border: '1px solid rgba(243,243,246,0.06)',
          bottom: 60, left: -60, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 0,
            background: '#ffd23f',
            border: '2px solid rgba(255,210,63,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 32,
            boxShadow: '4px 4px 0 0 rgb(243,243,246)',
          }}>
            <span style={{
              fontFamily: 'var(--font-bebas), sans-serif',
              fontSize: 22, fontWeight: 800, color: '#000000',
            }}>QCC</span>
          </div>

          <div style={{
            fontFamily: 'var(--font-bebas), sans-serif',
            fontSize: 44, fontWeight: 800, lineHeight: 1.05,
            letterSpacing: '-0.03em', color: '#ececed', marginBottom: 16,
          }}>
            Tingkatkan<br />
            <span style={{
              display: 'inline-block',
              color: '#ffd23f',
              borderBottom: '4px solid #ffd23f',
              paddingBottom: 2,
            }}>Kualitas</span><br />
            Bersama QCC
          </div>

          <p style={{
            fontSize: 15, lineHeight: 1.65,
            color: '#a6a6b0', marginBottom: 36, maxWidth: 320,
          }}>
            Platform pelatihan digital Seven Tools & 8 Steps untuk peningkatan kualitas berkelanjutan di lini produksi.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {features.map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 0,
                  background: 'rgba(255,210,63,0.12)',
                  border: '2px solid rgba(255,210,63,0.40)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CheckCircle2 size={12} style={{ color: '#ffd23f' }} />
                </div>
                <span style={{ fontSize: 13.5, color: '#ececed', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 48, paddingTop: 20, borderTop: '2px solid rgba(243,243,246,0.10)' }}>
            <span style={{
              fontSize: 11, color: '#a6a6b0',
              letterSpacing: '0.12em', textTransform: 'uppercase', fontWeight: 600,
            }}>
              QCC Training Platform · Seven Tools · 8 Steps
            </span>
          </div>
        </div>
      </div>

      {/* ── Right Form Panel — black background ── */}
      <div className="auth-form-panel">
        <div className="auth-card animate-fade-up">

          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 32 }}>
            <div className="auth-logo">QCC</div>
            <div>
              <div style={{
                fontFamily: 'var(--font-bebas), sans-serif',
                fontSize: 22, fontWeight: 800, letterSpacing: '-0.01em',
                color: 'var(--text-primary)',
              }}>
                Quezee Platform
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 1 }}>
                Masuk ke akun Anda
              </div>
            </div>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label" htmlFor="noreg">No. Registrasi Karyawan</label>
              <div className="input-icon">
                <User size={15} className="input-icon-left" />
                <input
                  id="noreg"
                  className="input"
                  type="text"
                  placeholder="Contoh: 1234567"
                  value={noreg}
                  onChange={e => setNoreg(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="password">Password</label>
              <div className="input-icon" style={{ position: 'relative' }}>
                <Lock size={15} className="input-icon-left" />
                <input
                  id="password"
                  className="input"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  style={{ paddingRight: 44 }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  style={{
                    position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: 'var(--text-muted)', display: 'flex', padding: 4,
                  }}
                  aria-label={showPw ? 'Sembunyikan password' : 'Tampilkan password'}
                >
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-xl btn-block"
              disabled={loading}
              style={{ marginTop: 8 }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{
                    width: 16, height: 16, borderRadius: '50%',
                    border: '2px solid rgba(0,0,0,0.25)',
                    borderTopColor: '#000000',
                    animation: 'spin 0.7s linear infinite',
                    display: 'inline-block',
                  }} />
                  Memproses...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  Masuk <ArrowRight size={17} />
                </span>
              )}
            </button>
          </form>

          <div className="divider" />

          <div style={{ textAlign: 'center', marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Belum punya akun? </span>
            <Link href="/activate" style={{
              fontSize: 13, color: 'var(--amber)', fontWeight: 700, textDecoration: 'none',
            }}>
              Aktivasi Akun
            </Link>
          </div>

          <div className="alert alert-info">
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
            <div style={{ fontSize: 12 }}>
              Belum punya password? Gunakan menu <strong>Aktivasi Akun</strong> untuk mendaftarkan akun Anda.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
