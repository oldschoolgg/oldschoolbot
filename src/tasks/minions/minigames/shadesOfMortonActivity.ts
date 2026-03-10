import { increaseNumByPercent } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';

import type {
	ShadesOfMortonOptions,
	ShadesOfMortonPyreLogsOptions,
	ShadesOfMortonSacredOilOptions
} from '@/lib/types/minions.js';
import { buildShadeTable, pyreLogRecipes, shades, shadesLogs } from '@/mahoji/lib/abstracted_commands/shadesOfMortonCommand.js';

export const shadesOfMortonTask: MinionTask = {
	type: 'ShadesOfMorton',
	async run(data: ShadesOfMortonOptions | ShadesOfMortonSacredOilOptions | ShadesOfMortonPyreLogsOptions, { user, handleTripFinish }) {
		const { channelId, quantity, duration } = data;

		if (data.type === 'ShadesOfMortonSacredOil') {
			const sacredOilItem = Items.getOrThrow('Sacred oil(4)');
			const loot = new Bank().add(sacredOilItem.id, quantity);
			const { itemsAdded } = await user.transactItems({ collectionLog: true, itemsToAdd: loot });
			const str = `${user}, Your minion finished sanctifying ${quantity}x Olive oil, producing ${quantity}x ${sacredOilItem.name}.`;
			return handleTripFinish({ user, channelId, message: str, data, loot: itemsAdded });
		}

		if (data.type === 'ShadesOfMortonPyreLogs') {
			const { logID } = data as ShadesOfMortonPyreLogsOptions;
			const recipe = pyreLogRecipes.find(r => r.log.id === logID);
			if (!recipe) throw new Error(`No pyre log recipe found for log ID ${logID}`);

			const loot = new Bank().add(recipe.pyreLogs.id, quantity);
			const { itemsAdded } = await user.transactItems({ collectionLog: true, itemsToAdd: loot });

			const xpStr = await user.addXP({
				skillName: 'firemaking',
				amount: quantity * 20,
				duration,
				source: 'ShadesOfMorton'
			});

			const str = `${user}, Your minion finished oiling ${quantity}x ${recipe.pyreLogs.name} and received ${xpStr}.`;
			return handleTripFinish({ user, channelId, message: str, data, loot: itemsAdded });
		}

		const { logID, shadeID } = data as ShadesOfMortonOptions;

		await user.incrementMinigameScore('shades_of_morton', quantity);

		const log = shadesLogs.find(i => i.normalLog.id === logID)!;
		const shade = shades.find(i => i.shadeName === shadeID)!;

		const table = buildShadeTable(shade);
		const loot = new Bank();
		let totalKeysProduced = 0;

		for (let i = 0; i < quantity; i++) {
			const roll_result = table.roll();
			loot.add(roll_result);

			for (const [item, qty] of roll_result.items()) {
				if (item.name.toLowerCase().includes('key')) {
					totalKeysProduced += qty;
				}
			}
		}

		const messages: string[] = [];

		if (totalKeysProduced > 0) {
			messages.push(`Received ${totalKeysProduced} key${totalKeysProduced !== 1 ? 's' : ''}.`);
		}

		loot.remove('Coins', loot.amount('Coins'));

		const { itemsAdded } = await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		let firemakingXP = quantity * log.fmXP;
		if (user.hasDiary('morytania.elite')) {
			firemakingXP = increaseNumByPercent(firemakingXP, 50);
			messages.push('50% bonus firemaking xp for morytania elite diary.');
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
			messages.push('50% bonus prayer xp for morytania hard diary.');
		}

		xpStr += ', ';
		xpStr += await user.addXP({
			skillName: 'prayer',
			amount: quantity * prayerXP,
			duration,
			source: 'ShadesOfMorton'
		});

		let str = `${user}, your minion cremated ${quantity}x ${shade.item.name} remains. ${xpStr}.`;
		if (loot.length > 0) str += ` You received: ${itemsAdded}.`;
		if (messages.length > 0) str += `\n${messages.join(' ')}`;

		handleTripFinish({ user, channelId, message: str, data, loot: itemsAdded });
	}
};