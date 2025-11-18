import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';

import { randInt, roll } from '@oldschoolgg/rng';
import { Events, formatOrdinal, increaseNumByPercent } from '@oldschoolgg/toolkit';
import { Bank, LootTable } from 'oldschooljs';

import type { ShadesOfMortonOptions } from '@/lib/types/minions.js';
import { assert } from '@/lib/util/logError.js';
import { shades, shadesLogs } from '@/mahoji/lib/abstracted_commands/shadesOfMortonCommand.js';
import { bold } from '@oldschoolgg/discord';

export const shadesOfMortonTask: MinionTask = {
	type: 'ShadesOfMorton',
	async run(data: ShadesOfMortonOptions, { user, handleTripFinish }) {
		const { channelId, quantity, logID, shadeID, duration } = data;

		const scoreUpdate = await user.incrementMinigameScore('shades_of_morton', quantity);

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

		const messages: string[] = [];

		// Pet droprate gets rarer if using lower tier shades
		let gotPet = false;
		const remains = ['Urium', 'Fiyr', 'Asyn', 'Riyl', 'Phrin', 'Loar'];
		assert(remains.includes(shadeID), `Invalid shadeID: ${shadeID}`);
		const baseGaryRate = (remains.indexOf(shadeID) + 1) * 1200;
		const garyDroprate = clAdjustedDroprate(user, 'Gary', baseGaryRate, 1.4);

		for (let i = 0; i < quantity; i++) {
			loot.add(table.roll());

			if (!gotPet && roll(garyDroprate)) {
				gotPet = true;
				loot.add('Gary');
				messages.push(
					bold(
						"While walking around in the wet, slimey Mort'ton area, you stumble on a gross, goofy looking snail with a blank, confused stare. You decide to take him with you so someone doesn't step on him."
					)
				);
			}
		}

		const { itemsAdded } = await user.transactItems({ collectionLog: true, itemsToAdd: loot });

		if (loot.has('Gary')) {
			await user.sync();
			const kcGot = randInt(scoreUpdate.newScore - quantity + 1, scoreUpdate.newScore);
			globalClient.emit(
				Events.ServerNotification,
				`**${user.badgedUsername}'s** minion, ${user.minionName}, just received their ${formatOrdinal(
					user.cl.amount('Gary')
				)} Gary on their ${formatOrdinal(kcGot)} Shades of Mort'ton game!`
			);
		}

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

		handleTripFinish({ user, channelId, message: str, data, loot: itemsAdded });
	}
};
