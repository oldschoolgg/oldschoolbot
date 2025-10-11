import type { TinkeringWorkshopOptions } from '@/lib/bso/bsoTypes.js';
import { inventorOutfit } from '@/lib/bso/collection-log/minigames.js';
import { MaterialBank } from '@/lib/bso/skills/invention/MaterialBank.js';
import { ClueTable } from '@/lib/bso/tables/sharedTables.js';

import { Bank, type ItemBank } from 'oldschooljs';

export const twTask: MinionTask = {
	type: 'TinkeringWorkshop',
	async run(data: TinkeringWorkshopOptions, { user, handleTripFinish, rng }) {
		const { channelID, quantity, duration } = data;

		await user.incrementMinigameScore('tinkering_workshop', quantity);

		const loot = new Bank();
		const effectiveBank = user.allItemsOwned.clone();
		for (let i = 0; i < quantity; i++) {
			const outfitPieceNotOwned = rng.pick(inventorOutfit.filter(p => !effectiveBank.has(p)));
			if (rng.roll(6)) {
				loot.add(ClueTable.roll());
			}
			if (rng.roll(120)) loot.add('Materials bag');
			if (outfitPieceNotOwned && rng.roll(16)) {
				loot.add(outfitPieceNotOwned);
				effectiveBank.add(outfitPieceNotOwned);
			}
		}

		await user.addItemsToBank({ items: loot, collectionLog: true });

		let xp = 0;
		for (let i = 0; i < quantity; i++) {
			xp += rng.randInt(8000, 15_000);
		}

		if (data.material === 'junk') xp = Math.floor(xp / 2);

		const xpStr = await user.addXP({ amount: xp, skillName: 'invention', duration });

		const oldStats = await user.fetchStats();
		await user.statsUpdate({
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
