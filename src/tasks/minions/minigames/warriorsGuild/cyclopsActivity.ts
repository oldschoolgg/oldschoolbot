import { Bank } from 'oldschooljs';

import { CyclopsTable } from '../../../../lib/simulation/cyclops';
import type { ActivityTaskOptionsWithQuantity } from '../../../../lib/types/minions';
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

export const cyclopsTask: MinionTask = {
	type: 'Cyclops',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { userID, channelID, quantity } = data;
		const user = await mUserFetch(userID);
		const userBank = user.bank;

		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			const highestDefenderOwned = defenders.find(
				def => userBank.has(def.itemID) || user.hasEquipped(def.itemID) || loot.has(def.itemID)
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

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const { newKC } = await user.incrementKC(cyclopsID, quantity);
		const str = `${user}, ${user.minionName} finished killing ${quantity} Cyclops. Your Cyclops KC is now ${newKC}.`;

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Cyclops`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, itemsAdded);
	}
};
