CREATE TABLE "candidate_applications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"email" text NOT NULL,
	"phone" text NOT NULL,
	"position_id" uuid,
	"team_id" uuid,
	"bio" text NOT NULL,
	"profile_picture" text,
	"running_mate_name" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "candidates" DROP CONSTRAINT "candidates_team_id_teams_id_fk";
--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "title" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."position_title";--> statement-breakpoint
CREATE TYPE "public"."position_title" AS ENUM('president', 'vice_president', 'general_secretary', 'financial_secretary');--> statement-breakpoint
ALTER TABLE "positions" ALTER COLUMN "title" SET DATA TYPE "public"."position_title" USING "title"::"public"."position_title";--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_position_id_positions_id_fk" FOREIGN KEY ("position_id") REFERENCES "public"."positions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidate_applications" ADD CONSTRAINT "candidate_applications_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "team_id";--> statement-breakpoint
ALTER TABLE "candidates" DROP COLUMN "running_mate_picture";