import { Bank } from 'oldschooljs';

import type { ActivityTaskOptionsWithNoChanges } from '@/lib/types/minions.js';

export const mageArenaTwoTask: MinionTask = {
	type: 'MageArena2',
	async run(data: ActivityTaskOptionsWithNoChanges, { user, handleTripFinish, rng }) {
		const { channelId } = data;

		let str = '';
		let loot: Bank | undefined;
		if (rng.percentChance(70)) {
			const deathReason = rng.pick([
				'Died to Porazdir',
				'Killed by Derwen',
				'Killed by Justiciar Zachariah',
				"PK'd by a clan",
				'Killed by Chaos Elemental',
				'Killed by a PKer'
			]);
			str = `${user}, ${user.minionName} failed to complete the Mage Arena II: ${deathReason}. Try again.`;
		} else {
			loot = new Bank().add('Imbued saradomin cape').add('Imbued zamorak cape').add('Imbued guthix cape');

			await user.transactItems({
				collectionLog: true,
				itemsToAdd: loot
			});
			str = `${user}, ${user.minionName} finished the Mage Arena II, you received: ${loot}.`;
		}

		handleTripFinish({ user, channelId, message: str, data, loot: loot ?? null });
	}
};
