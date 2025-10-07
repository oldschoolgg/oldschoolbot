import { SimpleTable } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

const ticketTable = new SimpleTable<number>().add(1, 4).add(2, 4).add(3, 1);

export const castleWarsTask: MinionTask = {
	type: 'CastleWars',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity, userID, duration } = data;

		await user.incrementMinigameScore('castle_wars', quantity);

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add('Castle wars ticket', ticketTable.rollOrThrow());
		}
		const boosts = [];

		const flappyRes = await user.hasFlappy(duration);
		if (flappyRes.shouldGiveBoost) {
			loot.multiply(2);
			boosts.push(flappyRes.userMsg);
		}

		await user.transactItems({
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
