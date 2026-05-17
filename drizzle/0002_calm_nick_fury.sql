CREATE TYPE "public"."storage_provider" AS ENUM('local', 's3');--> statement-breakpoint
CREATE TYPE "public"."upload_kind" AS ENUM('avatar', 'attachment', 'rich_text_image', 'organization_logo', 'other');--> statement-breakpoint
CREATE TABLE "email_verification_tokens" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"used_at" timestamp,
	"sent_at" timestamp DEFAULT now() NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "uploads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_id" uuid,
	"kind" "upload_kind" DEFAULT 'attachment' NOT NULL,
	"provider" "storage_provider" DEFAULT 'local' NOT NULL,
	"filename" text NOT NULL,
	"original_name" text NOT NULL,
	"mime" text NOT NULL,
	"size" integer NOT NULL,
	"path" text NOT NULL,
	"public_url" text,
	"width" integer,
	"height" integer,
	"thumbnail_path" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "email_verification_tokens" ADD CONSTRAINT "email_verification_tokens_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "uploads" ADD CONSTRAINT "uploads_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "email_verification_tokens_token_hash_idx" ON "email_verification_tokens" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_user_id_idx" ON "email_verification_tokens" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "email_verification_tokens_used_at_idx" ON "email_verification_tokens" USING btree ("used_at");--> statement-breakpoint
CREATE INDEX "uploads_owner_id_idx" ON "uploads" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "uploads_kind_idx" ON "uploads" USING btree ("kind");--> statement-breakpoint
CREATE UNIQUE INDEX "uploads_path_idx" ON "uploads" USING btree ("path");--> statement-breakpoint
CREATE INDEX "uploads_deleted_at_idx" ON "uploads" USING btree ("deleted_at");