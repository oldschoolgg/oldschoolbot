import { roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { trackLoot } from '../../../lib/lootTrack';
import { Naxxus, NaxxusLootTable } from '../../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import type { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../lib/util/updateBankSetting';

export function rollNaxxusLoot(quantity = 1, cl?: Bank) {
	const loot = new Bank();
	loot.add(NaxxusLootTable.roll(quantity));

	// Handle uniques => Don't give duplicates until log full
	const uniqueChance = 150;
	// Add new uniques to a dummy CL to support multiple uniques per trip.
	const tempClWithNewUniques = cl ? cl.clone() : new Bank();
	for (let i = 0; i < quantity; i++) {
		if (roll(uniqueChance)) {
			const uniques = [
				{ name: 'Dark crystal', weight: 2 },
				{ name: 'Abyssal gem', weight: 3 },
				{ name: 'Tattered tome', weight: 2 },
				{ name: 'Spellbound ring', weight: 3 }
			];

			const filteredUniques = uniques.filter(u => !tempClWithNewUniques.has(u.name));
			const uniqueTable = filteredUniques.length === 0 ? uniques : filteredUniques;
			const lootTable = new LootTable();
			uniqueTable.map(u => lootTable.add(u.name, 1, u.weight));

			const unique = lootTable.roll();
			tempClWithNewUniques.add(unique);
			loot.add(unique);
		}
	}
	return loot;
}

export const naxxusTask: MinionTask = {
	type: 'Naxxus',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, userID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const loot = rollNaxxusLoot(quantity, user.cl);

		const xpStr = await addMonsterXP(user, {
			monsterID: Naxxus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		const { newKC } = await user.incrementKC(Naxxus.id, quantity);

		announceLoot({
			user,
			monsterID: Naxxus.id,
			loot,
			notifyDrops: Naxxus.notifyDrops
		});

		updateBankSetting('naxxus_loot', loot);
		await trackLoot({
			duration,
			totalLoot: loot,
			type: 'Monster',
			changeType: 'loot',
			id: Naxxus.name,
			kc: quantity,
			users: [
				{
					id: user.id,
					loot,
					duration
				}
			]
		});

		const image = await makeBankImage({
			bank: itemsAdded,
			title: `Loot From ${quantity} ${Naxxus.name}:`,
			user,
			previousCL
		});

		handleTripFinish(
			user,
			channelID,
			`${user}, ${user.minionName} finished killing ${quantity} ${Naxxus.name}. Your Naxxus KC is now ${newKC}.\n\n${xpStr}`,
			image.file.attachment,
			data,
			itemsAdded
		);
	}
};
