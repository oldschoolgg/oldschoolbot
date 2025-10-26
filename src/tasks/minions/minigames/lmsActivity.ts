import { calcPerHour, Emoji, formatOrdinal, gaussianRandom, SimpleTable, sumArr } from '@oldschoolgg/toolkit';
import { clamp } from 'remeda';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

interface LMSGameSimulated {
	position: number;
	kills: number;
	points: number;
}

export async function getUsersLMSStats(user: MUser) {
	const aggregations = await prisma.lastManStandingGame.aggregate({
		_avg: {
			kills: true,
			position: true
		},
		_max: {
			kills: true
		},
		_count: {
			user_id: true
		},
		where: {
			user_id: BigInt(user.id)
		}
	});

	const gamesWon = await prisma.lastManStandingGame.count({
		where: {
			user_id: BigInt(user.id),
			position: 1
		}
	});

	return {
		averageKills: aggregations._avg.kills ?? 0,
		averagePosition: aggregations._avg.position ?? 0,
		highestKillInGame: aggregations._max.kills ?? 0,
		totalGames: aggregations._count.user_id,
		gamesWon,
		points: user.user.lms_points
	};
}

const extraEncountersTable = new SimpleTable<number>()
	.add(0, 100)
	.add(1, 90)
	.add(2, 85)
	.add(3, 70)
	.add(4, 20)
	.add(5, 5)
	.add(6, 3)
	.add(7, 1);

export function calculateResultOfLMSGames(
	rng: RNGProvider,
	qty: number,
	lmsStats: Awaited<ReturnType<typeof getUsersLMSStats>>
) {
	const gameResults: LMSGameSimulated[] = [];

	// 0 at 0kc, 1 at 120kc
	const experienceFactor = clamp(lmsStats.totalGames / 120, { min: 0, max: 1 });

	let chanceToWinFight = 12.5;
	chanceToWinFight += experienceFactor * 75;

	for (let i = 0; i < qty; i++) {
		const encounters = 3 + extraEncountersTable.rollOrThrow();
		let kills = 0;
		let died = false;
		for (let t = 0; t < encounters; t++) {
			const wonFight = rng.percentChance(chanceToWinFight);
			if (wonFight) kills++;
			else died = true;
		}
		const diedPosition = gaussianRandom(rng, 2, 24 - Math.ceil(12 * experienceFactor), 5);

		const position = died ? diedPosition : 1;
		let points = 0;
		if (position === 1) points += 5;
		else if (position === 2) points += 4;
		else if (position <= 4) points += 3;
		else if (position <= 9) points += 2;
		else if (position <= 19) points += 1;

		if (kills >= 5) points += 2;
		else if (kills >= 3) points += 1;

		gameResults.push({ position, kills, points });
	}

	return gameResults;
}

export const lmsTask: MinionTask = {
	type: 'LastManStanding',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish, rng }) {
		const { channelID, quantity, duration } = data;
		await user.incrementMinigameScore('lms', quantity);
		const lmsStats = await getUsersLMSStats(user);

		const result = calculateResultOfLMSGames(rng, quantity, lmsStats);

		await prisma.lastManStandingGame.createMany({
			data: result.map(i => ({ ...i, user_id: BigInt(user.id), points: undefined }))
		});
		const points = sumArr(result.map(i => i.points));

		await user.update({
			lms_points: {
				increment: points
			}
		});
		const newLmsStats = await getUsersLMSStats(user);

		handleTripFinish(
			user,
			channelID,
			`${user}, ${
				user.minionName
			} finished playing ${quantity}x Last Man Standing matches, you received ${points} points and now have ${
				user.user.lms_points
			} points in total, and have won a total of ${newLmsStats.gamesWon}x games. ${calcPerHour(
				points,
				duration
			).toFixed(2)} points/hr
${result
	.map(
		(i, inde) =>
			`${i.position === 1 ? Emoji.Trophy : ''}Game ${inde + 1}: ${formatOrdinal(i.position)} place, ${
				i.kills
			} kills`
	)
	.join('\n')}`,
			undefined,
			data,
			null
		);
	}
};
