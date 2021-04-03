import { CommandStore, KlasaMessage } from 'klasa';

import { BotCommand } from '../lib/structures/BotCommand';
import { GiveawayTable } from '../lib/typeorm/GiveawayTable.entity';
import { formatDuration } from '../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your equipped gear.',
			examples: ['+gear melee', '+gear misc'],
			categoryFlags: ['minion', 'skilling']
		});
	}

	async run(msg: KlasaMessage) {
		const existingGiveaways = await GiveawayTable.find({
			userID: msg.author.id,
			completed: false
		});

		if (existingGiveaways.length === 0) {
			return msg.channel.send(`You don't have any active giveaways.`);
		}

		return msg.channel.send(
			`You have ${existingGiveaways.length} active giveaways:\n${existingGiveaways.map(
				(g, i) =>
					`${i + 1}. ${formatDuration(g.finishDate.getTime() - g.startDate.getTime())}`
			)}`
		);
	}
}
