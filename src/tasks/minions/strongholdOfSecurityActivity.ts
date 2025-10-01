import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const strongholdTask: MinionTask = {
	type: 'StrongholdOfSecurity',
	async run(data: ActivityTaskOptionsWithNoChanges, { user, handleTripFinish }) {
		const { channelID } = data;

		const loot = new Bank().add('Coins', 10_000).add('Fancy boots').add('Fighting boots').add('Fancier boots');

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished the Stronghold of Security, and received ${loot}.`,
			undefined,
			data,
			loot
		);
	}
};
