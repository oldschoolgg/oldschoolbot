import { MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { BotCommand } from '../../lib/structures/BotCommand';
import { UserRichDisplay } from '../../lib/structures/UserRichDisplay';
import { parseBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your bank, with all your items and GP.',
			cooldown: 30,
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
			return msg.send(
				`You have no items or GP yet ${Emoji.Sad} You can get some GP by using the ${msg.cmdPrefix}daily command, and you can get items by sending your minion to do tasks.`
			);
		}

		const bank = parseBank({
			inputBank: baseBank,
			flags: msg.flagArgs,
			inputStr: typeof pageNumberOrItemName === 'string' ? pageNumberOrItemName : undefined
		});

		if (bank.length === 0) {
			return msg.send(`No items found.`);
		}

		if (msg.flagArgs.text) {
			const textBank = [];
			for (const [item, qty] of bank.items()) {
				if (msg.flagArgs.search && !item.name.toLowerCase().includes(msg.flagArgs.search)) {
					continue;
				}
				textBank.push(`${item.name}: ${qty.toLocaleString()}`);
			}

			if (textBank.length === 0) {
				return msg.send(`No items found.`);
			}

			if (msg.flagArgs.full) {
				return msg.channel.sendFile(
					Buffer.from(textBank.join('\n')),
					`${msg.author.username}s_Bank.txt`,
					'Here is your entire bank in txt file format.'
				);
			}

			const loadingMsg = await msg.send(new MessageEmbed().setDescription('Loading...'));
			const display = new UserRichDisplay();
			display.setFooterPrefix(`Page `);

			for (const page of chunk(textBank, 10)) {
				display.addPage(
					new MessageEmbed()
						.setTitle(`${msg.author.username}'s Bank`)
						.setDescription(page.join('\n'))
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
			user: msg.author
		});
	}
}
