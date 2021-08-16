import { CommandStore, KlasaMessage } from 'klasa';

import { BingoInstance, bingoItems } from '../lib/bingo';
import { BotCommand } from '../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows information about BSO',
			examples: ['+bso']
		});
	}

	async run(msg: KlasaMessage) {
		const bingo: BingoInstance = {
			start: new Date('2021-08-14 07:00:00'),
			finish: new Date('2021-08-21 07:00:00')
		};
		let str = `This Bingo started at ${bingo.start.toDateString()} and finishes at ${bingo.finish.toDateString()}\n\n`;
		for (const bingoItem of bingoItems) {
			const result = await bingoItem.check(msg.author, bingo);
			str += `${bingoItem.description}: ${result ? '🟩 ' : '🟥'}\n`;
		}
		return msg.channel.send(str);
	}
}
