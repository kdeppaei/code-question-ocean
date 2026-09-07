import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userProgress = sqliteTable('user_progress', {
  userId: text('user_id').primaryKey(),
  email: text('email'),
  stateJson: text('state_json').notNull(),
  updatedAt: integer('updated_at').notNull(),
});
