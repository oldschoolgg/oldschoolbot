import { SimpleTable } from '@oldschoolgg/toolkit';
import { Bank } from 'oldschooljs';

import type { MinigameActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

// Assumes always playing on Castle Wars worlds(which give +1 ticket)"
const ticketTable = new SimpleTable<number>()
	.add(2, 5) // 2 tickets are earned if the player's team loses.
	.add(2, 5) // 2 tickets are earned if scores are tied at 0-0.
	.add(3, 3) // 3 tickets are earned if scores are tied at any number other than 0.
	.add(3, 3) // 3 tickets are earned for winning if the opposing team has scored.
	.add(4, 2); // 4 tickets are earned for winning if the opposing team had 0 points.

export const castleWarsTask: MinionTask = {
	type: 'CastleWars',
	async run(data: MinigameActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelId, quantity } = data;

		await user.incrementMinigameScore('castle_wars', quantity);

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			const tickets = ticketTable.rollOrThrow();
			loot.add('Castle wars ticket', tickets).add('Castle wars supply crate', tickets);
		}
		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelId,
			`${user.mention}, ${user.minionName} finished ${quantity}x Castle Wars games and received ${loot}.`,
			data,
			loot
		);
	}
};
