import { objectEntries, randArrItem, randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { DOUBLE_LOOT_ACTIVE } from '../../../lib/constants';
import { bossKillables } from '../../../lib/minions/data/killableMonsters/bosses';
import { VasaMagus, VasaMagusLootTable } from '../../../lib/minions/data/killableMonsters/custom/VasaMagus';
import { addMonsterXP } from '../../../lib/minions/functions';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { NewBossOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { handleTripFinish } from '../../../lib/util/handleTripFinish';

export default class extends Task {
	async run(data: NewBossOptions) {
		const { channelID, userID, duration, quantity } = data;
		const user = await this.client.users.fetch(userID);

		await user.incrementMonsterScore(VasaMagus.id, quantity);

		const loot = new Bank();

		const lootOf: Record<string, number> = {};
		for (let i = 0; i < quantity; i++) {
			loot.add(VasaMagusLootTable.roll());
			let mon = randArrItem(bossKillables);
			let qty = randInt(1, 3);
			lootOf[mon.name] = (lootOf[mon.name] ?? 0) + qty;
			loot.add(mon.table.kill(qty, {}));
		}

		let resultStr = `${user}, ${
			user.minionName
		} finished killing ${quantity}x Vasa Magus.\nVasa dropped the loot of ${objectEntries(lootOf)
			.map(l => `${l[1]}x ${l[0]}`)
			.join(', ')}`;

		if (DOUBLE_LOOT_ACTIVE) {
			loot.multiply(2);
		}

		const xpRes = await addMonsterXP(user, {
			monsterID: VasaMagus.id,
			quantity,
			duration,
			isOnTask: false,
			taskQuantity: null
		});
		const { previousCL, itemsAdded } = await user.addItemsToBank(loot, true);

		const { image } = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(
				itemsAdded,
				`Loot From ${quantity} ${VasaMagus.name}:`,
				true,
				{ showNewCL: 1 },
				user,
				previousCL
			);

		resultStr += `\n${xpRes}\n`;

		updateBankSetting(this.client, ClientSettings.EconomyStats.VasaLoot, loot);

		handleTripFinish(
			this.client,
			user,
			channelID,
			resultStr,
			res => {
				user.log('continued vasa');
				return this.client.commands.get('vasa')!.run(res, []);
			},
			image!,
			data,
			itemsAdded
		);
	}
}
