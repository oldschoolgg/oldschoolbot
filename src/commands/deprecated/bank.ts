import { codeBlock } from '@sapphire/utilities';
import { MessageAttachment, MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { CommandStore, KlasaMessage } from 'klasa';

import { Emoji } from '../../lib/constants';
import { filterableTypes } from '../../lib/data/filterables';
import { BotCommand } from '../../lib/structures/BotCommand';
import { makePaginatedMessage } from '../../lib/util';
import { makeBankImageKlasa } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';

export default class extends BotCommand {
	public constructor(store: CommandStore, file: string[], directory: string) {
		super(store, file, directory, {
			description: 'Shows your bank, with all your items and GP.',
			usage: '[page:int{1}] [name:...string]',
			usageDelim: ' ',
			requiredPermissionsForBot: ['ATTACH_FILES'],
			aliases: ['b', 'bs'],
			examples: ['+b'],
			categoryFlags: ['minion']
		});
	}

	async run(msg: KlasaMessage, [page = undefined, itemNameOrID = '']: [number | undefined, string | undefined]) {
		await msg.author.settings.sync(true);
		const baseBank = msg.author.bank({ withGP: true });

		if (msg.flagArgs.json) {
			const json = JSON.stringify(baseBank.bank);
			if (json.length > 1900) {
				return msg.channel.send({ files: [new MessageAttachment(Buffer.from(json), 'bank.json')] });
			}
			return msg.channel.send(`${codeBlock('json', json)}`);
		}

		if (msg.commandText === 'bs') {
			if (page && !itemNameOrID) {
				itemNameOrID = String(page);
				page = undefined;
			}
			msg.flagArgs.search = String(itemNameOrID).trim().replace(/"/g, '');
			// Clear item string
			itemNameOrID = '';
		} else if (page && itemNameOrID) {
			itemNameOrID = `${page} ${itemNameOrID}`.trim();
			page = undefined;
		}
		if (!page) page = 1;

		if (msg.flagArgs.smallbank) {
			return msg.channel.send('You now use `/config user toggle name:Small Bank Images` to change this setting.');
		}

		if (baseBank.length === 0) {
			return msg.channel.send(
				`You have no items or GP yet ${Emoji.Sad} You can get some GP by using the ${msg.cmdPrefix}daily command, and you can get items by sending your minion to do tasks.`
			);
		}

		const bank = parseBank({
			inputBank: baseBank,
			flags: msg.flagArgs,
			inputStr: itemNameOrID,
			user: msg.author
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
				if (filter && !filter.items(msg.author).includes(item.id)) {
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

			let pages = [];
			for (const page of chunk(textBank, 10)) {
				pages.push({
					embeds: [
						new MessageEmbed().setTitle(`${msg.author.username}'s Bank`).setDescription(page.join('\n'))
					]
				});
			}

			await makePaginatedMessage(msg, pages);

			return null;
		}

		return msg.channel.send({
			content: 'Try out the new `/bank` slash command!',
			...(await makeBankImageKlasa({
				bank,
				title: `${msg.author.username}'s Bank`,
				flags: {
					...msg.flagArgs,
					page: page - 1
				},
				user: msg.author
			}))
		});
	}
}
