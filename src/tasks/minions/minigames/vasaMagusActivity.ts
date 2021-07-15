import { randArrItem, randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { DOUBLE_LOOT_ACTIVE, Emoji } from '../../../lib/constants';
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

		user.incrementMonsterScore(VasaMagus.id, quantity);

		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(VasaMagusLootTable.roll());
			loot.add(randArrItem(bossKillables).table.kill(randInt(1, 3), {}));
		}

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
		await user.addItemsToBank(loot, true);

		let resultStr = `${user}, ${user.minionName} finished killing ${quantity}x Vasa Magus.\n\n${Emoji.Casket} **Loot:** ${loot}\n\n${xpRes}`;

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
			undefined,
			data,
			loot.bank
		);
	}
}
