import { chunk, Emoji } from '@oldschoolgg/toolkit';
import { codeBlock, EmbedBuilder } from 'discord.js';
import type { Bank } from 'oldschooljs';

import type { BankFlag } from '@/lib/canvas/bankImage.js';
import { bankFlags } from '@/lib/canvas/bankImage.js';
import { PerkTier } from '@/lib/constants.js';
import { choicesOf, filterOption, itemOption } from '@/lib/discord/index.js';
import type { Flags } from '@/lib/minions/types.js';
import { BankSortMethods } from '@/lib/sorts.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { parseBank } from '@/lib/util/parseStringBank.js';

const bankFormats = ['json', 'text_paged', 'text_full'] as const;
const bankItemsPerPage = 10;

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

export const bankCommand = defineCommand({
	name: 'bank',
	description: 'See your minions bank.',
	options: [
		{
			type: 'Integer',
			name: 'page',
			description: 'The page in your bank you want to see.',
			required: false
		},
		itemOption(),
		{
			type: 'String',
			name: 'items',
			description: 'Type a bank string to lookup'
		},
		{
			type: 'String',
			name: 'format',
			description: 'The format to return your bank in.',
			required: false,
			choices: choicesOf(bankFormats)
		},
		{
			type: 'String',
			name: 'search',
			description: 'Text to search your bank with.',
			required: false
		},
		filterOption,
		{
			type: 'String',
			name: 'sort',
			description: 'The method to sort your bank by.',
			required: false,
			choices: choicesOf(BankSortMethods)
		},
		{
			type: 'String',
			name: 'flag',
			description: 'A particular flag to apply to your bank.',
			required: false,
			choices: choicesOf(bankFlags)
		},
		{
			type: 'String',
			name: 'flag_extra',
			description: 'An additional flag to apply to your bank.',
			required: false,
			choices: choicesOf(bankFlags)
		}
	],
	run: async ({ user, options, interaction }) => {
		if (interaction) await interaction.defer();
		const baseBank = user.bankWithGP;

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
			user,
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
						new EmbedBuilder().setTitle(`${user.usernameOrMention}'s Bank`).setDescription(page.join('\n'))
					]
				});
			}

			return interaction.makePaginatedMessage({ pages });
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
			user,
			bank,
			flags,
			mahojiFlags,
			page: Number(flags.page)
		};

		const result = await getBankPage(params);

		const bankSize = Math.ceil(bank.length / 56);

		if (
			mahojiFlags.includes('show_all') ||
			mahojiFlags.includes('wide') ||
			user.perkTier() < PerkTier.Two ||
			bankSize === 1
		) {
			return result;
		}

		return interaction.makePaginatedMessage({
			pages: {
				numPages: bankSize,
				generate: async ({ currentPage }) => {
					return getBankPage({ ...params, page: currentPage });
				}
			},
			startingPage: Number(flags.page)
		});
	}
});
