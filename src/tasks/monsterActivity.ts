import { Task } from 'klasa';
import { KillableMonsters, Events } from '../lib/constants';
import { MonsterActivityTaskOptions } from '../lib/types';
import { getMinionName } from '../lib/util';
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

		await user.addItemsToBank({ items: loot, collectionLog: true });

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot, `Loot From ${quantity} ${monster.name}:`);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received Minion Loot - ${logInfo}`
		);

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
