CREATE TABLE "fees" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_kh" text NOT NULL,
	"amount" double precision NOT NULL,
	"currency" text DEFAULT 'USD' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoice_fees" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_id" text NOT NULL,
	"name" text NOT NULL,
	"name_kh" text NOT NULL,
	"amount_usd" double precision NOT NULL,
	"amount_khr" double precision NOT NULL
);
--> statement-breakpoint
CREATE TABLE "property_fees" (
	"property_id" text NOT NULL,
	"fee_id" text NOT NULL,
	"amount" double precision,
	CONSTRAINT "property_fees_property_id_fee_id_pk" PRIMARY KEY("property_id","fee_id")
);
