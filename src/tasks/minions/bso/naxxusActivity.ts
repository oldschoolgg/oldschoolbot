import { roll } from 'e';
import { Bank, LootTable } from 'oldschooljs';

import { Naxxus, NaxxusLootTable } from '../../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { trackLoot } from '../../../lib/settings/prisma';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';
import { updateBankSetting } from '../../../mahoji/mahojiSettings';

export const naxxusTask: MinionTask = {
	type: 'Naxxus',
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, userID, quantity, duration } = data;
		const user = await mUserFetch(userID);

		const loot = new Bank();
		loot.add(NaxxusLootTable.roll(quantity));

		// Handle uniques => Don't give duplicates until log full
		const uniqueChance = 150;
		if (roll(uniqueChance)) {
			const uniques = [
				{ name: 'Dark crystal', weight: 2 },
				{ name: 'Abyssal gem', weight: 3 },
				{ name: 'Tattered tome', weight: 2 },
				{ name: 'Spellbound ring', weight: 3 }
			];
			const { cl } = user;
			const filteredUniques = uniques.filter(u => !cl.has(u.name));
			const uniqueTable = filteredUniques.length === 0 ? uniques : filteredUniques;
			const lootTable = new LootTable();
			uniqueTable.map(u => lootTable.add(u.name, 1, u.weight));

			loot.add(lootTable.roll());
		}

		const xpStr = await addMonsterXP(user, {
			monsterID: Naxxus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});

		const { previousCL, itemsAdded } = await user.addItemsToBank({ items: loot, collectionLog: true });

		await user.incrementKC(Naxxus.id, quantity);

		announceLoot({
			user,
			monsterID: Naxxus.id,
			loot,
			notifyDrops: Naxxus.notifyDrops
		});

		updateBankSetting('naxxus_loot', loot);
		await trackLoot({
			duration,
			loot,
			type: 'Monster',
			changeType: 'loot',
			id: Naxxus.name,
			kc: quantity
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
			`${user}, ${user.minionName} finished killing ${quantity} ${
				Naxxus.name
			}. Your Naxxus KC is now ${user.getKC(Naxxus.id)}.\n\n${xpStr}`,
			['k', { name: 'Naxxus' }, true],
			image.file.attachment,
			data,
			itemsAdded
		);
	}
};
