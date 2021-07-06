import { percentChance, randArrItem } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { Ignecarus, IgnecarusLootTable } from '../../../lib/minions/data/killableMonsters/custom/Ignecarus';
import { addMonsterXP } from '../../../lib/minions/functions';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { BossUser } from '../../../lib/structures/Boss';
import { NewBossOptions } from '../../../lib/types/minions';
import { updateBankSetting } from '../../../lib/util';
import { sendToChannelID } from '../../../lib/util/webhook';

const methodsOfDeath = ['Burnt to death', 'Eaten', 'Crushed', 'Incinerated'];

export default class extends Task {
	async run({ channelID, users: idArr, duration, bossUsers: _bossUsers }: NewBossOptions) {
		const wrongFoodDeaths: KlasaUser[] = [];
		const deaths: KlasaUser[] = [];
		const bossUsers: BossUser[] = await Promise.all(
			_bossUsers.map(async u => ({
				...u,
				itemsToRemove: new Bank(u.itemsToRemove),
				user: await this.client.users.fetch(u.user)
			}))
		);

		/**
		 * Deaths
		 */

		for (const { user, deathChance, itemsToRemove } of bossUsers) {
			if (itemsToRemove.has('Saradomin brew(4)')) {
				wrongFoodDeaths.push(user);
				deaths.push(user);
			} else if (percentChance(deathChance)) {
				deaths.push(user);
			}
		}

		const tagAll = bossUsers.map(u => u.user.toString()).join(', ');

		if (wrongFoodDeaths.length === bossUsers.length) {
			return sendToChannelID(this.client, channelID, {
				content: `${tagAll}\n\nYour team began the fight, but the intense heat of the dragons lair melted your potions, and spoiled them - with no food left to eat, your entire team died.`
			});
		}

		if (deaths.length === idArr.length) {
			return sendToChannelID(this.client, channelID, {
				content: `${tagAll}\n\nYour team all died.`
			});
		}

		await Promise.all(bossUsers.map(u => u.user.incrementMonsterScore(Ignecarus.id, 1)));

		const killStr =
			'Your team managed to slay Ignecarus, everyone grabs some loot and escapes from the dragons lair.';

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		const totalLoot = new Bank();
		for (const { user } of bossUsers.filter(u => !deaths.includes(u.user))) {
			const loot = new Bank().add(IgnecarusLootTable.roll());
			totalLoot.add(loot);
			await addMonsterXP(user, {
				monsterID: Ignecarus.id,
				quantity: 1,
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			await user.addItemsToBank(loot, true);
			resultStr += `\n${user} received ${loot}.`;
		}
		updateBankSetting(this.client, ClientSettings.EconomyStats.IgnecarusLoot, totalLoot);

		// Show deaths in the result
		if (deaths.length > 0) {
			resultStr += `\n\n**Died in battle**: ${deaths.map(
				u => `${u.toString()}(${wrongFoodDeaths.includes(u) ? 'Had no food' : randArrItem(methodsOfDeath)})`
			)}.`;
		}

		sendToChannelID(this.client, channelID, { content: resultStr });
	}
}
