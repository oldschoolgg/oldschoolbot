import { randArrItem, randInt } from 'e';
import { Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { bossKillables } from '../../../lib/minions/data/killableMonsters/bosses';
import {
	VasaMagus,
	VasaMagusLootTable
} from '../../../lib/minions/data/killableMonsters/custom/VasaMagus';
import { addMonsterXP } from '../../../lib/minions/functions';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { NewBossOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { sendToChannelID } from '../../../lib/util/webhook';

export default class extends Task {
	async run({ channelID, userID, duration, quantity }: NewBossOptions) {
		const user = await this.client.users.fetch(userID);

		user.incrementMonsterScore(VasaMagus.id, quantity);

		const loot = new Bank();

		for (let i = 0; i < quantity; i++) {
			loot.add(VasaMagusLootTable.roll());
			loot.add(randArrItem(bossKillables).table.kill(randInt(1, 3), {}));
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

		sendToChannelID(this.client, channelID, { content: resultStr });
	}
}
