import { MessageAttachment, MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { filterableTypes } from '../../lib/data/filterables';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { parseBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your bank, with all your items and GP.',
			cooldown: 3,
			usage: '[page:int|name:string]',
			requiredPermissions: ['ATTACH_FILES'],
			aliases: ['b'],
			examples: ['+b'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [pageNumberOrItemName]: [number | string | undefined]) {
		await msg.author.settings.sync(true);
		const baseBank = msg.author.bank({ withGP: true });

		if (baseBank.length === 0) {
			return msg.channel.send(
				`You have no items or GP yet ${Emoji.Sad} You can get some GP by using the ${msg.cmdPrefix}daily command, and you can get items by sending your minion to do tasks.`
			);
		}

		const bank = parseBank({
			inputBank: baseBank,
			flags: msg.flagArgs,
			inputStr: typeof pageNumberOrItemName === 'string' ? pageNumberOrItemName : undefined
		});

		if (bank.length === 0) {
			return msg.channel.send('No items found.');
		}
		if (msg.flagArgs.text) {
			const textBank = [];
			for (const [item, qty] of bank.items()) {
				if (msg.flagArgs.search && !item.name.toLowerCase().includes(msg.flagArgs.search.toLowerCase())) {
					continue;
				}

				const filter = msg.flagArgs.filter
					? filterableTypes.find(type => type.aliases.some(alias => msg.flagArgs.filter === alias)) ?? null
					: null;
				if (filter && !filter.items.includes(item.id)) {
					continue;
				}

				if (msg.flagArgs.id) {
					textBank.push(`${item.name} (${item.id.toString()}): ${qty.toLocaleString()}`);
				} else {
					textBank.push(`${item.name}: ${qty.toLocaleString()}`);
				}
			}

			if (textBank.length === 0) {
				return msg.channel.send('No items found.');
			}

			if (msg.flagArgs.full) {
				const attachment = new MessageAttachment(
					Buffer.from(textBank.join('\n')),
					`${msg.author.username}s_Bank.txt`
				);
				return msg.channel.send({
					content: 'Here is your entire bank in txt file format.',
					files: [attachment]
				});
			}

			const loadingMsg = await msg.channel.send({ embeds: [new MessageEmbed().setDescription('Loading...')] });
			const display = new UserRichDisplay();
			display.setFooterPrefix('Page ');

			for (const page of chunk(textBank, 10)) {
				display.addPage(
					new MessageEmbed().setTitle(`${msg.author.username}'s Bank`).setDescription(page.join('\n'))
				);
			}

			await display.start(loadingMsg as KlasaMessage, msg.author.id, {
				jump: false,
				stop: false
			});
			return null;
		}

		return msg.channel.sendBankImage({
			bank: bank.bank,
			title: `${msg.author.username}'s Bank`,
			flags: {
				...msg.flagArgs,
				page: typeof pageNumberOrItemName === 'number' ? pageNumberOrItemName - 1 : 0
			},
			background: msg.author.settings.get(UserSettings.BankBackground),
			user: msg.author,
			gearPlaceholder: msg.author.rawGear()
		});
	}
}
