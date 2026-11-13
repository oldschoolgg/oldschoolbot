-- CreateEnum
CREATE TYPE "BingoSeasonStatus" AS ENUM ('upcoming', 'active', 'completed');

-- CreateTable
CREATE TABLE "bingo_season" (
    "id" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "theme" VARCHAR(16) NOT NULL,
    "year" INTEGER NOT NULL,
    "start_date" TIMESTAMP(6) NOT NULL,
    "end_date" TIMESTAMP(6) NOT NULL,
    "status" "BingoSeasonStatus" NOT NULL DEFAULT 'upcoming',
    "challenges" JSONB NOT NULL,
    "progress_version" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "bingo_season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seasonal_bingo_progress" (
    "season_id" UUID NOT NULL,
    "challenge_id" VARCHAR(64) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL DEFAULT '{}',
    "completed_by" VARCHAR(19),
    "completed_at" TIMESTAMP(6),
    "completion_event_id" TEXT,
    "reset_at" TIMESTAMP(6),

    CONSTRAINT "seasonal_bingo_progress_pkey" PRIMARY KEY ("season_id","challenge_id")
);

-- CreateTable
CREATE TABLE "seasonal_bingo_event" (
    "id" TEXT NOT NULL,
    "season_id" UUID NOT NULL,
    "user_id" VARCHAR(19) NOT NULL,
    "activity_id" INTEGER,
    "activity_type" TEXT,
    "activity_completion" BOOLEAN NOT NULL DEFAULT false,
    "started_at" TIMESTAMP(6) NOT NULL,
    "occurred_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "items" JSONB NOT NULL DEFAULT '{}',
    "credits" JSONB NOT NULL DEFAULT '{}',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "processed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "seasonal_bingo_event_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bingo_season_status_start_date_end_date_idx" ON "bingo_season"("status", "start_date", "end_date");

-- CreateIndex
CREATE INDEX "seasonal_bingo_event_processed_occurred_at_idx" ON "seasonal_bingo_event"("processed", "occurred_at");

-- CreateIndex
CREATE INDEX "seasonal_bingo_event_season_id_user_id_idx" ON "seasonal_bingo_event"("season_id", "user_id");

-- AddForeignKey
ALTER TABLE "seasonal_bingo_progress" ADD CONSTRAINT "seasonal_bingo_progress_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "bingo_season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seasonal_bingo_event" ADD CONSTRAINT "seasonal_bingo_event_season_id_fkey" FOREIGN KEY ("season_id") REFERENCES "bingo_season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

