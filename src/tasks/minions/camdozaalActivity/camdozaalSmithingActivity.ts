import { Bank, LootTable } from 'oldschooljs';

import { SkillsEnum } from '../../../lib/skilling/types';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

// Barronite deposit loot table
const barroniteDepositLootTable = new LootTable()
	.add('Barronite shards', [6, 8], 12)
	.add('Barronite shards', [15, 35], 1)
	.oneIn(200, 'Barronite head')
	.oneIn(300, 'Imcando hammer (broken)')
	.oneIn(350, 'Ancient astroscope')
	.oneIn(350, 'Ancient carcanet')
	.oneIn(350, 'Ancient globe')
	.oneIn(350, 'Ancient ledger')
	.oneIn(350, 'Ancient treatise');

export const camdozaalSmithingTask: MinionTask = {
	type: 'CamdozaalSmithing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		// Count loot received during trip
		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(barroniteDepositLootTable.roll());
		}

		// Add up the xp from the trip
		const smithingXpReceived = quantity * 30;

		// Add xp to user
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: smithingXpReceived,
			duration,
			source: 'CamdozaalSmithing'
		});

		// Trip finish message
		const str = `${user}, ${user.minionName} finished smithing in Camdozaal! ${xpRes}`;

		// Give the user the items from the trip
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});

		// BankImage to show the user their loot
		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Barronite deposit`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
