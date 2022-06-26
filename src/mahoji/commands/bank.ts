import { codeBlock } from '@discordjs/builders';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { Emoji } from '../../lib/constants';
import { Flags } from '../../lib/minions/types';
import { BankSortMethod, BankSortMethods } from '../../lib/sorts';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { filterOption, itemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';

const bankFormats = ['json'] as const;
type BankFormat = typeof bankFormats[number];

export const askCommand: OSBMahojiCommand = {
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
		}
	],
	run: async ({
		user,
		options,
		interaction
	}: CommandRunOptions<{
		page?: number;
		format?: BankFormat;
		search?: string;
		filter?: string;
		item?: string;
		sort?: BankSortMethod;
	}>) => {
		await interaction.deferReply();
		const klasaUser = await globalClient.fetchUser(user.id);
		const baseBank = klasaUser.bank({ withGP: true });

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
			inputStr: options.item,
			user: klasaUser,
			filters: options.filter ? [options.filter] : []
		});

		if (bank.length === 0) {
			return 'No items found.';
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
						user: klasaUser
					})
				).file
			]
		};
	}
};
