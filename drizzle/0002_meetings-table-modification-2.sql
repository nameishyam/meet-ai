ALTER TABLE "meetings" ADD COLUMN "summary" text NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "timestamps" json NOT NULL;