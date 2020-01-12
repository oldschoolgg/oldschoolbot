import { Task } from 'klasa';
import { KillableMonsters, Events, Regex } from '../lib/constants';
import { MonsterActivityTaskOptions } from '../lib/types';
import { getMinionName, noOp } from '../lib/util';
import { TextChannel, MessageAttachment, DMChannel } from 'discord.js';
import { KlasaMessage } from 'klasa';

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

		await user.addItemsToBank(loot, true);

		const image = await this.client.tasks
			.get('bankImage')!
			.generateBankImage(loot, `Loot From ${quantity} ${monster.name}:`);

		this.client.emit(
			Events.Log,
			`${user.username}[${user.id}] received Minion Loot - ${logInfo}`
		);

		const str = `${user}, ${getMinionName(user)} finished killing ${quantity} ${
			monster.name
		}.  ${getMinionName(user)} asks if you'd like them to do another trip of ${quantity} ${
			monster.name
		}.`;

		let channel = this.client.channels.get(channelID);
		if (!channel || !(channel instanceof TextChannel) || !channel.postable) {
			channel = await user.createDM();
			if (!channel) return;
		}

		if (!(channel instanceof DMChannel) && !(channel instanceof TextChannel)) {
			return;
		}

		channel.send(str, new MessageAttachment(image));

		channel
			.awaitMessages(mes => mes.author === user && Regex.Yes.test(mes.content), {
				time: 20000,
				max: 1
			})
			.then(messages => {
				const response = messages.first();

				if (response) {
					this.client.commands
						.get('minion')!
						.kill(response as KlasaMessage, [quantity, monster.name]);
				}
			})
			.catch(noOp);
	}
}
