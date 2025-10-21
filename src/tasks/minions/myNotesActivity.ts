import { AncientCavernAncientPageTable, Bank, LootTable } from 'oldschooljs';

import type { ActivityTaskOptionsWithQuantity } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

const skeletonTable = new LootTable({ limit: 202 })
	.add('Bones', 1, 24)
	.add(AncientCavernAncientPageTable, 1, 16)
	.add('Mangled bones', 1, 11);

export const myNotesTask: MinionTask = {
	type: 'MyNotes',
	async run(data: ActivityTaskOptionsWithQuantity, { user, handleTripFinish }) {
		const { channelID, quantity } = data;

		const loot = new Bank(skeletonTable.roll(quantity));

		const { previousCL, itemsAdded } = await user.transactItems({
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
