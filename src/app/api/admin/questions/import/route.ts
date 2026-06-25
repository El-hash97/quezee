import { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { questions } from '@/lib/db/schema';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN')
    return Response.json({ error: 'Akses ditolak.' }, { status: 403 });

  const fd   = await req.formData();
  const file = fd.get('file') as File | null;
  if (!file) return Response.json({ error: 'File CSV tidak ditemukan.' }, { status: 400 });

  const text  = await file.text();
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);

  if (lines.length < 2)
    return Response.json({ error: 'File CSV kosong atau hanya berisi header.' }, { status: 400 });

  if (lines.length - 1 > 500)
    return Response.json({ error: 'Maksimal 500 soal per import.' }, { status: 400 });

  const headers  = parseCSVLine(lines[0]).map(h => h.trim());
  const required = ['material_id', 'question', 'option_a', 'option_b', 'option_c', 'option_d', 'correct_index', 'explanation'];
  const missing  = required.filter(r => !headers.includes(r));
  if (missing.length > 0)
    return Response.json({ error: `Kolom wajib tidak ada: ${missing.join(', ')}` }, { status: 400 });

  const toInsert: Array<{
    materialId:   string | null;
    question:     string;
    options:      string[];
    correctIndex: number;
    explanation:  string | null;
  }> = [];
  const errors: string[] = [];

  for (let i = 1; i < lines.length; i++) {
    const vals = parseCSVLine(lines[i]).map(v => v.trim());
    const row  = Object.fromEntries(headers.map((h, j) => [h, vals[j] ?? '']));

    if (!row['question']) { errors.push(`Baris ${i + 1}: kolom 'question' kosong`); continue; }
    if (!row['option_a'] || !row['option_b'] || !row['option_c'] || !row['option_d']) {
      errors.push(`Baris ${i + 1}: pilihan jawaban tidak lengkap`); continue;
    }
    const correctIndex = parseInt(row['correct_index']);
    if (isNaN(correctIndex) || correctIndex < 0 || correctIndex > 3) {
      errors.push(`Baris ${i + 1}: 'correct_index' harus angka 0-3`); continue;
    }

    toInsert.push({
      materialId:  row['material_id'] || null,
      question:    row['question'],
      options:     [row['option_a'], row['option_b'], row['option_c'], row['option_d']],
      correctIndex,
      explanation: row['explanation'] || null,
    });
  }

  if (toInsert.length === 0)
    return Response.json({ error: 'Tidak ada baris yang valid untuk diimport.', errors }, { status: 400 });

  await db.insert(questions).values(toInsert);
  return Response.json({ success: true, inserted: toInsert.length, errors });
}
