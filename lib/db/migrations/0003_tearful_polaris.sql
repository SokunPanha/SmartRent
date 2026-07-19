CREATE TABLE "system_settings" (
	"id" text PRIMARY KEY DEFAULT 'global' NOT NULL,
	"exchange_rate_khr" double precision DEFAULT 4100 NOT NULL,
	"default_electricity_rate" double precision DEFAULT 1000 NOT NULL,
	"default_water_rate" double precision DEFAULT 2000 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "electricity_rate" double precision;--> statement-breakpoint
ALTER TABLE "properties" ADD COLUMN "water_rate" double precision;