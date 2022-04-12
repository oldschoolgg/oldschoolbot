import { CommandStore, KlasaMessage } from 'klasa';
import { Bank, Openables } from 'oldschooljs';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			usage: '[quantity:int{1,5000}]',
			usageDelim: ' ',
			examples: ['+luckyimp 5'],
			description: 'Simulates opening lucky imps.',
			categoryFlags: ['fun', 'simulation']
		});
	}

	async run(msg: KlasaMessage, [qty = 1]: [number]) {
		if (qty > 10 && !this.client.owners.has(msg.author)) {
			return msg.channel.send('I can only catch 10 Lucky Imps at a time!');
		}

		const loot = new Bank(Openables.LuckyImpling.open(qty));

		const opened = `You caught ${qty} Lucky Imp${qty > 1 ? 's' : ''}`;

		if (Object.keys(loot).length === 0) return msg.channel.send(`${opened} and got nothing :(`);

		return msg.channel.sendBankImage({ bank: loot, title: opened });
	}
}
