import { SimpleTable } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import { userHasFlappy } from '../../../lib/invention/inventions';
import { incrementMinigameScore } from '../../../lib/settings/settings';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const ticketTable = new SimpleTable<number>().add(1, 4).add(2, 4).add(3, 1);

export const castleWarsTask: MinionTask = {
	type: 'CastleWars',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, userID, duration } = data;

		await incrementMinigameScore(userID, 'castle_wars', quantity);

		const user = await mUserFetch(userID);
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add('Castle wars ticket', ticketTable.rollOrThrow());
		}
		const boosts = [];

		const flappyRes = await userHasFlappy({ user, duration });
		if (flappyRes.shouldGiveBoost) {
			loot.multiply(2);
			boosts.push(flappyRes.userMsg);
		}

		await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const boostMsg = boosts.length > 0 ? `\n${boosts.join('\n')}` : '';

		handleTripFinish(
			user,
			channelID,
			`<@${userID}>, ${user.minionName} finished ${quantity}x Castle Wars games and received ${loot}.${boostMsg}`,
			undefined,
			data,
			loot
		);
	}
};
