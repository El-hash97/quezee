import { sql } from 'drizzle-orm';
import { db } from './index';
import { materials, questions } from './schema';
import { MATERIALS, QUESTIONS } from '../mockData';

async function seed() {
  console.log('Seeding materials...');
  for (const m of MATERIALS) {
    await db.insert(materials).values({
      id:          m.id,
      title:       m.title,
      category:    m.category,
      icon:        m.icon,
      description: m.description,
      readTime:    m.readTime,
      color:       m.color,
      fileUrl:     null,
      fileType:    null,
    }).onConflictDoNothing();
  }

  console.log('Seeding questions...');
  for (const q of QUESTIONS) {
    await db.insert(questions).values({
      id:           q.id,
      materialId:   q.materialId,
      question:     q.question,
      options:      q.options,
      correctIndex: q.correctIndex,
      explanation:  q.explanation,
    }).onConflictDoNothing();
  }

  // Reset serial sequence so new inserts don't conflict with seeded IDs
  await db.execute(sql`SELECT setval(pg_get_serial_sequence('questions', 'id'), COALESCE((SELECT MAX(id) FROM questions), 0))`);

  console.log(`Done: ${MATERIALS.length} materi, ${QUESTIONS.length} soal seeded.`);
  process.exit(0);
}

seed().catch(e => { console.error(e); process.exit(1); });
