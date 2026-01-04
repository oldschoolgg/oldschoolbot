-- AlterTable
ALTER TABLE "clientStorage" ADD COLUMN     "dominion_cost" JSON NOT NULL DEFAULT '{}',
ADD COLUMN     "dominion_loot" JSON NOT NULL DEFAULT '{}';
