CREATE TABLE "user_properties" (
	"user_id" text NOT NULL,
	"property_id" text NOT NULL,
	CONSTRAINT "user_properties_user_id_property_id_pk" PRIMARY KEY("user_id","property_id")
);
