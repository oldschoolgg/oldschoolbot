import { CommandStore, KlasaMessage } from 'klasa';
import { Items } from 'oldschooljs';
import { Item } from 'oldschooljs/dist/meta/types';

import { BotCommand } from '../../lib/structures/BotCommand';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			cooldown: 2,
			oneAtTime: true,
			usage: '<name:str>',
			aliases: ['is'],
			description: 'Debug command for identifying items',
			examples: ['+is Dragon scimitar']
		});
	}

	async run(msg: KlasaMessage, [name]: [string]) {
		const items = Items.filter(i => {
			if (msg.flagArgs.includes) {
				return i.name.toLowerCase().includes(name.toLowerCase());
			}
			return i.name.toLowerCase() === name.toLowerCase();
		}).array();
		if (items.length === 0) return msg.channel.send('No results for that item.');

		const gettedItem = Items.get(name);

		if (msg.flagArgs.raw) {
			return msg.channel.send(`\`\`\`\n${JSON.stringify(gettedItem, null, 4)}\n\`\`\``);
		}

		let str = `Found ${items.length} items:\n${(items as Item[])
			.slice(0, 5)
			.map(
				(item, index) => `${gettedItem!.id === item.id ? '**' : ''}
${index + 1}. ${item.name}[${item.id}] Price[${item.price}] ${
					item.tradeable_on_ge ? 'GE_Tradeable' : 'Not_GE_Tradeable'
				} ${item.tradeable ? 'Tradeable' : 'Not_Tradeable'} ${
					item.incomplete ? 'Incomplete' : 'Not_Incomplete'
				} ${item.duplicate ? 'Duplicate' : 'Not_Duplicate'}${gettedItem!.id === item.id ? '**' : ''} <${
					item.wiki_url
				}>`
			)
			.join('\n')}`;

		if (items.length > 5) {
			str += `\n...and ${items.length - 5} others`;
		}

		return msg.channel.send(str);
	}
}
