import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const userProgress = sqliteTable('user_progress', {
  userId: text('user_id').primaryKey(),
  email: text('email'),
  stateJson: text('state_json').notNull(),
  updatedAt: integer('updated_at').notNull(),
});

export const leaderboardProfiles = sqliteTable('leaderboard_profiles', {
  userId: text('user_id').primaryKey(),
  displayName: text('display_name').notNull(),
  solvedCount: integer('solved_count').notNull().default(0),
  successful: integer('successful').notNull().default(0),
  submissions: integer('submissions').notNull().default(0),
  isPublic: integer('is_public', { mode: 'boolean' }).notNull().default(true),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_leaderboard_public_score').on(table.isPublic, table.solvedCount, table.successful, table.updatedAt),
]);

export const customProblems = sqliteTable('custom_problems', {
  id: integer('id').primaryKey(),
  dataJson: text('data_json').notNull(),
  judgeJson: text('judge_json'),
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdBy: text('created_by').notNull(),
  updatedAt: integer('updated_at').notNull(),
}, (table) => [
  index('idx_custom_problems_active_updated').on(table.active, table.updatedAt),
]);

export const judgeRateLimits = sqliteTable('judge_rate_limits', {
  key: text('key').primaryKey(),
  windowStart: integer('window_start').notNull(),
  requestCount: integer('request_count').notNull().default(1),
});
