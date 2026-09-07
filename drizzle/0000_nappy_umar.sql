CREATE TABLE `user_progress` (
	`user_id` text PRIMARY KEY NOT NULL,
	`email` text,
	`state_json` text NOT NULL,
	`updated_at` integer NOT NULL
);
