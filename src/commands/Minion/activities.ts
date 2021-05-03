import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTable } from '../../lib/typeorm/ActivityTable.entity';
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
		const res = await ActivityTable.find({
			where: {
				userID: msg.author.id
			},
			order: {
				id: 'DESC'
			}
		});

		return msg.send(
			`**Your last 10 activities:**\n
${res
	.slice(0, 10)
	.map(
		(i, ind) =>
			`${ind + 1}. **${i.type}** trip for **${formatDuration(i.duration)}**, got ${
				i.loot ? `${new Bank(i.loot).length} items` : 'no loot'
			}`
	)
	.join('\n')}`
		);
	}
}
