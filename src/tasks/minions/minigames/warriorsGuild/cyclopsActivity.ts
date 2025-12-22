import { roll } from '@oldschoolgg/rng';
import { Bank, itemID } from 'oldschooljs';

import { CyclopsTable } from '@/lib/simulation/cyclops.js';
import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

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
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { channelId, quantity } = data;

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

		const { previousCL, itemsAdded } = await user.transactItems({
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

		handleTripFinish({ user, channelId, message: { content: str, files: [image] }, data, loot: itemsAdded });
	}
};
