ALTER TABLE "meetings" ADD COLUMN "level" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "role" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "startTime" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "endTime" varchar(100) NOT NULL;--> statement-breakpoint
ALTER TABLE "meetings" ADD COLUMN "instructions" varchar(1000) NOT NULL;