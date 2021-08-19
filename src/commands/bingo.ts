import { CommandStore, KlasaMessage } from 'klasa';

import { bingo, bingoItems } from '../lib/bingo';
import { BotCommand } from '../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows information about BSO',
			examples: ['+bso']
		});
	}

	async run(msg: KlasaMessage) {
		let str = `This Bingo started at ${bingo.start.toDateString()} and finishes at ${bingo.finish.toDateString()}\n\n`;
		for (const category of ['Skilling', 'PvM']) {
			str += `**${category}**\n`;
			for (const item of bingoItems.filter(c => c.category === category)) {
				const result = await item.check(msg.author, bingo);
				str += `${item.description}: ${result ? '🟩 ' : '🟥'}\n`;
			}
		}

		return msg.channel.send(str);
	}
}
