import { percentChance } from 'e';
import { KlasaUser, Task } from 'klasa';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { Emoji } from '../../../lib/constants';
import { prisma } from '../../../lib/settings/prisma';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { clamp, gaussianRandom } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

interface LMSGameSimulated {
	position: number;
	kills: number;
}

export async function getUsersLMSStats(user: KlasaUser) {
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
		gamesWon
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

async function calculateResultOfLMSGames(user: KlasaUser, qty: number) {
	const lmsStats = await getUsersLMSStats(user);
	const gameResults: LMSGameSimulated[] = [];

	// 0 at 0kc, 1 at 200kc
	const experienceFactor = clamp(lmsStats.totalGames / 200, 0, 1);

	let chanceToWinFight = 12.5;
	chanceToWinFight += experienceFactor * 60;

	for (let i = 0; i < qty; i++) {
		const encounters = 3 + extraEncountersTable.roll().item;
		let kills = 0;
		let died = false;
		for (let t = 0; t < encounters; t++) {
			const wonFight = percentChance(chanceToWinFight);
			if (wonFight) kills++;
			else died = true;
		}
		let diedPosition = gaussianRandom(2, 24 - Math.ceil(12 * experienceFactor), 5);

		let position = died ? diedPosition : 1;
		gameResults.push({ position, kills });
	}

	return gameResults;
}

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID } = data;
		const user = await this.client.fetchUser(userID);
		await incrementMinigameScore(userID, 'lms', quantity);

		const result = await calculateResultOfLMSGames(user, quantity);
		await prisma.lastManStandingGame.createMany({ data: result.map(i => ({ ...i, user_id: BigInt(user.id) })) });
		let points = 0;
		for (const { position, kills } of result) {
			if (position === 1) points += 5;
			else if (position === 2) points += 4;
			else if (position <= 4) points += 3;
			else if (position <= 9) points += 2;
			else if (position <= 19) points += 1;

			if (kills >= 5) points += 2;
			else if (kills >= 3) points += 1;
		}

		const newUser = await prisma.user.update({
			data: {
				lms_points: {
					increment: points
				}
			},
			where: {
				id: user.id
			},
			select: {
				lms_points: true
			}
		});

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${
				user.minionName
			} finished playing ${quantity}x Last Man Standing matches, you received ${points} points and now have ${
				newUser.lms_points
			} points in total.
${result
	.map(
		(i, inde) =>
			`${i.position === 1 ? Emoji.Trophy : ''}Game ${inde + 1}: ${formatOrdinal(i.position)} place, ${
				i.kills
			} kills`
	)
	.join('\n')}`,
			['lms', { start: {} }, true, 'build'],
			undefined,
			data,
			null
		);
	}
}
