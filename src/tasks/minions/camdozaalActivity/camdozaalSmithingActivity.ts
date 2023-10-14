import { Bank, LootTable } from 'oldschooljs';

import { SkillsEnum } from '../../../lib/skilling/types';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

const camdozaalMiningLootTable = new LootTable()
	.add('Barronite shards', [6, 8], 12)
	.add('Barronite shards', [15, 35], 1)
	.tertiary(200, 'Barronite head')
	.tertiary(300, 'Imcando hammer (broken)')
	.tertiary(350, 'Ancient astroscope')
	.tertiary(350, 'Ancient carcanet')
	.tertiary(350, 'Ancient globe')
	.tertiary(350, 'Ancient ledger')
	.tertiary(350, 'Ancient treatise');

export const camdozaalSmithingTask: MinionTask = {
	type: 'CamdozaalSmithing',
	async run(data: ActivityTaskOptionsWithQuantity) {
		let { quantity, userID, channelID, duration } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(camdozaalMiningLootTable.roll());
		}

		let smithingXpReceived = quantity * 30;

		// Add xp to user
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Smithing,
			amount: smithingXpReceived,
			duration,
			source: 'CamdozaalSmithing'
		});

		let str = `${user}, ${user.minionName} finished smithing in Camdozzal! ${xpRes}`;

		// Give the user items
		const { previousCL, itemsAdded } = await transactItems({
			userID: user.id,
			collectionLog: true,
			itemsToAdd: loot
		});
		// BankImage
		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity}x Barronite deposit`,
			user,
			previousCL
		});

		handleTripFinish(user, channelID, str, image.file.attachment, data, loot);
	}
};
