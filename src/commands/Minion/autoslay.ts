
import { CommandStore, KlasaMessage } from 'klasa';

import { minionNotBusy, requiresMinion } from '../../lib/minions/decorators';

import { getUsersCurrentSlayerInfo } from '../../lib/slayer/slayerUtil';
import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			altProtection: true,
			oneAtTime: true,
			cooldown: 1,
			usage: '',
			aliases: ['as', 'slay'],
			usageDelim: ' ',
			description: 'Sends your minion to kill your slayer monster monsters.'
		});
	}

	@requiresMinion
	@minionNotBusy
	async run(msg: KlasaMessage) {

		const usersTask = await getUsersCurrentSlayerInfo(msg.author.id);
		const isOnTask = usersTask.assignedTask !== null && usersTask.currentTask !== null;

		if (!isOnTask) {
			return msg.channel.send(`You're not on a slayer task, so you can't autoslay!`);
		}

		return this.client.commands.get('k')?.run(msg, [null, usersTask.assignedTask!.monster.name]);


	}
}
