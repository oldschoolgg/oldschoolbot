import { randArrItem, randInt, roll } from '@oldschoolgg/toolkit';
import { Bank, type ItemBank } from 'oldschooljs';

import { inventorOutfit } from '@/lib/data/CollectionsExport.js';
import { MaterialBank } from '@/lib/invention/MaterialBank.js';
import { ClueTable } from '@/lib/simulation/sharedTables.js';
import { SkillsEnum } from '@/lib/skilling/types.js';
import type { TinkeringWorkshopOptions } from '@/lib/types/minions.js';
import { handleTripFinish } from '@/lib/util/handleTripFinish.js';
import { userStatsUpdate } from '@/mahoji/mahojiSettings.js';

function tinkerLoot(user: MUser, quantity: number) {
	const loot = new Bank();
	const effectiveBank = user.allItemsOwned.clone();
	for (let i = 0; i < quantity; i++) {
		const outfitPieceNotOwned = randArrItem(inventorOutfit.filter(p => !effectiveBank.has(p)));
		if (roll(6)) {
			loot.add(ClueTable.roll());
		}
		if (roll(120)) loot.add('Materials bag');
		if (outfitPieceNotOwned && roll(16)) {
			loot.add(outfitPieceNotOwned);
			effectiveBank.add(outfitPieceNotOwned);
		}
	}
	return loot;
}

export const twTask: MinionTask = {
	type: 'TinkeringWorkshop',
	async run(data: TinkeringWorkshopOptions) {
		const { channelID, quantity, duration, userID } = data;
		const user = await mUserFetch(userID);

		await user.incrementMinigameScore('tinkering_workshop', quantity);

		const loot = tinkerLoot(user, quantity);

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let xp = 0;
		for (let i = 0; i < quantity; i++) {
			xp += randInt(8000, 15_000);
		}

		if (data.material === 'junk') xp = Math.floor(xp / 2);

		const xpStr = await user.addXP({ amount: xp, skillName: SkillsEnum.Invention, duration });

		const oldStats = await user.fetchStats({ tinker_workshop_mats_bank: true });
		await userStatsUpdate(user.id, {
			tinker_workshop_mats_bank: new MaterialBank(oldStats.tinker_workshop_mats_bank as ItemBank).add(
				data.material,
				quantity
			).bank,
			tworkshop_xp_gained: {
				increment: xp
			}
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished tinkering with ${quantity}x projects, you received ${loot} and ${xpStr}.`,
			undefined,
			data,
			null
		);
	}
};
