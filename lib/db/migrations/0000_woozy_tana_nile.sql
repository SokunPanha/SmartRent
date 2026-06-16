CREATE TABLE "activity_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"timestamp" timestamp with time zone DEFAULT now() NOT NULL,
	"action" text NOT NULL,
	"action_kh" text NOT NULL,
	"details" text NOT NULL,
	"details_kh" text NOT NULL,
	"username" text NOT NULL,
	"role" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contracts" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"start_date" text NOT NULL,
	"end_date" text NOT NULL,
	"rent_amount" double precision NOT NULL,
	"deposit_amount" double precision NOT NULL,
	"electricity_rate" double precision NOT NULL,
	"water_rate" double precision NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "invoices" (
	"id" text PRIMARY KEY NOT NULL,
	"invoice_number" text NOT NULL,
	"contract_id" text NOT NULL,
	"room_id" text NOT NULL,
	"tenant_id" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"issue_date" text NOT NULL,
	"due_date" text NOT NULL,
	"rent_amount_usd" double precision NOT NULL,
	"electricity_prev" double precision NOT NULL,
	"electricity_curr" double precision NOT NULL,
	"electricity_rate_khr" double precision NOT NULL,
	"electricity_cost_khr" double precision NOT NULL,
	"electricity_cost_usd" double precision NOT NULL,
	"water_prev" double precision NOT NULL,
	"water_curr" double precision NOT NULL,
	"water_rate_khr" double precision NOT NULL,
	"water_cost_khr" double precision NOT NULL,
	"water_cost_usd" double precision NOT NULL,
	"total_amount_usd" double precision NOT NULL,
	"total_amount_khr" double precision NOT NULL,
	"amount_paid_usd" double precision DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"khmer_exchange_rate" double precision NOT NULL,
	"paid_date" text,
	"payment_method" text,
	"notes" text,
	"telegram_scheduled_date" text,
	"telegram_sent_date" text,
	"telegram_status" text,
	"telegram_error" text
);
--> statement-breakpoint
CREATE TABLE "meter_readings" (
	"id" text PRIMARY KEY NOT NULL,
	"room_id" text NOT NULL,
	"reading_date" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"prev_electricity_value" double precision NOT NULL,
	"curr_electricity_value" double precision NOT NULL,
	"prev_water_value" double precision NOT NULL,
	"curr_water_value" double precision NOT NULL,
	"recorded_by" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "properties" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_kh" text NOT NULL,
	"type" text NOT NULL,
	"address" text NOT NULL,
	"address_kh" text NOT NULL,
	"total_rooms" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"role_id" text NOT NULL,
	"permission" text NOT NULL,
	CONSTRAINT "role_permissions_role_id_permission_pk" PRIMARY KEY("role_id","permission")
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "rooms" (
	"id" text PRIMARY KEY NOT NULL,
	"property_id" text NOT NULL,
	"room_number" text NOT NULL,
	"floor" integer NOT NULL,
	"rent_amount" double precision NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tenants" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"name_kh" text NOT NULL,
	"phone" text NOT NULL,
	"national_id" text NOT NULL,
	"email" text,
	"check_in_date" text NOT NULL,
	"emergency_contact" text NOT NULL,
	"telegram_chat_id" text,
	"telegram_auto_send" boolean
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"role_id" text,
	"name_kh" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
