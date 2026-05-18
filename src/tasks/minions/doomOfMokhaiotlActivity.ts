import { Bank, EMonster, type ItemBank, resolveItems } from 'oldschooljs';
import announceLoot from '@/lib/minions/functions/announceLoot.js';

import { DoomDelveKCBank } from '@/lib/doomOfMokhaiotl.js';
import { trackLoot } from '@/lib/lootTrack.js';
import type { DoomTaskOptions } from '@/lib/types/minions.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';

export const doomOfMokhaiotlTask: MinionTask = {
	type: 'DoomOfMokhaiotl',
	async run(data: DoomTaskOptions, { user, handleTripFinish }) {
		const { channelId, loot: possibleLoot, diedAt, targetDelve, duration, kcBank: kcBankJSON } = data;

		// Restore the post-run KCBank that was serialised into the task options.
		// startDoomRun already called kcBank.addDelveKC for every delve that was
		// completed, so we just persist whatever was stored in the task data.
		const kcBank = new DoomDelveKCBank(kcBankJSON as ItemBank);
		await user.statsUpdate({ doom_kc_bank: kcBank._bank });

		const newKCsStr = kcBank
			.entries()
			.filter(([, kc]: [number, number]) => kc > 0)
			.map(([delve, kc]: [number, number]) => `Delve ${delve}: ${kc} KC`)
			.join(', ');
		const newKCStr = newKCsStr.length > 0 ? `Delve KCs: ${newKCsStr}.` : 'No KCs recorded.';

		if (diedAt !== null) {
			return handleTripFinish({
				user,
				channelId,
				message: `${user}, your minion died at delve **${diedAt}** and lost all accumulated loot. ${newKCStr}`,
				data
			});
		}

		const { newKC } = await user.incrementKC(EMonster.DOOM_OF_MOKHAIOTL, 1);

		const loot = new Bank().add(possibleLoot ?? {});
		const { previousCL, itemsAdded } = await user.transactItems({ itemsToAdd: loot, collectionLog: true });

		announceLoot({
			user,
			monsterID: EMonster.DOOM_OF_MOKHAIOTL,
			loot: itemsAdded,
			notifyDrops: resolveItems(['Mokhaiotl cloth', 'Eye of ayak (uncharged)', 'Avernic treads', 'Dom'])
		});

		await ClientSettings.updateBankSetting('doom_loot', itemsAdded);
		await user.statsBankUpdate('doom_loot', itemsAdded);
		await trackLoot({
			totalLoot: itemsAdded,
			id: 'doom_of_mokhaiotl',
			type: 'Monster',
			changeType: 'loot',
			duration,
			kc: 1,
			users: [{ id: user.id, loot: itemsAdded, duration }]
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Doom of Mokhaiotl Loot (Delve ${targetDelve})`,
			user,
			previousCL
		});

		return handleTripFinish({
			user,
			channelId,
			message: {
				content: `${user}, your minion completed delve **${targetDelve}** of the Doom of Mokhaiotl! Overall KC is now ${newKC}. ${newKCStr}`,
				files: [image]
			},
			data,
			loot: itemsAdded
		});
	}
};