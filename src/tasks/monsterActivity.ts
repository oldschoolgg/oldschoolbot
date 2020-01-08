import { Task } from 'klasa';
import { KillableMonsters, Events } from '../lib/constants';
import { MonsterActivityTaskOptions, Bank } from '../lib/types';
import { addBankToBank, getMinionName } from '../lib/util';
import { TextChannel, MessageAttachment } from 'discord.js';

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity }: MonsterActivityTaskOptions) {
		const monster = KillableMonsters.find(mon => mon.id === monsterID);
		const user = await this.client.users.fetch(userID);

		const logInfo = `MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}]`;

		if (!monster || !user) {
			this.client.emit(Events.Wtf, `Missing user or monster - ${logInfo}`);

			return;
		}

		const loot = monster.table.kill(quantity);

		const channel = this.client.channels.get(channelID);

		await user.settings.sync();
		const newBank: Bank = { ...user.settings.get('bank') };

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot, `Loot From ${quantity} ${monster.name}:`);

		await user.settings.update('bank', addBankToBank(loot, newBank));

		this.client.emit(Events.Log, `User received Minion Loot - ${logInfo}`);

		const str = `${user}, ${getMinionName(user)} finished killing ${quantity} ${monster.name}.`;

		if (!channel) {
			user.send(str, new MessageAttachment(image));
		} else {
			(channel as TextChannel).send(str, new MessageAttachment(image)).catch(() => {
				user.send(str, new MessageAttachment(image));
			});
		}
	}
}
