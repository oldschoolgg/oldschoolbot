import { CommandStore, KlasaMessage } from 'klasa';
import { Worlds } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 120,
			description: 'Shows how many people are playing OSRS.'
		});
	}

	async run(msg: KlasaMessage) {
		await Worlds.fetch();

		const sortedWorlds = Worlds.sort((a, b) => b.players - a.players);
		const totalCount = Worlds.reduce<number>((acc: number, curr) => acc + curr.players, 0);
		const average = totalCount / Worlds.size;
		const highest = sortedWorlds.first();

		return msg.send(`
**Total players on OSRS**: ${totalCount.toLocaleString()}

**Average per world:** ${average.toFixed(2)}
**Highest world:** World ${highest?.number} with ${highest?.players} players
`);
	}
}
