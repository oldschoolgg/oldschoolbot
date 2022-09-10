import { Bank } from 'oldschooljs';

import { Planks } from '../../lib/minions/data/planks';
import { ButlerActivityTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';

export const butlerTask: MinionTask = {
	type: 'Butler',
	async run(data: ButlerActivityTaskOptions) {
		const { userID, channelID, plankID, plankQuantity } = data;
		const user = await mUserFetch(userID);
		const plank = Planks.find(plank => plank.outputItem === plankID)!;

		const loot = new Bank({
			[plankID]: plankQuantity
		});

		let str = `${user}, ${user.minionName} finished creating planks, you received ${loot}.`;

		await user.addItemsToBank({ items: loot, collectionLog: true });

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { plank_make: { action: 'butler', quantity: plankQuantity, type: plank.name } }, true],
			undefined,
			data,
			loot
		);
	}
};
