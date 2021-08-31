import { CommandStore, KlasaMessage } from 'klasa';

import { prisma } from '../../lib/settings/prisma';
import { BotCommand } from '../../lib/structures/BotCommand';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: "Shows recent activities you've done.",
			categoryFlags: ['minion', 'utility'],
			examples: ['+activities'],
			aliases: ['log']
		});
	}

	async run(msg: KlasaMessage) {
		const res = await prisma.activity.findMany({
			where: {
				user_id: msg.author.id
			},
			orderBy: {
				id: 'desc'
			}
		});

		return msg.channel.send(
			`**Your last 10 activities:**\n
${res
	.slice(0, 10)
	.map((i, ind) => `${ind + 1}. **${i.type}** trip for **${formatDuration(i.duration)}**`)
	.join('\n')}`
		);
	}
}
