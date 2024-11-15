import { Bank, LootTable } from 'oldschooljs';

import { handleTripFinish } from '../../lib/util/handleTripFinish';
import { makeBankImage } from '../../lib/util/makeBankImage';
import type { ActivityTaskOptionsWithQuantity } from './../../lib/types/minions';

const ancientPageTable = new LootTable()
	.add(11_341, 1, 1)
	.add(11_342, 1, 1)
	.add(11_343, 1, 1)
	.add(11_344, 1, 1)
	.add(11_345, 1, 1)
	.add(11_346, 1, 1)
	.add(11_347, 1, 1)
	.add(11_348, 1, 1)
	.add(11_349, 1, 1)
	.add(11_350, 1, 1)
	.add(11_351, 1, 1)
	.add(11_352, 1, 1)
	.add(11_353, 1, 1)
	.add(11_354, 1, 1)
	.add(11_355, 1, 1)
	.add(11_356, 1, 1)
	.add(11_357, 1, 1)
	.add(11_358, 1, 1)
	.add(11_359, 1, 1)
	.add(11_360, 1, 1)
	.add(11_361, 1, 1)
	.add(11_362, 1, 1)
	.add(11_363, 1, 1)
	.add(11_364, 1, 1)
	.add(11_365, 1, 1)
	.add(11_366, 1, 1);

const skeletonTable = new LootTable({ limit: 202 })
	.add('Bones', 1, 24)
	.add(ancientPageTable, 1, 16)
	.add('Mangled bones', 1, 11);

export const myNotesTask: MinionTask = {
	type: 'MyNotes',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, userID, quantity } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank(skeletonTable.roll(quantity));

		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		const image =
			itemsAdded.length === 0
				? undefined
				: await makeBankImage({
						bank: itemsAdded,
						title: `Loot From Rummaging ${quantity}x Skeletons:`,
						user,
						previousCL
					});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} rummaged ${quantity}x Skeletons.`,
			image?.file.attachment,
			data,
			itemsAdded
		);
	}
};
