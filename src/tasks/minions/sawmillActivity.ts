import { MysteryBoxes } from '@/lib/bso/openables/tables.js';

import { roll } from '@oldschoolgg/rng';
import { Bank } from 'oldschooljs';

import { Planks } from '@/lib/minions/data/planks.js';
import type { SawmillActivityTaskOptions } from '@/lib/types/minions.js';

export const sawmillTask: MinionTask = {
	type: 'Sawmill',
	async run(data: SawmillActivityTaskOptions, { user, handleTripFinish }) {
		const { channelId, plankID, plankQuantity } = data;
		const plank = Planks.find(i => i.outputItem === plankID)!;

		const loot = new Bank().add(plankID, plankQuantity);
		const boxChancePerPlank = Math.floor(100 - (Planks.indexOf(plank) + 1) * 8.5) * 5;
		let boxRolls = Math.floor(plankQuantity / 10);
		if (plank.name === 'Elder plank') boxRolls *= 2;
		for (let i = 0; i < boxRolls; i++) {
			if (roll(boxChancePerPlank)) {
				loot.add(MysteryBoxes.roll());
			}
		}

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}. You get ${boxRolls} rolls at a 1 in ${boxChancePerPlank} of a box.`;

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

		handleTripFinish({ user, channelId, message: str, data, loot });
	}
};
