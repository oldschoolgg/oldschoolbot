ALTER TABLE "users" ADD COLUMN "claimed_glamour_box" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "user_stats" ADD COLUMN "disco_stats" JSON NOT NULL DEFAULT '{}';
ALTER TYPE "activity_type_enum" ADD VALUE IF NOT EXISTS 'DiscoBloodbath';
