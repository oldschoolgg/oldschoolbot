import { Bank, EMonster, Items } from 'oldschooljs';

import { DOOM_UNIQUE_ITEMS } from '@/lib/doomOfMokhaiotl.js';
import { trackLoot } from '@/lib/lootTrack.js';
import announceLoot from '@/lib/minions/functions/announceLoot.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const doomOfMokhaiotlTask: MinionTask = {
	type: 'DoomOfMokhaiotl',
	async run(data: DoomTaskOptions, { user, handleTripFinish }) {
		const {
			channelId,
			loot: possibleLoot,
			diedAt,
			targetDelve,
			duration,
			deepDelvesEarned,
			totalWavesCleared,
			deepestDelveCompleted,
			ayakChargesGained
		} = data;

		const currentStats = await user.fetchStats();
		const prevDeepest = Number(currentStats.doom_deepest_delve ?? 0);
		const prevDeepDelves = Number(currentStats.doom_deep_delves ?? 0);
		const prevTotal = Number(currentStats.doom_total_delves ?? 0);

		const newDeepest = Math.max(prevDeepest, deepestDelveCompleted);
		const newDeepDelves = prevDeepDelves + (deepDelvesEarned ?? 0);
		const newTotal = prevTotal + (totalWavesCleared ?? 0);

		await user.statsUpdate({
			doom_deepest_delve: newDeepest,
			doom_deep_delves: newDeepDelves,
			doom_total_delves: newTotal
		});

		await user.update({
			ayak_charges: { increment: ayakChargesGained }
		});

		if (diedAt !== null) {
			const kcSummary = buildKcSummary(newDeepest, newDeepDelves, newTotal);

			const delvesCompleted = deepestDelveCompleted;
			const refundRatio = Math.max(0, 1 - delvesCompleted / targetDelve);
			if (refundRatio > 0) {
				const refund = new Bank();
				const delvesNotDone = targetDelve - delvesCompleted;
				refund.add('Saradomin brew(4)', Math.floor((delvesNotDone / targetDelve) * 10));
				refund.add('Super restore(4)', Math.floor((delvesNotDone / targetDelve) * 10));
				refund.add('Divine ranging potion(4)', Math.floor(delvesNotDone / 5));
				refund.add('Ranging potion(4)', Math.floor(delvesNotDone / 5));
				if (refund.length > 0) {
					await user.addItemsToBank({ items: refund, collectionLog: false });
				}
			}

			return handleTripFinish({
				user,
				channelId,
				message: `${user} Your minion died at delve **${diedAt}** and lost all loot.\n${kcSummary}`,
				data
			});
		}

		const loot = new Bank().add(possibleLoot ?? {});

		const { previousCL, itemsAdded } = await user.transactItems({
			itemsToAdd: loot,
			collectionLog: true
		});

		const stoppedOnUnique = deepestDelveCompleted < targetDelve;

		const uniqueNames = DOOM_UNIQUE_ITEMS.filter((id: number) => loot.has(id))
			.map((id: number) => Items.itemNameFromId(id))
			.join(', ');

		const completionLine = stoppedOnUnique
			? `Your minion stopped at delve **${deepestDelveCompleted}** after receiving a unique: **${uniqueNames}**.`
			: `Your minion completed the Doom of Mokhaiotl up to delve **${deepestDelveCompleted}**.`;

		announceLoot({
			user,
			monsterID: EMonster.DOOM_OF_MOKHAIOTL,
			loot: itemsAdded,
			notifyDrops: DOOM_UNIQUE_ITEMS
		});

		await ClientSettings.updateBankSetting('doom_loot', itemsAdded);
		await user.statsBankUpdate('doom_loot', itemsAdded);
		await trackLoot({
			totalLoot: itemsAdded,
			id: 'doom_of_mokhaiotl',
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: totalWavesCleared ?? 0,
			users: [{ id: user.id, loot: itemsAdded, duration }]
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Doom of Mokhaiotl - Delve ${deepestDelveCompleted}`,
			user,
			previousCL
		});

		const kcSummary = buildKcSummary(newDeepest, newDeepDelves, newTotal);

		return handleTripFinish({
			user,
			channelId,
			message: {
				content: `${user} ${completionLine}\n${kcSummary}`,
				files: [image]
			},
			data,
			loot: itemsAdded
		});
	}
};

function buildKcSummary(deepestDelve: number, deepDelves: number, totalDelves: number): string {
	return `Deepest Delve: **${deepestDelve}** | Deep Delves: **${deepDelves}** | Total Delves: **${totalDelves}**`;
}
