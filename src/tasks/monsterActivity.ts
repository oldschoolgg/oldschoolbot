import { Task } from 'klasa';
import { KillableMonsters } from '../lib/constants';
import { MonsterActivityTaskOptions, Bank } from '../lib/types';
import { addBankToBank, getMinionName } from '../lib/util';
import { Permissions, TextChannel, ClientUser, MessageAttachment } from 'discord.js';

export default class extends Task {
	async run({ monsterID, userID, channelID, quantity }: MonsterActivityTaskOptions) {
		const monster = KillableMonsters.find(mon => mon.id === monsterID);
		const user = await this.client.users.fetch(userID);

		if (!monster || !user) {
			console.log(
				`Missing user or monster... MonsterID[${monsterID}] userID[${userID}] channelID[${channelID}] quantity[${quantity}] `
			);
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

		const str = `${user}, ${getMinionName(user)} finished killing ${quantity} ${monster.name}.`;

		if (
			!channel ||
			!(channel as TextChannel)
				.permissionsFor(this.client.user as ClientUser)!
				.has(Permissions.FLAGS.SEND_MESSAGES)
		) {
			user.send(str, new MessageAttachment(image));
		} else {
			(channel as TextChannel).send(str, new MessageAttachment(image));
		}
	}
}
