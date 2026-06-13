import { pgTable, varchar, integer, timestamp, serial } from 'drizzle-orm/pg-core';

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
