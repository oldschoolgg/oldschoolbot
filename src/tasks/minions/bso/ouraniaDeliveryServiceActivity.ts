import { randFloat } from 'e';
import { Bank, LootTable } from 'oldschooljs';
import { PrayerPageTable } from 'oldschooljs/dist/simulation/clues/General';

import { userHasFlappy } from '../../../lib/invention/inventions';

import { incrementMinigameScore } from '../../../lib/settings/settings';
import { ExoticSeedsTable } from '../../../lib/simulation/sharedTables';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { MinigameActivityTaskOptionsWithNoChanges } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

const boxTable = new LootTable()
	.add('Tradeable mystery box', [1, 2], 100)
	.add('Untradeable mystery box', 1, 40)
	.add('Equippable mystery box', 1, 5)
	.add('Pet mystery box');
const BaseTable = new LootTable()
	.add(ExoticSeedsTable, 1, 5)
	.add(PrayerPageTable)
	.add('Magic beans')
	.add(boxTable)
	.add('Magical artifact');
const OuraniaTipTable = new LootTable().tertiary(9, BaseTable);

export const odsTask: MinionTask = {
	type: 'OuraniaDeliveryService',
	async run(data: MinigameActivityTaskOptionsWithNoChanges) {
		const { channelID, quantity, duration, userID } = data;

		incrementMinigameScore(userID, 'ourania_delivery_service', quantity);

		const user = await mUserFetch(userID);
		const level = user.skillLevel(SkillsEnum.Magic);
		let tokens = Math.floor((quantity / 2) * 3.235 * (level / 25 + 1));

		const flappyRes = await userHasFlappy({ user, duration });

		if (flappyRes.shouldGiveBoost) tokens *= 2;
		await user.update({
			ourania_tokens: {
				increment: tokens
			}
		});

		const totalXP = level * (quantity * randFloat(39, 41));
		const xpRes = await user.addXP({
			skillName: SkillsEnum.Runecraft,
			amount: totalXP,
			duration
		});

		let str = `${user}, ${user.minionName} finished completing ${quantity}x Ourania deliveries, you received ${tokens} tokens. ${xpRes}`;

		const loot = new Bank();
		for (let i = 0; i < quantity; i++) {
			loot.add(OuraniaTipTable.roll());
		}
		if (loot.length > 0) {
			if (flappyRes.shouldGiveBoost) {
				loot.multiply(2);
			}
			await user.addItemsToBank({ items: loot, collectionLog: true });

			str += `\n\nYou received some tips from Wizards in your delivery route: ${loot}.`;
		}
		if (flappyRes.userMsg) str += `\n${flappyRes.userMsg}`;

		handleTripFinish(user, channelID, str, undefined, data, null);
	}
};
