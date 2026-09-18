-- Apply to the BSO database before deploying the Lazy Mystery Box claim code.
-- From Git Bash with DATABASE_URL set to the intended BSO database:
-- psql.exe "$DATABASE_URL" -v ON_ERROR_STOP=1 -f prisma/sql/1789344000_claimed_lazy_box.sql
-- Then regenerate the Prisma client: pnpm.cmd exec prisma generate --schema=prisma/schema.prisma
BEGIN;
ALTER TABLE "users" ADD COLUMN "claimed_lazy_box" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD CONSTRAINT "users_claimed_lazy_box_nonnegative" CHECK ("claimed_lazy_box" >= 0);
COMMIT;
