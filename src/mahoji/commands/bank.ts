import { codeBlock } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { chunk } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions, MessageFlags } from 'mahoji';

import { Emoji } from '../../lib/constants';
import { Flags } from '../../lib/minions/types';
import { BankSortMethod, BankSortMethods } from '../../lib/sorts';
import { channelIsSendable, makePaginatedMessage } from '../../lib/util';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { BankFlag, bankFlags } from '../../tasks/bankImage';
import { filterOption, itemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

const bankFormats = ['json', 'text_paged', 'text_full'] as const;
const bankItemsPerPage = 10;
type BankFormat = typeof bankFormats[number];

export const bankCommand: OSBMahojiCommand = {
	name: 'bank',
	description: 'See your minions bank.',
	options: [
		{
			type: ApplicationCommandOptionType.Integer,
			name: 'page',
			description: 'The page in your bank you want to see.',
			required: false
		},
		itemOption(),
		{
			type: ApplicationCommandOptionType.String,
			name: 'items',
			description: 'Type a bank string to lookup'
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'format',
			description: 'The format to return your bank in.',
			required: false,
			choices: bankFormats.map(i => ({ name: i, value: i }))
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'search',
			description: 'Text to search your bank with.',
			required: false
		},
		filterOption,
		{
			type: ApplicationCommandOptionType.String,
			name: 'sort',
			description: 'The method to sort your bank by.',
			required: false,
			choices: BankSortMethods.map(i => ({ name: i, value: i }))
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'flag',
			description: 'A particular flag to apply to your bank.',
			required: false,
			choices: bankFlags.map(i => ({ name: i, value: i }))
		},
		{
			type: ApplicationCommandOptionType.String,
			name: 'flag_extra',
			description: 'An additional flag to apply to your bank.',
			required: false,
			choices: bankFlags.map(i => ({ name: i, value: i }))
		}
	],
	run: async ({
		user,
		options,
		channelID,
		interaction
	}: CommandRunOptions<{
		page?: number;
		format?: BankFormat;
		search?: string;
		filter?: string;
		item?: string;
		items?: string;
		sort?: BankSortMethod;
		flag?: BankFlag;
		flag_extra?: BankFlag;
	}>) => {
		await interaction.deferReply();
		const klasaUser = await globalClient.fetchUser(user.id);
		await klasaUser.settings.sync(true);
		const baseBank = klasaUser.bank({ withGP: true });
		const mahojiFlags: BankFlag[] = [];

		if (options.flag) mahojiFlags.push(options.flag);
		if (options.flag_extra) mahojiFlags.push(options.flag_extra);
		if (options.page && options.item) {
			options.item = `${options.page} ${options.item}`.trim();
			options.page = undefined;
		}
		if (!options.page) options.page = 1;

		if (baseBank.length === 0) {
			return `You have no items or GP yet ${Emoji.Sad} You can get some GP by using the +daily command, and you can get items by sending your minion to do tasks.`;
		}

		const bank = parseBank({
			inputBank: baseBank,
			flags: {
				search: options.search,
				filter: options.filter
			},
			inputStr: options.item ?? options.items,
			user: klasaUser,
			filters: options.filter ? [options.filter] : []
		});

		if (bank.length === 0) {
			return 'No items found.';
		}

		if (['text_full', 'text_paged'].includes(options.format ?? '')) {
			const textBank = [];
			for (const [item, qty] of bank.items()) {
				if (mahojiFlags.includes('show_id')) {
					textBank.push(`${item.name} (${item.id.toString()}): ${qty.toLocaleString()}`);
				} else {
					textBank.push(`${item.name}: ${qty.toLocaleString()}`);
				}
			}
			if (options.format === 'text_full') {
				const attachment = Buffer.from(textBank.join('\n'));

				return {
					content: 'Here is your selected bank in text file format.',
					attachments: [{ buffer: attachment, fileName: 'Bank.txt' }]
				};
			}

			const pages = [];
			for (const page of chunk(textBank, bankItemsPerPage)) {
				pages.push({
					embeds: [
						new MessageEmbed().setTitle(`${klasaUser.username}'s Bank`).setDescription(page.join('\n'))
					]
				});
			}
			const channel = globalClient.channels.cache.get(channelID.toString());
			if (!channelIsSendable(channel)) return 'Failed to send paginated bank message, sorry.';
			const bankMessage = await channel.send({ embeds: [new MessageEmbed().setDescription('Loading')] });

			makePaginatedMessage(bankMessage, pages, klasaUser);
			return { content: 'Here is your selected bank:', flags: MessageFlags.Ephemeral };
		}
		if (options.format === 'json') {
			const json = JSON.stringify(baseBank.bank);
			if (json.length > 1900) {
				return { attachments: [{ buffer: Buffer.from(json), fileName: 'bank.json' }] };
			}
			return `${codeBlock('json', json)}`;
		}

		let flags: Flags = {
			page: options.page - 1
		};
		if (options.sort) flags.sort = options.sort;

		return {
			attachments: [
				(
					await makeBankImage({
						bank,
						title: `${klasaUser.username}'s Bank`,
						flags,
						user: klasaUser,
						mahojiFlags
					})
				).file
			]
		};
	}
};
