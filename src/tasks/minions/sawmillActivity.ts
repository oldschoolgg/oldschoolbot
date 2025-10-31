import { Bank } from 'oldschooljs';

import type { SawmillActivityTaskOptions } from '@/lib/types/minions.js';

export const sawmillTask: MinionTask = {
	type: 'Sawmill',
	async run(data: SawmillActivityTaskOptions, { user, handleTripFinish }) {
		const { channelID, plankID, plankQuantity } = data;

		const loot = new Bank().add(plankID, plankQuantity);

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		if (
			user.hasEquipped(['Iron dagger', 'Bronze arrow', 'Iron med helm']) &&
			user.getAttackStyles().includes('strength') &&
			!user.hasEquippedOrInBank(['Helm of raedwald'])
		) {
			loot.add('Helm of raedwald');
			str +=
				"\n\nWhile on the way to the sawmill, a helmet falls out of a tree onto the ground infront of you... **You've found the Helm of Raedwald!**";
		}

		await user.transactItems({
			collectionLog: true,
			itemsToAdd: loot
		});

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
