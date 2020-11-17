import { CommandStore, KlasaMessage } from 'klasa';
import { Items, Openables } from 'oldschooljs';

import { BotCommand } from '../../lib/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 1,
			usage: '[quantity:int{1}]',
			usageDelim: ' ',
			examples: ['+luckyimp 5'],
			description: 'Simulates opening lucky imps.',
			categoryFlags: ['fun', 'simulation']
		});
	}

	async run(msg: KlasaMessage, [qty = 1]: [number]) {
		if (qty > 10 && msg.author.id !== '157797566833098752') {
			return msg.send(`I can only catch 10 Lucky Imps at a time!`);
		}

		const loot = Openables.LuckyImp.open(qty);

		const opened = `You caught ${qty} Lucky Imp${qty > 1 ? 's' : ''}`;

		if (Object.keys(loot).length === 0) return msg.send(`${opened} and got nothing :(`);

		let display = `${opened} and received...\n`;
		for (const [itemID, quantity] of Object.entries(loot)) {
			display += `**${Items.get(parseInt(itemID))?.name}:** ${quantity.toLocaleString()}`;
			if (itemID === '9185') {
				display += ' <:swampletics:656224747587108912>';
			}
			if (quantity === 73) {
				display += ' <:bpaptu:660333438292983818>';
			}
			display += '\n';
		}

		return msg.sendLarge(display, `loot-from-${qty}-lucky-imps.txt`);
	}
}
