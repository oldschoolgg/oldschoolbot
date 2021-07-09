import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../../../lib/settings/types/UserSettings';
import { CyclopsTable } from '../../../../lib/simulation/cyclops';
import { CyclopsActivityTaskOptions } from '../../../../lib/types/minions';
import { roll } from '../../../../lib/util';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';
import itemID from '../../../../lib/util/itemID';

const cyclopsID = 2097;

const defenders = [
	{
		itemID: itemID('Dragon defender'),
		rollChance: 100
	},
	{
		itemID: itemID('Rune defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Adamant defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Mithril defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Black defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Steel defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Iron defender'),
		rollChance: 50
	},
	{
		itemID: itemID('Bronze defender'),
		rollChance: 50
	}
];

export default class extends Task {
	async run(data: CyclopsActivityTaskOptions) {
		const { userID, channelID, quantity, quantitySpecified } = data;
		const user = await this.client.users.fetch(userID);
		const userBank = new Bank(user.settings.get(UserSettings.Bank));

		let loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const highestDefenderOwned = defenders.find(def => userBank.has(def.itemID) || loot.has(def.itemID));
			const possibleDefenderToDrop =
				defenders[
					Math.max(
						0,
						highestDefenderOwned ? defenders.indexOf(highestDefenderOwned) - 1 : defenders.length - 1
					)
				];
			if (roll(possibleDefenderToDrop.rollChance)) {
				loot.add(possibleDefenderToDrop.itemID);
			}
			loot.add(CyclopsTable.roll());
		}

		await user.addItemsToBank(loot.bank, true);

		let str = `${user}, ${user.minionName} finished killing ${quantity} Cyclops. Your Cyclops KC is now ${
			(user.settings.get(UserSettings.MonsterScores)[cyclopsID] ?? 0) + quantity
		}.`;

		user.incrementMonsterScore(cyclopsID, quantity);
		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot.bank, `Loot From ${quantity}x Cyclops`, true, { showNewCL: 1 }, user);

		handleTripFinish(
			this.client,
			user,
			channelID,
			str,
			res => {
				user.log('continued cyclops');
				return this.client.commands.get('wg')!.run(res, [quantitySpecified ? quantity : null, 'cyclops']);
			},
			image!,
			data,
			loot.bank
		);
	}
}
