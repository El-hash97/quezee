import { pgTable, varchar, integer, timestamp, serial, text, jsonb } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  noreg:        varchar('noreg',         { length: 7   }).primaryKey(),
  name:         varchar('name',          { length: 120 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }),
  line:         varchar('line',          { length: 60  }),
  division:     varchar('division',      { length: 60  }),
  role:         varchar('role',          { length: 20  }).notNull().default('PARTICIPANT'),
});

export const quizAttempts = pgTable('quiz_attempts', {
  id:             serial('id').primaryKey(),
  noreg:          varchar('noreg',           { length: 7   }).notNull().references(() => users.noreg),
  attemptNumber:  integer('attempt_number').notNull(),
  topic:          varchar('topic',           { length: 120 }),
  correctAnswers: integer('correct_answers').notNull().default(0),
  wrongAnswers:   integer('wrong_answers'  ).notNull().default(0),
  pointsEarned:   integer('points_earned'  ).notNull().default(0),
  createdAt:      timestamp('created_at').defaultNow(),
});

export const materials = pgTable('materials', {
  id:          varchar('id',          { length: 60  }).primaryKey(),
  title:       varchar('title',       { length: 120 }).notNull(),
  category:    varchar('category',    { length: 20  }).notNull(),
  icon:        varchar('icon',        { length: 20  }),
  description: varchar('description', { length: 500 }),
  readTime:    integer('read_time'),
  color:       varchar('color',       { length: 10  }),
  fileUrl:     varchar('file_url',    { length: 500 }),
  fileType:    varchar('file_type',   { length: 10  }),
  createdAt:   timestamp('created_at').defaultNow(),
});

export const questions = pgTable('questions', {
  id:           serial('id').primaryKey(),
  materialId:   varchar('material_id', { length: 60 }).references(() => materials.id, { onDelete: 'set null' }),
  question:     text('question').notNull(),
  options:      jsonb('options').$type<string[]>().notNull(),
  correctIndex: integer('correct_index').notNull(),
  explanation:  text('explanation'),
  createdAt:    timestamp('created_at').defaultNow(),
});
