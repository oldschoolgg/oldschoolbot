-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "JsonBankType" ADD VALUE 'DoomCost';
ALTER TYPE "JsonBankType" ADD VALUE 'DoomLoot';
ALTER TYPE "JsonBankType" ADD VALUE 'DoomKC';

-- AlterEnum
ALTER TYPE "activity_type_enum" ADD VALUE 'DoomOfMokhaiotl';

-- AlterTable
ALTER TABLE "clientStorage" ADD COLUMN     "doom_cost" JSON NOT NULL DEFAULT '{}',
ADD COLUMN     "doom_loot" JSON NOT NULL DEFAULT '{}';

-- AlterTable
ALTER TABLE "minigames" ADD COLUMN     "doom_of_mokhaiotl" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "user_stats" ADD COLUMN     "doom_cost" JSON NOT NULL DEFAULT '{}',
ADD COLUMN     "doom_kc_bank" JSON NOT NULL DEFAULT '{}',
ADD COLUMN     "doom_loot" JSON NOT NULL DEFAULT '{}';
