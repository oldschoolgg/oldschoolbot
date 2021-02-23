import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';
import { ActivityTable } from '../../lib/typeorm/ActivityTable.entity';
import { formatDuration } from '../../lib/util';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Allows you to simulate dice rolls, or dice your bot GP.',
			requiredPermissions: ['EMBED_LINKS'],
			oneAtTime: true,
			categoryFlags: ['minion', 'utility'],
			examples: ['+dice', '+dice 1m']
		});
	}

	async run(msg: KlasaMessage) {
		const res = await ActivityTable.find({
			where: {
				userID: msg.author.id
			},
			order: {
				finishDate: 'DESC'
			}
		});

		return msg.send(
			`**Your last 10 activities:**\n
${res
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
