import { roll } from 'e';
import { Task } from 'klasa';
import { Bank, LootTable } from 'oldschooljs';

import { Naxxus } from '../../../lib/minions/data/killableMonsters/custom/bosses/Naxxus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { trackLoot } from '../../../lib/settings/prisma';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { UserSettings } from '../../../lib/settings/types/UserSettings';
import { ActivityTaskOptionsWithQuantity } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';
import { makeBankImage } from '../../../lib/util/makeBankImage';

export default class extends Task {
	async run(data: ActivityTaskOptionsWithQuantity) {
		const { channelID, userID, quantity, duration } = data;
		const user = await this.client.fetchUser(userID);

		const loot = new Bank();
		loot.add(Naxxus.table.kill(quantity, {}));

		// Handle uniques => Don't give duplicates until log full
		const uniqueChance = 150;
		if (roll(uniqueChance)) {
			const uniques = [
				{ name: 'Dark crystal', weight: 3 },
				{ name: 'Abyssal gem', weight: 2 },
				{ name: 'Tattered tome', weight: 3 },
				{ name: 'Spellbound ring', weight: 2 }
			];
			const cl = user.cl();
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

		await user.incrementMonsterScore(Naxxus.id, quantity);

		announceLoot({
			user,
			monsterID: Naxxus.id,
			loot,
			notifyDrops: Naxxus.notifyDrops
		});

		updateBankSetting(this.client, ClientSettings.EconomyStats.NaxxusLoot, loot);
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
			`${user}, ${user.minionName} finished killing ${quantity} ${Naxxus.name}. Your Naxxus KC is now ${
				user.settings.get(UserSettings.MonsterScores)[Naxxus.id] ?? 0
			}.\n\n${xpStr}`,
			['k', { name: 'Naxxus' }, true],
			image.file.buffer,
			data,
			itemsAdded
		);
	}
}
