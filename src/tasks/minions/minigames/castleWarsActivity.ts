import { SimpleTable } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

const ticketTable = new SimpleTable<number>().add(1, 4).add(2, 4).add(3, 1);

export const castleWarsTask: MinionTask = {
	type: 'CastleWars',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID, quantity } = data;

		await user.incrementMinigameScore('castle_wars', quantity);

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add('Castle wars ticket', ticketTable.rollOrThrow());
		}
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user.mention}, ${user.minionName} finished ${quantity}x Castle Wars games and received ${loot}.`,
			undefined,
			data,
			loot
		);
	}
};
