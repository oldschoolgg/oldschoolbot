import { CommandStore, KlasaMessage } from 'klasa';

import { prisma } from '../lib/settings/prisma';
import { BotCommand } from '../lib/structures/BotCommand';
import { formatDuration } from '../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your currently active giveaways.',
			examples: ['+mygiveaways'],
			categoryFlags: ['minion', 'utility']
		});
	}

	async run(msg: KlasaMessage) {
		const existingGiveaways = await prisma.giveaway.findMany({
			where: {
				user_id: msg.author.id,
				completed: false
			}
		});

		if (existingGiveaways.length === 0) {
			return msg.channel.send("You don't have any active giveaways.");
		}

		return msg.channel.send(
			`You have ${existingGiveaways.length} active giveaways:\n${existingGiveaways.map(
				(g, i) => `${i + 1}. ${formatDuration(g.finish_date.getTime() - g.start_date.getTime())}`
			)}`
		);
	}
}
