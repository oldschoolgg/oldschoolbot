import { CommandStore, KlasaMessage } from 'klasa';
import { Bank } from 'oldschooljs';

import { BlowpipeData } from '../../lib/minions/types';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import getOSItem from '../../lib/util/getOSItem';
import { parseStringBank } from '../../lib/util/parseStringBank';

const darts = ['Dragon dart'].map(getOSItem);

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			oneAtTime: true,
			altProtection: true,
			categoryFlags: ['minion', 'pvm', 'minigame'],
			description: 'See your minions achievement diary, and claim the rewards.',
			examples: ['+ad ardougne', '+ad', '+ad claim falador'],
			subcommands: true,
			usage: '[add|uncharge] [items:...str]',
			usageDelim: ' ',
			aliases: ['ad']
		});
	}

	async run(msg: KlasaMessage) {
		const rawBlowpipeData = msg.author.settings.get(UserSettings.Blowpipe);
		const hasBlowpipe = msg.author.owns('Toxic blowpipe');
		if (!hasBlowpipe) {
			return msg.channel.send("You don't own a Toxic blowpipe.");
		}
		if (!rawBlowpipeData) {
			return msg.channel.send('You have nothing in your Toxic blowpipe.');
		}
		const item = getOSItem(rawBlowpipeData.dartID);
		return msg.channel.send(`**Toxic Blowpipe** <:Toxic_blowpipe:887011870068838450>

Zulrah's scales: ${rawBlowpipeData.scales.toLocaleString()}x
${item.name}'s: ${rawBlowpipeData.dartQuantity.toLocaleString()}x
`);
	}

	async add(msg: KlasaMessage, [_items = '']: [string]) {
		const rawBlowpipeData = msg.author.settings.get(UserSettings.Blowpipe);
		const hasBlowpipe = msg.author.owns('Toxic blowpipe');
		if (!hasBlowpipe) {
			return msg.channel.send("You don't own a Toxic blowpipe.");
		}

		const items = parseStringBank(_items);
		let b = new Bank();
		for (const [item, quantity] of items) {
			if (!darts.includes(item) && item !== getOSItem("Zulrah's scales")) {
				return msg.channel.send("You can only charge your blowpipe with darts and zulrah's scales.");
			}
			b.add(item.id, quantity);
			if (b.length >= 2) break;
		}
		const dart = b.items().find(i => darts.includes(i[0]));

		const scales = b.amount("Zulrah's scale");
		// if (Dart[0].id !== rawbpdata.dartid)
		const data: BlowpipeData =
			rawBlowpipeData === null
				? { scales, dartID: dart[0].id, dartQuantity: dart[1] }
				: {
						scales: rawBlowpipeData.scales + scales,
						dartID: dart[0].id,
						dartQuantity: rawBlowpipeData.dartQuantity + dart[1]
				  };

		await msg.author.settings.update(UserSettings.Blowpipe, data);

		const item = data.dartID ? getOSItem(data.dartID) : null;
		return msg.channel.send(`**Toxic Blowpipe** <:Toxic_blowpipe:887011870068838450>

Zulrah's scales: ${data.scales.toLocaleString()}x
${item ? `${item.name}'s: ${data.dartQuantity!.toLocaleString()}x` : 'No darts.'}
`);
	}
}
