import { objectValues, percentChance, shuffleArr } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji } from '../../../lib/constants';
import { isDoubleLootActive } from '../../../lib/doubleLoot';
import {
	Ignecarus,
	IgnecarusLootTable,
	IgnecarusNotifyDrops
} from '../../../lib/minions/data/killableMonsters/custom/Ignecarus';
import { addMonsterXP } from '../../../lib/minions/functions';
import announceLoot from '../../../lib/minions/functions/announceLoot';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { getUsersCurrentSlayerInfo } from '../../../lib/slayer/slayerUtil';
import { BossUser } from '../../../lib/structures/Boss';
import { NewBossOptions } from '../../../lib/types/minions';
import { addArrayOfNumbers, updateBankSetting } from '../../../lib/util';
import { sendToChannelID } from '../../../lib/util/webhook';

const methodsOfDeath = ['Burnt to death', 'Eaten', 'Crushed', 'Incinerated'];

export default class extends Task {
	async run({ channelID, users: idArr, duration, bossUsers: _bossUsers, quantity, userID }: NewBossOptions) {
		const wrongFoodDeaths: KlasaUser[] = [];
		const deaths: Record<string, { user: KlasaUser; qty: number }> = {};
		const bossUsers: BossUser[] = await Promise.all(
			_bossUsers.map(async u => ({
				...u,
				itemsToRemove: new Bank(u.itemsToRemove),
				user: await this.client.fetchUser(u.user)
			}))
		);

		// Deaths
		for (let i = 0; i < quantity; i++) {
			for (const { user, deathChance, itemsToRemove } of bossUsers) {
				let dead = false;
				if (itemsToRemove.has('Saradomin brew(4)')) {
					wrongFoodDeaths.push(user);
					dead = true;
				}
				if (dead || percentChance(deathChance)) {
					if (deaths[user.id]) deaths[user.id].qty++;
					else deaths[user.id] = { qty: 1, user };
				}
			}
		}

		const tagAll = bossUsers.map(u => u.user.toString()).join(', ');
		if (wrongFoodDeaths.length === bossUsers.length * quantity) {
			return sendToChannelID(this.client, channelID, {
				content: `${tagAll}\n\nYour team began the fight, but the intense heat of the dragons lair melted your potions, and spoiled them - with no food left to eat, your entire team died.`
			});
		}

		if (addArrayOfNumbers(objectValues(deaths).map(d => d.qty)) === idArr.length * quantity) {
			return sendToChannelID(this.client, channelID, {
				content: `${tagAll}\n\nYour team all died.`
			});
		}

		await Promise.all(bossUsers.map(u => u.user.incrementMonsterScore(Ignecarus.id, quantity)));

		const killStr = `Your team managed to slay ${quantity}x Ignecarus, everyone grabs some loot and escapes from the dragons lair.`;

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		const totalLoot = new Bank();
		for (const { user } of bossUsers) {
			const usersTask = await getUsersCurrentSlayerInfo(user.id);
			const isOnTask =
				usersTask.assignedTask !== null &&
				usersTask.currentTask !== null &&
				usersTask.assignedTask.monsters.includes(Ignecarus.id);
			if (isOnTask) {
				usersTask.currentTask!.quantityRemaining = Math.max(
					0,
					usersTask.currentTask!.quantityRemaining - quantity
				);
				await usersTask.currentTask!.save();
			}

			let lootRolls = quantity;
			if (deaths[user.id]) {
				if (deaths[user.id].qty === quantity) continue;
				else lootRolls = quantity - deaths[user.id].qty;
			}
			const loot = new Bank().add(IgnecarusLootTable.roll(lootRolls));
			if (isDoubleLootActive(this.client)) {
				loot.multiply(2);
			}
			totalLoot.add(loot);
			await addMonsterXP(user, {
				monsterID: Ignecarus.id,
				quantity,
				duration,
				isOnTask,
				taskQuantity: quantity
			});
			await user.addItemsToBank(loot, true);
			const purple = Object.keys(loot.bank).some(itemID => IgnecarusNotifyDrops.includes(parseInt(itemID)));
			resultStr += `\n${purple ? Emoji.Purple : ''}${user} received ${loot}.`;

			announceLoot({
				user,
				monsterID: Ignecarus.id,
				loot,
				notifyDrops: IgnecarusNotifyDrops,
				team: {
					leader: await this.client.fetchUser(userID),
					lootRecipient: user,
					size: idArr.length
				}
			});
		}
		updateBankSetting(this.client, ClientSettings.EconomyStats.IgnecarusLoot, totalLoot);

		// Show deaths in the result
		if (objectValues(deaths).length > 0) {
			resultStr += `\n\n**Died in battle**: ${objectValues(deaths).map(
				u =>
					`${u.user.toString()}${u.qty > 1 ? ` x${u.qty}` : ''} (${
						wrongFoodDeaths.includes(u.user)
							? 'Had no food'
							: shuffleArr([...methodsOfDeath])
									.slice(0, u.qty)
									.join(', ')
					})`
			)}.`;
		}

		sendToChannelID(this.client, channelID, { content: resultStr });
	}
}
