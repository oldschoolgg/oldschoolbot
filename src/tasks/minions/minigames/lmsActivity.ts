import { percentChance } from 'e';
import { KlasaUser, Task } from 'klasa';
import SimpleTable from 'oldschooljs/dist/structures/SimpleTable';

import { client } from '../../..';
import { Emoji } from '../../../lib/constants';
import { prisma } from '../../../lib/settings/prisma';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { MinigameActivityTaskOptions } from '../../../lib/types/minions';
import { addArrayOfNumbers, calcPerHour, clamp, gaussianRandom } from '../../../lib/util';
import { formatOrdinal } from '../../../lib/util/formatOrdinal';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { mahojiUserSettingsUpdate } from '../../../mahoji/mahojiSettings';

interface LMSGameSimulated {
	position: number;
	kills: number;
	points: number;
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
		gamesWon,
		points: user.settings.get(UserSettings.LMSPoints)
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

function calculateResultOfLMSGames(qty: number, lmsStats: Awaited<ReturnType<typeof getUsersLMSStats>>) {
	const gameResults: LMSGameSimulated[] = [];

	// 0 at 0kc, 1 at 120kc
	const experienceFactor = clamp(lmsStats.totalGames / 120, 0, 1);

	let chanceToWinFight = 12.5;
	chanceToWinFight += experienceFactor * 75;

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

export default class extends Task {
	async run(data: MinigameActivityTaskOptions) {
		const { channelID, quantity, userID, duration } = data;
		const user = await this.client.fetchUser(userID);
		await incrementMinigameScore(userID, 'lms', quantity);
		const lmsStats = await getUsersLMSStats(user);

		const result = calculateResultOfLMSGames(quantity, lmsStats);

		await prisma.lastManStandingGame.createMany({
			data: result.map(i => ({ ...i, user_id: BigInt(user.id), points: undefined }))
		});
		const points = addArrayOfNumbers(result.map(i => i.points));

		const { newUser } = await mahojiUserSettingsUpdate(client, user, {
			lms_points: {
				increment: points
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
			} points in total. ${calcPerHour(points, duration).toFixed(2)} points/hr
${result
	.map(
		(i, inde) =>
			`${i.position === 1 ? Emoji.Trophy : ''}Game ${inde + 1}: ${formatOrdinal(i.position)} place, ${
				i.kills
			} kills`
	)
	.join('\n')}`,
			['minigames', { lms: { start: {} } }, true, 'build'],
			undefined,
			data,
			null
		);
	}
}
