CREATE TABLE `custom_problems` (
	`id` integer PRIMARY KEY NOT NULL,
	`data_json` text NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `leaderboard_profiles` (
	`user_id` text PRIMARY KEY NOT NULL,
	`display_name` text NOT NULL,
	`solved_count` integer DEFAULT 0 NOT NULL,
	`successful` integer DEFAULT 0 NOT NULL,
	`submissions` integer DEFAULT 0 NOT NULL,
	`is_public` integer DEFAULT true NOT NULL,
	`updated_at` integer NOT NULL
);
