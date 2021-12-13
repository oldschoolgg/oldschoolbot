import { roll } from 'e';
import { Task } from 'klasa';
import { LootTable } from 'oldschooljs';

import { antiSantaOutfit } from '../../lib/data/CollectionsExport';
import { ChristmasTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import resolveItems from '../../lib/util/resolveItems';

const foodTable = new LootTable()
	.add('Bucket of milk')
	.add('Carrot')
	.add('Chocolate kebbit')
	.add('Chocolate bar')
	.add('Strawberry');

const stealItems = resolveItems(['Yo-yo']);
const deliverItems = resolveItems(['Snow globe', 'Candy cane']);

export default class extends Task {
	async run(data: ChristmasTaskOptions) {
		const { channelID, quantity, userID, action } = data;
		const user = await this.client.fetchUser(userID);

		const loot = foodTable.roll();
		const table = action === 'steal' ? stealItems : deliverItems;

		const cl = user.cl();
		for (const item of table) {
			if (cl.has(item)) break;
			loot.add(item);
		}

		if (!cl.has('Antisanta mask') && action === 'steal') {
			loot.add(antiSantaOutfit);
		}

		if (roll(120)) {
			loot.add(action === 'steal' ? 'Black santa hat' : 'Inverted santa hat');
		}

		await user.addItemsToBank(loot, true);

		handleTripFinish(
			this.client,
			user,
			channelID,
			`${user}, ${user.minionName} finished ${action}ing ${quantity}x presents and received ${loot}.`,
			['christmas', [], true, action],
			undefined,
			data,
			loot.bank
		);
	}
}
