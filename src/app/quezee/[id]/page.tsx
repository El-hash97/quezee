'use client';
import { use, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, XCircle, ChevronRight, Trophy, RotateCcw, Clock } from 'lucide-react';
import AppShell from '@/components/AppShell';

interface QuizQuestion {
  id: number; materialId: string | null;
  question: string; options: string[];
  correctIndex: number; explanation: string | null;
}

const KEYS  = ['A', 'B', 'C', 'D'];
const TIMER = 45;

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [answered,  setAnswered]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [results,   setResults]   = useState<boolean[]>([]);
  const [done,      setDone]      = useState(false);
  const [timeLeft,  setTimeLeft]  = useState(TIMER);

  useEffect(() => {
    fetch(`/api/quiz/questions?topic=${id}`)
      .then(r => r.json())
      .then(d => {
        if (d.error) { setLoadError(d.error); setLoading(false); return; }
        if (Array.isArray(d)) { setQuestions(d); setLoading(false); }
      })
      .catch(() => { setLoadError('Gagal memuat soal. Periksa koneksi dan coba lagi.'); setLoading(false); });
  }, [id]);

  const handleNext = useCallback(() => {
    if (!answered || questions.length === 0) return;
    const correct = selected === questions[current].correctIndex;
    setScore(s => s + (correct ? 5 : 0));
    setResults(r => [...r, correct]);
    if (current + 1 >= questions.length) { setDone(true); }
    else { setCurrent(c => c + 1); setSelected(null); setAnswered(false); setTimeLeft(TIMER); }
  }, [answered, selected, questions, current]);

  useEffect(() => {
    if (done || answered || loading || questions.length === 0) return;
    const t = setInterval(() => setTimeLeft(p => {
      if (p <= 1) { clearInterval(t); setAnswered(true); setSelected(null); return 0; }
      return p - 1;
    }), 1000);
    return () => clearInterval(t);
  }, [current, done, answered, loading, questions.length]);

  useEffect(() => {
    if (!answered) return;
    const t = setTimeout(handleNext, 2000);
    return () => clearTimeout(t);
  }, [answered, handleNext]);

  const topicLabel = id === 'all' ? 'Semua Materi' : id === 'seven-tools' ? 'Seven Tools' : '8 Langkah';

  useEffect(() => {
    if (!done) return;
    const correct = results.filter(Boolean).length;
    fetch('/api/quiz/attempts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: topicLabel, correctAnswers: correct, wrongAnswers: results.length - correct }),
    }).catch(() => {});
  }, [done]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return (
    <AppShell title="Quezee">
      <div style={{ textAlign: 'center', padding: 64, color: 'var(--text-muted)' }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
        <div>Memuat soal...</div>
      </div>
    </AppShell>
  );

  if (loadError) return (
    <AppShell title="Quezee">
      <div style={{ textAlign: 'center', padding: 48 }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', marginBottom: 16 }}>{loadError}</div>
        <button className="btn btn-secondary" onClick={() => router.push('/quezee')}><RotateCcw size={14} /> Kembali</button>
      </div>
    </AppShell>
  );

  if (done) {
    const correctCount = results.filter(Boolean).length;
    const pct   = Math.round((correctCount / questions.length) * 100);
    const grade = pct >= 80 ? { label: 'LUAR BIASA!', color: 'var(--green)' }
      : pct >= 60 ? { label: 'BAGUS!', color: 'var(--amber)' }
      : { label: 'TERUS BELAJAR', color: 'var(--blue)' };
    return (
      <AppShell title="Hasil Quezee">
        <div style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 120, height: 120, borderRadius: '50%', border: `4px solid ${grade.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: `0 0 32px ${grade.color}30`, animation: 'count-up 0.5s ease forwards' }}>
              <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 36, color: grade.color, lineHeight: 1 }}>{pct}%</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.1em' }}>SKOR</div>
            </div>
            <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 32, letterSpacing: '0.06em', color: grade.color }}>{grade.label}</div>
          </div>
          <div className="card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', textAlign: 'center' }}>
              {[
                { value: String(correctCount), label: 'Benar', color: 'var(--green)' },
                { value: String(questions.length - correctCount), label: 'Salah', color: 'var(--red)' },
                { value: String(score), label: 'Poin', color: 'var(--amber)' },
              ].map((s, i) => (
                <div key={i} style={{ padding: 16, borderRight: i < 2 ? '1px solid var(--border-dim)' : '' }}>
                  <div style={{ fontFamily: 'var(--font-bebas), sans-serif', fontSize: 32, color: s.color, lineHeight: 1 }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card" style={{ marginBottom: 24, textAlign: 'left' }}>
            <div className="section-title" style={{ marginBottom: 12, backgroundColor: '#2563eb', color: '#fff' }}>Review Jawaban</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {results.map((r, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 6, background: r ? 'var(--green-dim)' : 'var(--red-dim)', border: `1px solid ${r ? 'var(--green)' : 'var(--red)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: r ? 'var(--green)' : 'var(--red)' }}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => router.push('/quezee')}><RotateCcw size={15} /> Ulangi</button>
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => router.push('/performance')}><Trophy size={15} /> Lihat Performa</button>
          </div>
        </div>
      </AppShell>
    );
  }

  const q = questions[current];
  const correctCount = results.filter(Boolean).length;

  return (
    <AppShell title={`Quezee — ${current + 1}/${questions.length}`}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{ flex: 1 }}><div className="progress"><div className="progress-bar" style={{ width: `${(current / questions.length) * 100}%` }} /></div></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 700, color: timeLeft <= 10 ? 'var(--red)' : 'var(--text-muted)', minWidth: 56 }}><Clock size={13} /> {timeLeft}s</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', minWidth: 60, textAlign: 'right' }}><span style={{ color: 'var(--amber)', fontWeight: 700 }}>{score}</span> pts</div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Soal {current + 1} dari {questions.length}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 600 }}>{correctCount} ✓</span>
            <span style={{ fontSize: 12, color: 'var(--red)' }}>{results.length - correctCount} ✗</span>
          </div>
        </div>

        <div className="card card-amber" style={{ marginBottom: 20, padding: '24px 28px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--amber)', marginBottom: 12 }}>PERTANYAAN #{current + 1}</div>
          <p style={{ fontSize: 16, color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>{q.question}</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
          {q.options.map((opt, i) => {
            let cls = 'quiz-option';
            if (answered) {
              if (i === q.correctIndex) cls += ' correct';
              else if (i === selected) cls += ' incorrect';
            } else if (i === selected) cls += ' selected';
            return (
              <div key={i} className={cls} onClick={() => { if (!answered) { setSelected(i); setAnswered(true); } }}>
                <div className="quiz-option-key">{KEYS[i]}</div>
                <span style={{ fontSize: 14, color: 'var(--text-primary)', lineHeight: 1.5, flex: 1 }}>{opt}</span>
                {answered && i === q.correctIndex && <CheckCircle2 size={18} style={{ color: 'var(--green)', marginLeft: 'auto', flexShrink: 0 }} />}
                {answered && i === selected && i !== q.correctIndex && <XCircle size={18} style={{ color: 'var(--red)', marginLeft: 'auto', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>

        {answered && (
          <div className={`alert ${selected === q.correctIndex ? 'alert-success' : 'alert-error'}`} style={{ marginBottom: 16, animation: 'fadeUp 0.3s ease forwards' }}>
            {selected === q.correctIndex ? <CheckCircle2 size={14} style={{ flexShrink: 0 }} /> : <XCircle size={14} style={{ flexShrink: 0 }} />}
            <div><strong>{selected === q.correctIndex ? '+5 poin! ' : 'Jawaban salah. '}</strong>{q.explanation}</div>
          </div>
        )}

        <button className="btn btn-primary btn-block btn-lg" onClick={handleNext} disabled={!answered}>
          {current + 1 === questions.length ? 'Lihat Hasil' : 'Soal Berikutnya'} <ChevronRight size={16} />
        </button>
      </div>
    </AppShell>
  );
}
