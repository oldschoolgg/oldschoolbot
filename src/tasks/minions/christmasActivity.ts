import { roll, Time } from 'e';
import { Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { isElligibleForPresent } from '../../lib/settings/prisma';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { ChristmasTaskOptions } from '../../lib/types/minions';
import { handleTripFinish } from '../../lib/util/handleTripFinish';
import itemID from '../../lib/util/itemID';

const foodTable = new LootTable()
	.add('Bucket of milk')
	.add('Carrot')
	.add('Chocolate kebbit')
	.add('Chocolate bar')
	.add('Strawberry')
	.add('Roast potatoes')
	.oneIn(5, 'Yule log')
	.oneIn(3, 'Pretzel')
	.oneIn(8, 'Christmas pudding')
	.oneIn(5, 'Roast potatoes')
	.oneIn(5, 'Festive mistletoe')
	.tertiary(
		34,
		new LootTable()
			.add('Christmas pudding amulet', 1, 2)
			.add('Christmas tree kite', 1, 2)
			.add('Christmas tree hat', 1, 2)
	);

const petDrops = [
	['Ishi', 'Fish n chips'],
	['Flappy', 'Flappy meal'],
	['Doug', "Dougs' chocolate mud"],
	['Cob', 'Corn on the cob'],
	['Smokey', 'Smokey bbq sauce'],
	['Mini pumpkinhead', 'Pumpkinhead pie'],
	['Hammy', 'Roasted ham'],
	['Remy', 'Ratatouille'],
	['Plopper', 'Bacon'],
	['Harry', 'Prawns'],
	['Harry', 'Pavlova'],
	['Lil lamb', "Shepherd's pie"],
	['Gregoyle', 'Gr-egg-oyle special']
];

export default class extends Task {
	async run(data: ChristmasTaskOptions) {
		const { channelID, quantity, userID, action } = data;
		const user = await this.client.fetchUser(userID);

		const loot = foodTable.roll();
		const cl = user.cl();

		const equippedPet = user.equippedPet();
		let postMessages = [];

		if (equippedPet !== null) {
			for (const [petName, itemName] of petDrops) {
				if (equippedPet === itemID(petName) && roll(2)) {
					loot.add(itemName);
					postMessages.push(`${petName} found a ${itemName}`);
					break;
				}
			}
			if (
				equippedPet === itemID('Wilvus') &&
				roll(2) &&
				action === 'steal' &&
				cl.amount('Smokey painting') === 0
			) {
				loot.add('Smokey painting');
				postMessages.push('Wilvus stole a painting off one of the walls!');
			}
		}

		const clMod = cl.amount('Seer');
		if (roll(150 * (clMod + 1) * (clMod + 1))) {
			loot.add('Seer');
		}

		let str = `${user}, ${user.minionName} finished ${action}ing ${quantity}x presents and received ${loot}.`;

		if (!(await isElligibleForPresent(user)) && !user.settings.get(UserSettings.GotFreeFestivePresent) && roll(2)) {
			await user.settings.update(UserSettings.GotFreeFestivePresent, true);
			await user.addItemsToBank(new Bank().add('Festive present'), false);
			str += '\n\nYou received 1x Festive Present!';
		}

		await user.addItemsToBank(loot, true);

		const key = action === 'steal' ? UserSettings.PresentsStolen : UserSettings.PresentsDelivered;
		const current = user.settings.get(key);
		await user.settings.update(key, current + quantity);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			['christmas', [], true, action],
			undefined,
			data,
			loot.bank
		);
	}
}
