import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { UserSettings } from '../../../../lib/settings/types/UserSettings';
import { CyclopsTable } from '../../../../lib/simulation/cyclops';
import { ActivityTaskOptionsWithQuantity } from '../../../../lib/types/minions';
import { roll } from '../../../../lib/util';
import { handleTripFinish } from '../../../../lib/util/handleTripFinish';
import itemID from '../../../../lib/util/itemID';
import { makeBankImage } from '../../../../lib/util/makeBankImage';

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
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity } = data;
		const user = await this.client.fetchUser(userID);
		const userBank = user.bank();

		let loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const highestDefenderOwned = defenders.find(
				def => userBank.has(def.itemID) || user.hasItemEquippedAnywhere(def.itemID) || loot.has(def.itemID)
			);
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

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		let str = `${user}, ${user.minionName} finished killing ${quantity} Cyclops. Your Cyclops KC is now ${
			(user.settings.get(UserSettings.MonsterScores)[cyclopsID] ?? 0) + quantity
		}.`;

		await user.incrementMonsterScore(cyclopsID, quantity);

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Cyclops`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			str,
			['activities', { warriors_guild: { action: 'cyclops', quantity } }, true],
			image.file.buffer,
			data,
			itemsAdded
		);
	}
}
