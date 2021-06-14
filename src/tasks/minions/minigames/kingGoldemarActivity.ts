import { percentChance, randArrItem } from 'e';
import { KlasaUser, Task } from 'klasa';
import { Bank } from 'oldschooljs';

import { Emoji, Events } from '../../../lib/constants';
import KingGoldemar, {
	KingGoldemarLootTable
} from '../../../lib/minions/data/killableMonsters/custom/KingGoldemar';
import { addMonsterXP } from '../../../lib/minions/functions';
import { ClientSettings } from '../../../lib/settings/types/ClientSettings';
import { calcDwwhChance, gpCostPerKill } from '../../../lib/structures/Boss';
import { NewBossOptions } from '../../../lib/types/minions';
import { formatDuration, roll, toKMB, updateBankSetting } from '../../../lib/util';
import { sendToChannelID } from '../../../lib/util/webhook';

const methodsOfDeath = [
	'Beheaded',
	'Skull shattered by Dwarven warhammer',
	'Fatal headbutt from the King',
	'Fell over and neck crushed',
	'Succumbed to blood loss from small wound',
	'Skull broken by a punch',
	'Stabbed in neck',
	'Fell into a lava fountain'
];

export default class extends Task {
	async run({ channelID, users: idArr, duration, bossUsers }: NewBossOptions) {
		const deaths: KlasaUser[] = [];
		const users: KlasaUser[] = await Promise.all(idArr.map(i => this.client.users.fetch(i)));

		const getUser = (id: string) => users.find(u => u.id === id)!;
		const dwwhTable: KlasaUser[] = [];

		for (const { user, deathChance } of bossUsers) {
			if (percentChance(deathChance)) {
				deaths.push(getUser(user));
			} else {
				dwwhTable.push(getUser(user));
			}
		}

		const tagAll = users.map(u => u.toString()).join(', ');
		if (deaths.length === idArr.length) {
			return sendToChannelID(this.client, channelID, {
				content: `${tagAll}\n\nYour team was crushed by King Goldemar, you never stood a chance.`
			});
		}

		await Promise.all(users.map(u => u.incrementMonsterScore(KingGoldemar.id, 1)));

		let dwwhChance = calcDwwhChance(users);

		const gotDWWH = roll(dwwhChance);
		const dwwhRecipient = gotDWWH ? randArrItem(dwwhTable) : null;
		const killStr =
			gotDWWH && dwwhRecipient
				? `${dwwhRecipient?.username} delivers a crushing blow to King Goldemars warhammer, breaking it. The king has no choice but to flee the chambers, **leaving behind his broken hammer.**`
				: `Your team brought King Goldemar to a very weak state, he fled the chambers before he could be killed and escaped through a secret exit, promising to get revenge on you.`;

		let resultStr = `${tagAll}\n\n${killStr}\n\n${Emoji.Casket} **Loot:**`;

		if (gotDWWH && dwwhRecipient) {
			this.client.emit(
				Events.ServerNotification,
				`**${dwwhRecipient?.username}** just received a **Broken dwarven warhammer** in a team of ${users.length}!`
			);
		}

		const totalLoot = new Bank();
		for (const user of users.filter(u => !deaths.includes(u))) {
			const loot = new Bank().add(KingGoldemarLootTable.roll());
			if (dwwhRecipient === user) {
				loot.add('Broken dwarven warhammer');
			}
			totalLoot.add(loot);
			await addMonsterXP(user, {
				monsterID: KingGoldemar.id,
				quantity: 1,
				duration,
				isOnTask: false,
				taskQuantity: null
			});
			await user.addItemsToBank(loot, true);
			resultStr += `\n${user} received ${loot}.`;
		}
		updateBankSetting(this.client, ClientSettings.EconomyStats.KingGoldemarLoot, totalLoot);

		// Show deaths in the result
		if (deaths.length > 0) {
			resultStr += `\n\n**Died in battle**: ${deaths.map(
				u => `${u.toString()}(${randArrItem(methodsOfDeath)})`
			)}.`;
		}

		if (1 > 2) {
			resultStr += `\n\nAt this rate, it will take approximately ${dwwhChance} trips (${formatDuration(
				dwwhChance * duration
			)}) to receive a DWWH, costing ${toKMB(
				dwwhChance * gpCostPerKill(users[0])
			)} GP. 1 in ${dwwhChance}`;
		}

		sendToChannelID(this.client, channelID, { content: resultStr });
	}
}
