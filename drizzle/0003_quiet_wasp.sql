ALTER TABLE "users" ADD COLUMN "avatar_upload_id" uuid;--> statement-breakpoint
CREATE INDEX "users_avatar_upload_id_idx" ON "users" USING btree ("avatar_upload_id");