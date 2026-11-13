import { randomUUID } from 'node:crypto';
import { UserError } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import type { Prisma } from '@/prisma/main.js';
import { evaluateBingoChallenge, isBingoEventInSeason } from '@/lib/bingo/bingoProgress.js';
import { bingoBoardSchema, challengeTarget } from '@/lib/bingo/bingoTypes.js';

async function lockSeason(tx: Prisma.TransactionClient, id: string) {
	await tx.$queryRaw`SELECT id FROM bingo_season WHERE id = ${id}::uuid FOR UPDATE`;
	return tx.bingoSeason.findUniqueOrThrow({ where: { id } });
}

export async function processBingoEvent(id: string, seasonID: string) {
	return prisma.$transaction(async tx => {
		const season = await lockSeason(tx, seasonID);
		const event = await tx.seasonalBingoEvent.findUniqueOrThrow({ where: { id } });
		if (event.season_id !== seasonID) throw new Error('Bingo event belongs to a different season.');
		if (event.processed) return;
		const credits: Record<string, number> = {};
		const completedTiles: string[] = [];
		const participant =
			season.bingo_id && event.team_id > 0
				? await tx.bingoParticipant.findUnique({
						where: { user_id_bingo_id: { user_id: event.user_id, bingo_id: season.bingo_id } }
					})
				: null;
		if (participant?.bingo_team_id === event.team_id && isBingoEventInSeason(season, event)) {
			await tx.bingoParticipant.update({
				where: { user_id_bingo_id: { user_id: event.user_id, bingo_id: season.bingo_id! } },
				data: { cl: new Bank(participant.cl as ItemBank).add(event.items as ItemBank).toJSON() }
			});
			const progress = await tx.seasonalBingoProgress.findMany({
				where: { season_id: seasonID, team_id: event.team_id }
			});
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
				if (completed) completedTiles.push(challenge.name);
				const data = {
					quantity: result.quantity,
					items: result.items,
					completed_by: completed ? event.user_id : null,
					completed_at: completed ? event.occurred_at : null,
					completion_event_id: completed ? event.id : null
				};
				await tx.seasonalBingoProgress.upsert({
					where: {
						season_id_team_id_challenge_id: {
							season_id: seasonID,
							team_id: event.team_id,
							challenge_id: challenge.id
						}
					},
					create: { season_id: seasonID, team_id: event.team_id, challenge_id: challenge.id, ...data },
					update: data
				});
			}
		}
		await tx.seasonalBingoEvent.update({ where: { id }, data: { processed: true, credits } });
		if (Object.keys(credits).length > 0) {
			await tx.bingoSeason.update({ where: { id: seasonID }, data: { progress_version: { increment: 1 } } });
		}
		return completedTiles.length > 0 && season.bingo_id
			? {
					bingoID: season.bingo_id,
					teamID: event.team_id,
					userID: event.user_id,
					tiles: completedTiles
				}
			: null;
	});
}

export async function processPendingBingoEvents(seasonID?: string) {
	const events = await prisma.seasonalBingoEvent.findMany({
		where: { processed: false, season_id: seasonID },
		orderBy: [{ occurred_at: 'asc' }, { id: 'asc' }],
		take: 100,
		select: { id: true, season_id: true }
	});
	for (const event of events) {
		const completed = await processBingoEvent(event.id, event.season_id);
		if (!completed) continue;
		try {
			const bingo = await prisma.bingo.findUniqueOrThrow({ where: { id: completed.bingoID } });
			await globalClient.sendMessage(bingo.notifications_channel_id, {
				content: `<@${completed.userID}> completed ${completed.tiles.join(', ')} for team ${completed.teamID} in **${bingo.title}**!`
			});
		} catch (err) {
			Logging.logError(err instanceof Error ? err : new Error(String(err)), {
				type: 'BINGO_NOTIFICATION',
				bingo_id: completed.bingoID
			});
		}
	}
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

export async function setBingoChallengeCompletion(options: {
	seasonID: string;
	teamID: number;
	challengeID: string;
	adminID: string;
	completed: boolean;
	reason: string;
}) {
	const { seasonID, teamID, challengeID, adminID, completed, reason } = options;
	await prisma.$transaction(async tx => {
		const season = await lockSeason(tx, seasonID);
		if (!season.bingo_id || !(await tx.bingoTeam.findFirst({ where: { id: teamID, bingo_id: season.bingo_id } }))) {
			throw new UserError('Choose a team from this bingo.');
		}
		const challenge = bingoBoardSchema.parse(season.challenges).find(c => c.id === challengeID);
		if (!challenge) throw new UserError('Unknown challenge.');
		const eventID = `manual:${randomUUID()}`;
		await tx.seasonalBingoEvent.create({
			data: {
				id: eventID,
				season_id: seasonID,
				team_id: teamID,
				user_id: adminID,
				started_at: new Date(),
				processed: true,
				metadata: { action: completed ? 'complete' : 'reverse', challengeID, reason }
			}
		});
		// Reversal clears both progress and score, but keeps the original event IDs for deduplication.
		if (!completed) {
			await tx.$executeRaw`UPDATE seasonal_bingo_event SET credits = credits - ${challengeID} WHERE season_id = ${seasonID}::uuid AND team_id = ${teamID} AND credits ? ${challengeID}`;
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
			where: {
				season_id_team_id_challenge_id: { season_id: seasonID, team_id: teamID, challenge_id: challengeID }
			},
			create: { season_id: seasonID, team_id: teamID, challenge_id: challengeID, ...data },
			update: data
		});
		await tx.bingoSeason.update({ where: { id: seasonID }, data: { progress_version: { increment: 1 } } });
	});
}

export async function bingoContributorLeaderboard(seasonID: string, teamID?: number) {
	return prisma.$queryRaw<{ user_id: string; score: number }[]>`
		SELECT user_id, SUM(value::double precision) AS score
		FROM seasonal_bingo_event, jsonb_each_text(credits)
		WHERE season_id = ${seasonID}::uuid AND processed = true AND (${teamID ?? null}::int IS NULL OR team_id = ${teamID ?? null}::int)
		GROUP BY user_id HAVING SUM(value::double precision) > 0
		ORDER BY score DESC, user_id ASC LIMIT 20`;
}
