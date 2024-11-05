import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType, EmbedBuilder, codeBlock } from 'discord.js';
import { chunk } from 'e';
import type { Bank } from 'oldschooljs';

import { PaginatedMessage } from '../../lib/PaginatedMessage';
import type { BankFlag } from '../../lib/bankImage';
import { bankFlags } from '../../lib/bankImage';
import { Emoji, PerkTier } from '../../lib/constants';
import type { Flags } from '../../lib/minions/types';
import type { BankSortMethod } from '../../lib/sorts';
import { BankSortMethods } from '../../lib/sorts';
import { channelIsSendable, makePaginatedMessage } from '../../lib/util';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption, itemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';

const bankFormats = ['json', 'text_paged', 'text_full'] as const;
const bankItemsPerPage = 10;
type BankFormat = (typeof bankFormats)[number];

async function getBankPage({
	user,
	bank,
	mahojiFlags,
	page,
	flags = {}
}: {
	user: MUser;
	bank: Bank;
	page: number;
	mahojiFlags: BankFlag[];
	flags?: Record<string, number | string>;
}) {
	return {
		files: [
			(
				await makeBankImage({
					bank,
					title: `${user.rawUsername ? `${user.rawUsername}'s` : 'Your'} Bank`,
					flags: {
						...flags,
						page
					},
					user,
					mahojiFlags
				})
			).file
		]
	};
}

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
		if (interaction) await deferInteraction(interaction);
		const mUser = await mUserFetch(user.id);
		const baseBank = mUser.bankWithGP;

		const mahojiFlags: BankFlag[] = [];

		if (options.flag) mahojiFlags.push(options.flag);
		if (options.flag_extra) mahojiFlags.push(options.flag_extra);
		if (options.page && options.item) {
			options.item = `${options.page} ${options.item}`.trim();
			options.page = undefined;
		}
		if (!options.page) options.page = 1;

		if (baseBank.length === 0) {
			return `You have no items or GP yet ${Emoji.Sad} You can get some GP by using the \`/minion daily\` command, and you can get items by sending your minion to do tasks.`;
		}

		const bank = parseBank({
			inputBank: baseBank,
			flags: {
				search: options.search,
				filter: options.filter
			},
			inputStr: options.item ?? options.items,
			user: mUser,
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
					files: [{ attachment, name: 'Bank.txt' }]
				};
			}

			const pages = [];
			for (const page of chunk(textBank, bankItemsPerPage)) {
				pages.push({
					embeds: [
						new EmbedBuilder().setTitle(`${mUser.usernameOrMention}'s Bank`).setDescription(page.join('\n'))
					]
				});
			}
			const channel = globalClient.channels.cache.get(channelID.toString());
			if (!channelIsSendable(channel)) return 'Failed to send paginated bank message, sorry.';

			makePaginatedMessage(channel, pages, user.id);
			return { content: 'Here is your selected bank:', ephemeral: true };
		}
		if (options.format === 'json') {
			const json = JSON.stringify(baseBank.toJSON());
			if (json.length > 1900) {
				return { files: [{ attachment: Buffer.from(json), name: 'bank.json' }] };
			}
			return `${codeBlock('json', json)}`;
		}

		const flags: Flags = {
			page: options.page - 1
		};
		if (options.sort) flags.sort = options.sort;

		const params: Parameters<typeof getBankPage>['0'] = {
			user: mUser,
			bank,
			flags,
			mahojiFlags,
			page: Number(flags.page)
		};

		const result = await getBankPage(params);

		const channel = globalClient.channels.cache.get(channelID);
		const bankSize = Math.ceil(bank.length / 56);

		if (
			!channel ||
			!channelIsSendable(channel) ||
			mahojiFlags.includes('show_all') ||
			mahojiFlags.includes('wide') ||
			mUser.perkTier() < PerkTier.Two ||
			bankSize === 1
		) {
			return result;
		}

		const m = new PaginatedMessage({
			pages: {
				numPages: bankSize,
				generate: async ({ currentPage }) => {
					return getBankPage({ ...params, page: currentPage });
				}
			},
			channel,
			startingPage: Number(flags.page)
		});
		m.run([user.id]);
		return {
			content: 'Click the buttons below to view different pages of your bank.',
			ephemeral: true
		};
	}
};
