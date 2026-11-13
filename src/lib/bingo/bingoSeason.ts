import { randomUUID } from 'node:crypto';
import { UserError } from '@oldschoolgg/toolkit';

import type { Prisma } from '@/prisma/main.js';
import { evaluateBingoChallenge, isBingoEventInSeason } from '@/lib/bingo/bingoProgress.js';
import { type BingoTheme, bingoBoardSchema, challengeTarget } from '@/lib/bingo/bingoTypes.js';

async function lockSeason(tx: Prisma.TransactionClient, id: string) {
	await tx.$queryRaw`SELECT id FROM bingo_season WHERE id = ${id}::uuid FOR UPDATE`;
	return tx.bingoSeason.findUniqueOrThrow({ where: { id } });
}

export async function createBingoSeason(data: {
	name: string;
	theme: BingoTheme;
	year: number;
	start_date: Date;
	end_date: Date;
	challenges: unknown;
}) {
	const challenges = bingoBoardSchema.parse(data.challenges);
	if (
		data.start_date >= data.end_date ||
		data.end_date <= new Date() ||
		data.start_date < new Date(Date.now() - 60_000)
	) {
		throw new UserError('Seasons must start now or in the future and end after they start.');
	}
	const season = await prisma.$transaction(async tx => {
		// Serialise schedule changes even when there are no seasons to lock yet.
		await tx.$queryRaw`SELECT pg_advisory_xact_lock(730028)::text`;
		const overlap = await tx.bingoSeason.findFirst({
			where: { start_date: { lt: data.end_date }, end_date: { gt: data.start_date } }
		});
		if (overlap) throw new UserError(`This overlaps the season '${overlap.name}'.`);
		return tx.bingoSeason.create({
			data: {
				...data,
				challenges,
				status: data.start_date <= new Date() ? 'active' : 'upcoming'
			}
		});
	});
	return season;
}

export async function processBingoEvent(id: string, seasonID: string) {
	return prisma.$transaction(async tx => {
		const season = await lockSeason(tx, seasonID);
		const event = await tx.seasonalBingoEvent.findUniqueOrThrow({ where: { id } });
		if (event.season_id !== seasonID) throw new Error('Bingo event belongs to a different season.');
		if (event.processed) return;
		const credits: Record<string, number> = {};
		if (isBingoEventInSeason(season, event)) {
			const progress = await tx.seasonalBingoProgress.findMany({ where: { season_id: seasonID } });
			for (const challenge of bingoBoardSchema.parse(season.challenges)) {
				const previous = progress.find(p => p.challenge_id === challenge.id);
				if (previous?.reset_at && event.occurred_at <= previous.reset_at) continue;
				const result = evaluateBingoChallenge(
					challenge,
					{
						quantity: previous?.quantity ?? 0,
						items: (previous?.items ?? {}) as Record<string, number>
					},
					{ ...event, items: event.items as Record<string, number> }
				);
				if (result.credit <= 0 && JSON.stringify(result.items) === JSON.stringify(previous?.items ?? {}))
					continue;
				if (result.credit > 0) credits[challenge.id] = result.credit;
				const completed = result.quantity >= challengeTarget(challenge);
				const data = {
					quantity: result.quantity,
					items: result.items,
					completed_by: completed ? event.user_id : null,
					completed_at: completed ? event.occurred_at : null,
					completion_event_id: completed ? event.id : null
				};
				await tx.seasonalBingoProgress.upsert({
					where: { season_id_challenge_id: { season_id: seasonID, challenge_id: challenge.id } },
					create: { season_id: seasonID, challenge_id: challenge.id, ...data },
					update: data
				});
			}
		}
		await tx.seasonalBingoEvent.update({ where: { id }, data: { processed: true, credits } });
		if (Object.keys(credits).length > 0) {
			await tx.bingoSeason.update({ where: { id: seasonID }, data: { progress_version: { increment: 1 } } });
		}
	});
}

export async function processPendingBingoEvents() {
	const events = await prisma.seasonalBingoEvent.findMany({
		where: { processed: false },
		orderBy: [{ occurred_at: 'asc' }, { id: 'asc' }],
		take: 100,
		select: { id: true, season_id: true }
	});
	for (const event of events) await processBingoEvent(event.id, event.season_id);
	const now = new Date();
	await prisma.bingoSeason.updateMany({
		where: { status: 'upcoming', start_date: { lte: now }, end_date: { gt: now } },
		data: { status: 'active' }
	});
	await prisma.bingoSeason.updateMany({
		where: { status: { not: 'completed' }, end_date: { lte: now } },
		data: { status: 'completed' }
	});
}

export async function endBingoSeason(id: string) {
	await prisma.$transaction(async tx => {
		const season = await lockSeason(tx, id);
		if (season.status === 'completed') throw new UserError('This season has already ended.');
		if (season.start_date > new Date()) throw new UserError('This season has not started yet.');
		await tx.bingoSeason.update({ where: { id }, data: { status: 'completed', end_date: new Date() } });
	});
}

export async function setBingoChallengeCompletion(options: {
	seasonID: string;
	challengeID: string;
	adminID: string;
	completed: boolean;
	reason: string;
}) {
	const { seasonID, challengeID, adminID, completed, reason } = options;
	await prisma.$transaction(async tx => {
		const season = await lockSeason(tx, seasonID);
		const challenge = bingoBoardSchema.parse(season.challenges).find(c => c.id === challengeID);
		if (!challenge) throw new UserError('Unknown challenge.');
		const eventID = `manual:${randomUUID()}`;
		await tx.seasonalBingoEvent.create({
			data: {
				id: eventID,
				season_id: seasonID,
				user_id: adminID,
				started_at: new Date(),
				processed: true,
				metadata: { action: completed ? 'complete' : 'reverse', challengeID, reason }
			}
		});
		// Reversal clears both progress and score, but keeps the original event IDs for deduplication.
		if (!completed) {
			await tx.$executeRaw`UPDATE seasonal_bingo_event SET credits = credits - ${challengeID} WHERE season_id = ${seasonID}::uuid AND credits ? ${challengeID}`;
		}
		const data = {
			quantity: completed ? challengeTarget(challenge) : 0,
			items: {},
			completed_by: completed ? adminID : null,
			completed_at: completed ? new Date() : null,
			completion_event_id: completed ? eventID : null,
			reset_at: completed ? undefined : new Date()
		};
		await tx.seasonalBingoProgress.upsert({
			where: { season_id_challenge_id: { season_id: seasonID, challenge_id: challengeID } },
			create: { season_id: seasonID, challenge_id: challengeID, ...data },
			update: data
		});
		await tx.bingoSeason.update({ where: { id: seasonID }, data: { progress_version: { increment: 1 } } });
	});
}

export function fetchBingoSeason(id?: string) {
	return prisma.bingoSeason.findFirst({
		where: id
			? { id }
			: { status: { not: 'completed' }, start_date: { lte: new Date() }, end_date: { gt: new Date() } },
		include: { progress: true }
	});
}

export async function bingoContributorLeaderboard(seasonID: string) {
	return prisma.$queryRaw<{ user_id: string; score: number }[]>`
		SELECT user_id, SUM(value::double precision) AS score
		FROM seasonal_bingo_event, jsonb_each_text(credits)
		WHERE season_id = ${seasonID}::uuid AND processed = true
		GROUP BY user_id HAVING SUM(value::double precision) > 0
		ORDER BY score DESC, user_id ASC LIMIT 20`;
}
