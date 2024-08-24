import { increaseNumByPercent } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { MorytaniaDiary, userhasDiaryTier } from '../../../lib/diaries';
import { incrementMinigameScore } from '../../../lib/settings/minigames';
import { SkillsEnum } from '../../../lib/skilling/types';
import type { ShadesOfMortonOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { shades, shadesLogs } from '../../../mahoji/lib/abstracted_commands/shadesOfMortonCommand';

export const shadesOfMortonTask: MinionTask = {
	type: 'ShadesOfMorton',
	async run(data: ShadesOfMortonOptions) {
		const { channelID, quantity, userID, logID, shadeID, duration } = data;
		const user = await mUserFetch(userID);

		await incrementMinigameScore(user.id, 'shades_of_morton', quantity);

		const log = shadesLogs.find(i => i.normalLog.id === logID)!;
		const shade = shades.find(i => i.shadeName === shadeID)!;

		const loot = new Bank();

		const multiplier = 100;
		const table = new LootTable().add('Coins', 0.21 * multiplier);
		if (shade.lowMetalKeys) {
			const subTable = new LootTable();
			for (const key of shade.lowMetalKeys.items) subTable.add(key);
			table.add(subTable, 1, shade.lowMetalKeys.fraction * multiplier);
		}
		if (shade.highMetalKeys) {
			const subTable = new LootTable();
			for (const key of shade.highMetalKeys.items) subTable.add(key);
			table.add(subTable, 1, shade.highMetalKeys.fraction * multiplier);
		}

		for (let i = 0; i < quantity; i++) {
			loot.add(table.roll());
		}

		const messages: string[] = [];

		const { itemsAdded } = await transactItems({ userID: user.id, collectionLog: true, itemsToAdd: loot });

		let firemakingXP = quantity * log.fmXP;
		if ((await userhasDiaryTier(user, MorytaniaDiary.elite))[0]) {
			firemakingXP = increaseNumByPercent(firemakingXP, 50);
			messages.push('50% bonus firemaking xp for morytania elite diary');
		}

		let xpStr = await user.addXP({
			skillName: SkillsEnum.Firemaking,
			amount: firemakingXP,
			duration,
			source: 'ShadesOfMorton'
		});
		let prayerXP = log.prayerXP[shade.shadeName];
		if (!prayerXP) throw new Error(`No prayer XP for ${shade.shadeName} in ${log.oiledLog.name}!`);

		if ((await userhasDiaryTier(user, MorytaniaDiary.hard))[0]) {
			prayerXP = increaseNumByPercent(prayerXP, 50);
			messages.push('50% bonus prayer xp for morytania hard diary');
		}

		xpStr += ', ';
		xpStr += await user.addXP({
			skillName: SkillsEnum.Prayer,
			amount: quantity * prayerXP,
			duration,
			source: 'ShadesOfMorton'
		});

		let str = `${user}, You received ${loot}. ${xpStr}.`;

		if (messages.length > 0) {
			str += `\n**Messages:** ${messages.join(', ')}`;
		}

		handleTripFinish(user, channelID, str, undefined, data, itemsAdded);
	}
};
