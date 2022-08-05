/* eslint-disable @typescript-eslint/no-unused-vars */
import { codeBlock, inlineCode } from '@discordjs/builders';
import { Stopwatch } from '@sapphire/stopwatch';
import Type from '@sapphire/type';
import { isThenable } from '@sentry/utils';
import { Util } from 'discord.js';
import { ApplicationCommandOptionType, CommandRunOptions, InteractionResponseType, InteractionType } from 'mahoji';
import { CommandResponse } from 'mahoji/dist/lib/structures/ICommand';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { bulkUpdateCommands } from 'mahoji/dist/lib/util';
import { inspect } from 'node:util';
import { Bank } from 'oldschooljs';

import { production } from '../../config';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS, syncBlacklists } from '../../lib/blacklists';
import { BitField, OWNER_IDS } from '../../lib/constants';
import { countUsersWithItemInCl, prisma } from '../../lib/settings/prisma';
import { cancelTask, minionActivityCacheDelete } from '../../lib/settings/settings';
import { getItem } from '../../lib/util/getOSItem';
import { logError } from '../../lib/util/logError';
import { makeBankImage } from '../../lib/util/makeBankImage';
import PatreonTask from '../../tasks/patreon';
import { Cooldowns } from '../lib/Cooldowns';
import { itemOption } from '../lib/mahojiCommandOptions';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';

async function unsafeEval({ userID, code }: { userID: string; code: string }) {
	if (!OWNER_IDS.includes(userID)) return { content: 'Unauthorized' };
	code = code.replace(/[“”]/g, '"').replace(/[‘’]/g, "'");
	const stopwatch = new Stopwatch();
	let syncTime = '?';
	let asyncTime = '?';
	let result = null;
	let thenable = false;
	// eslint-disable-next-line @typescript-eslint/init-declarations
	let type!: Type;
	try {
		code = `\nconst {Bank} = require('oldschooljs');\n${code}`;
		// eslint-disable-next-line no-eval
		result = eval(code);
		syncTime = stopwatch.toString();
		type = new Type(result);
		if (isThenable(result)) {
			thenable = true;
			stopwatch.restart();
			result = await result;
			asyncTime = stopwatch.toString();
		}
	} catch (error: any) {
		if (!syncTime) syncTime = stopwatch.toString();
		if (!type) type = new Type(error);
		if (thenable && !asyncTime) asyncTime = stopwatch.toString();
		if (error && error.stack) logError(error);
		result = error;
	}

	stopwatch.stop();
	if (result instanceof Bank) {
		return { files: [await makeBankImage({ bank: result })], rawOutput: result };
	}

	if (Buffer.isBuffer(result)) {
		return {
			content: 'The result was a buffer.',
			rawOutput: 'Buffer'
		};
	}

	if (typeof result !== 'string') {
		result = inspect(result, {
			depth: 1,
			showHidden: false
		});
	}

	return {
		content: `${codeBlock(Util.escapeCodeBlock(result))}
**Type:** ${inlineCode(type.toString())}
**Time:** ${asyncTime ? `⏱ ${asyncTime}<${syncTime}>` : `⏱ ${syncTime}`}
`,
		rawOutput: result
	};
}

async function evalCommand(userID: string, code: string): CommandResponse {
	try {
		if (!OWNER_IDS.includes(userID)) {
			return "You don't have permission to use this command.";
		}
		const res = await unsafeEval({ code, userID });

		if (res.content && res.content.length > 2000) {
			return {
				attachments: [{ buffer: Buffer.from(res.content), fileName: 'output.txt' }]
			};
		}

		return res;
	} catch (err: any) {
		return err.message ?? err;
	}
}

export const adminCommand: OSBMahojiCommand = {
	name: 'admin',
	description: 'Allows you to trade items with other players.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'viewbank',
			description: 'View a users bank.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'reboot',
			description: 'Reboot the bot.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'debug_patreon',
			description: 'Debug patreon.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'eval',
			description: 'Eval.',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'code',
					description: 'Code',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sync_commands',
			description: 'Sync commands',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'global',
					description: 'Global?.',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sync_roles',
			description: 'Sync roles'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'item_stats',
			description: 'item stats',
			options: [{ ...itemOption(), required: true }]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sync_blacklist',
			description: 'Sync blacklist'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'loot_track',
			description: 'Loot track',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'name',
					description: 'The name'
				}
			]
		},
		//
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'cancel_task',
			description: 'Cancel a users task',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user'
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		interaction,
		guildID
	}: CommandRunOptions<{
		viewbank?: { user: MahojiUserOption };
		reboot?: {};
		debug_patreon?: {};
		eval?: { code: string };
		sync_commands?: { global?: boolean };
		sync_roles?: {};
		item_stats?: { item: string };
		sync_blacklist?: {};
		cancel_task?: { user: MahojiUserOption };
		loot_track?: { name: string };
	}>) => {
		const user = await mahojiUsersSettingsFetch(userID);
		const isMod = user.bitfield.includes(BitField.isModerator);
		if (!guildID || !isMod || (production && guildID.toString() !== '342983479501389826')) return 'Unauthorized';

		if (options.cancel_task) {
			const { user } = options.cancel_task.user;
			await cancelTask(user.id);
			globalClient.oneCommandAtATimeCache.delete(user.id);
			globalClient.secondaryUserBusyCache.delete(user.id);
			Cooldowns.delete(user.id);
			minionActivityCacheDelete(user.id);
			return 'Done.';
		}

		if (userID.toString() !== '157797566833098752' || interaction.userID.toString() !== '157797566833098752') {
			return 'Unauthorized';
		}
		const klasaUser = await globalClient.fetchUser(userID);
		if (options.viewbank) {
			const bank = klasaUser.allItemsOwned();
			return { attachments: [(await makeBankImage({ bank, title: klasaUser.username })).file] };
		}
		if (options.reboot) {
			await interaction.respond({
				response: {
					data: {
						content:
							'https://media.discordapp.net/attachments/357422607982919680/1004657720722464880/freeze.gif'
					},
					type: InteractionResponseType.ChannelMessageWithSource
				},
				interaction,
				type: InteractionType.ApplicationCommand
			});
			await Promise.all(globalClient.providers.map(provider => provider.shutdown()));
			process.exit();
		}
		if (options.debug_patreon) {
			const result = await (globalClient.tasks.get('patreon') as PatreonTask).fetchPatrons();
			return {
				attachments: [{ buffer: Buffer.from(JSON.stringify(result, null, 4)), fileName: 'patreon.txt' }]
			};
		}
		if (options.eval) {
			return evalCommand(userID.toString(), options.eval.code);
		}
		if (options.sync_commands) {
			const global = Boolean(options.sync_commands.global);
			await bulkUpdateCommands({
				client: globalClient.mahojiClient,
				commands: globalClient.mahojiClient.commands.values,
				guildID: global ? null : guildID.toString()
			});
			return `Synced commands ${global ? 'globally' : 'locally'}.`;
		}
		if (options.item_stats) {
			const item = getItem(options.item_stats.item);
			if (!item) return 'Invalid item.';
			const isIron = false;
			const ownedResult: any = await prisma.$queryRawUnsafe(`SELECT SUM((bank->>'${item.id}')::int) as qty
FROM users
WHERE bank->>'${item.id}' IS NOT NULL;`);
			return `There are ${ownedResult[0].qty.toLocaleString()} ${item.name} owned by everyone.
There are ${await countUsersWithItemInCl(item.id, isIron)} ${isIron ? 'ironmen' : 'people'} with atleast 1 ${
				item.name
			} in their collection log.`;
		}
		if (options.sync_blacklist) {
			await syncBlacklists();
			return `Users Blacklisted: ${BLACKLISTED_USERS.size}
Guilds Blacklisted: ${BLACKLISTED_GUILDS.size}`;
		}
		return 'Invalid command.';
	}
};
