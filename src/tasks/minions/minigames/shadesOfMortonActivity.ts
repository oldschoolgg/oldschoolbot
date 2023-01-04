import { Bank, LootTable } from 'oldschooljs';

import { SkillsEnum } from '../../../lib/skilling/types';
import { ShadesOfMortonOptions } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { shades, shadesLogs } from '../../../mahoji/lib/abstracted_commands/shadesOfMortonCommand';

export const shadesOfMortonTask: MinionTask = {
	type: 'ShadesOfMorton',
	async run(data: ShadesOfMortonOptions) {
		const { channelID, quantity, userID, logID, shadeID, duration } = data;
		const user = await mUserFetch(userID);

		const log = shadesLogs.find(i => i.oiledLog.id === logID)!;
		const shade = shades.find(i => i.shadeName === shadeID)!;

		let loot = new Bank();

		const multiplier = 100;
		let table = new LootTable().add('Coins', 0.21 * multiplier);
		if (shade.lowMetalKeys) {
			let subTable = new LootTable();
			for (const key of shade.lowMetalKeys.items) subTable.add(key);
			table.add(subTable, 1, shade.lowMetalKeys.fraction * multiplier);
		}
		if (shade.highMetalKeys) {
			let subTable = new LootTable();
			for (const key of shade.highMetalKeys.items) subTable.add(key);
			table.add(subTable, 1, shade.highMetalKeys.fraction * multiplier);
		}

		for (let i = 0; i < quantity; i++) {
			loot.add(table.roll());
		}

		const { itemsAdded } = await transactItems({ userID: user.id, collectionLog: true, itemsToAdd: loot });

		let xpStr = await user.addXP({ skillName: SkillsEnum.Firemaking, amount: quantity * log.fmXP, duration });
		let prayerXP = log.prayerXP[shade.shadeName];
		if (!prayerXP) {
			throw new Error(`No prayer XP for ${shade.shadeName} in ${log.oiledLog.name}!`);
		}
		xpStr += ', ';
		xpStr += await user.addXP({ skillName: SkillsEnum.Prayer, amount: quantity * prayerXP, duration });

		let str = `You received ${loot}. ${xpStr}.`;

		handleTripFinish(user, channelID, str, undefined, data, itemsAdded);
	}
};
