import { Bank } from 'oldschooljs';

import { MysteryBoxes } from '../../lib/bsoOpenables';
import { Planks } from '../../lib/minions/data/planks';
import type { SawmillActivityTaskOptions } from '../../lib/types/minions';
import { roll } from '../../lib/util';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const sawmillTask: MinionTask = {
	type: 'Sawmill',
	async run(data: SawmillActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity } = data;
		const user = await mUserFetch(userID);
		const plank = Planks.find(i => i.outputItem === plankID)!;
		const loot = new Bank({
			[plankID]: plankQuantity
		});
		const boxChancePerPlank = Math.floor(100 - (Planks.indexOf(plank) + 1) * 8.5) * 5;
		let boxRolls = Math.floor(plankQuantity / 10);
		if (plank.name === 'Elder plank') boxRolls *= 2;
		for (let i = 0; i < boxRolls; i++) {
			if (roll(boxChancePerPlank)) {
				loot.add(MysteryBoxes.roll());
			}
		}

		const res = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const str = `${user}, ${user.minionName} finished creating planks, you received ${res.itemsAdded}. You get ${boxRolls} rolls at a 1 in ${boxChancePerPlank} of a box.`;

		handleTripFinish(user, channelID, str, undefined, data, loot);
	}
};
