import { increaseNumByPercent } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';

import type { ShadesOfMortonOptions } from '@/lib/types/minions.js';
import { shades, shadesLogs } from '@/mahoji/lib/abstracted_commands/shadesOfMortonCommand.js';

export const shadesOfMortonTask: MinionTask = {
	type: 'ShadesOfMorton',
	async run(data: ShadesOfMortonOptions, { user, handleTripFinish }) {
		const { channelID, quantity, logID, shadeID, duration } = data;

		await user.incrementMinigameScore('shades_of_morton', quantity);

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

		const { itemsAdded } = await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		let firemakingXP = quantity * log.fmXP;
		if (user.hasDiary('morytania.elite')) {
			firemakingXP = increaseNumByPercent(firemakingXP, 50);
			messages.push('50% bonus firemaking xp for morytania elite diary');
		}

		let xpStr = await user.addXP({
			skillName: 'firemaking',
			amount: firemakingXP,
			duration,
			source: 'ShadesOfMorton'
		});
		let prayerXP = log.prayerXP[shade.shadeName];
		if (!prayerXP) throw new Error(`No prayer XP for ${shade.shadeName} in ${log.oiledLog.name}!`);

		if (user.hasDiary('morytania.hard')) {
			prayerXP = increaseNumByPercent(prayerXP, 50);
			messages.push('50% bonus prayer xp for morytania hard diary');
		}

		xpStr += ', ';
		xpStr += await user.addXP({
			skillName: 'prayer',
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
