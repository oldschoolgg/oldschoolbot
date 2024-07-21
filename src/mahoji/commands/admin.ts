import { type CommandRunOptions, bulkUpdateCommands, dateFm } from '@oldschoolgg/toolkit';
import type { MahojiUserOption } from '@oldschoolgg/toolkit';
import type { ClientStorage } from '@prisma/client';
import type { InteractionReplyOptions } from 'discord.js';
import { AttachmentBuilder, userMention } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, calcWhatPercent, noOp, notEmpty, randArrItem, sleep, uniqueArr } from 'e';
import { Bank } from 'oldschooljs';
import type { ItemBank } from 'oldschooljs/dist/meta/types';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS, syncBlacklists } from '../../lib/blacklists';
import { boxFrenzy } from '../../lib/boxFrenzy';
import {
	BadgesEnum,
	BitField,
	BitFieldData,
	DISABLED_COMMANDS,
	META_CONSTANTS,
	globalConfig
} from '../../lib/constants';
import { slayerMaskHelms } from '../../lib/data/slayerMaskHelms';
import type { GearSetup } from '../../lib/gear/types';
import { cancelTask, minionActivityCacheDelete } from '../../lib/settings/settings';
import { formatDuration, stringMatches } from '../../lib/util';
import { mahojiClientSettingsFetch, mahojiClientSettingsUpdate } from '../../lib/util/clientSettings';
import getOSItem, { getItem } from '../../lib/util/getOSItem';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction, interactionReply } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { slayerMaskLeaderboardCache } from '../../lib/util/slayerMaskLeaderboard';
import { sendToChannelID } from '../../lib/util/webhook';
import { Cooldowns } from '../lib/Cooldowns';
import { syncCustomPrices } from '../lib/events';
import { itemOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { allAbstractCommands } from '../lib/util';

export const gifs = [
	'https://tenor.com/view/angry-stab-monkey-knife-roof-gif-13841993',
	'https://gfycat.com/serenegleamingfruitbat',
	'https://tenor.com/view/monkey-monito-mask-gif-23036908'
];

const viewableThings: {
	name: string;
	run: (clientSettings: ClientStorage) => Promise<Bank | InteractionReplyOptions>;
}[] = [
	{
		name: 'All Equipped Items',
		run: async () => {
			const res = await prisma.$queryRaw<Record<string, GearSetup | null>[]>`SELECT "gear.melee",
"gear.mage",
"gear.range",
"gear.misc",
"gear.skilling",
"gear.wildy",
"gear.fashion",
"gear.other"
FROM users
WHERE last_command_date > now() - INTERVAL '1 weeks'
AND ("gear.melee" IS NOT NULL OR
"gear.mage" IS NOT NULL OR
"gear.range" IS NOT NULL OR
"gear.misc" IS NOT NULL OR
"gear.skilling" IS NOT NULL OR
"gear.wildy" IS NOT NULL OR
"gear.fashion" IS NOT NULL OR
"gear.other" IS NOT NULL);`;
			const bank = new Bank();
			for (const user of res) {
				for (const gear of Object.values(user)
					.flatMap(i => (i === null ? [] : Object.values(i)))
					.filter(notEmpty)) {
					const item = getItem(gear.item);
					if (item) {
						bank.add(gear.item, gear.quantity);
					}
				}
			}
			return bank;
		}
	},
	{
		name: 'Slayer Mask Leaderboard',
		run: async () => {
			let res = '';

			for (const [maskID, userID] of slayerMaskLeaderboardCache.entries()) {
				const mask = slayerMaskHelms.find(i => i.mask.id === maskID);
				if (!mask) continue;
				res += `${mask.mask.name}: ${userMention(userID)}\n`;
			}

			return {
				content: res,
				allowedMentions: {
					users: []
				}
			};
		}
	},
	{
		name: 'Most Active',
		run: async () => {
			const res = await prisma.$queryRawUnsafe<{ num: number; username: string }[]>(`
SELECT sum(duration)::int as num, "new_user"."username", user_id
FROM activity
INNER JOIN "new_users" "new_user" on "new_user"."id" = "activity"."user_id"::text
WHERE start_date > now() - interval '2 days'
GROUP BY user_id, "new_user"."username"
ORDER BY num DESC
LIMIT 10;
`);
			return {
				content: `Most Active Users in past 48h\n${res
					.map((i, ind) => `${ind + 1} ${i.username}: ${formatDuration(i.num)}`)
					.join('\n')}`
			};
		}
	},
	{
		name: 'Buy GP Sinks',
		run: async () => {
			const result = await prisma.$queryRawUnsafe<{ item_id: string; total_gp_spent: bigint }[]>(`SELECT
  key AS item_id,
  sum((cost_gp / total_items) * value::integer) AS total_gp_spent
FROM
  buy_command_transaction,
  json_each_text(loot_bank),
  (SELECT id, sum(value::integer) as total_items FROM buy_command_transaction, json_each_text(loot_bank) GROUP BY id) subquery
WHERE
  buy_command_transaction.id = subquery.id
GROUP BY
  key
ORDER BY
  total_gp_spent DESC
LIMIT
  20;
`);

			return {
				content: result
					.map(
						(row, index) =>
							`${index + 1}. ${
								getOSItem(Number(row.item_id)).name
							} - ${row.total_gp_spent.toLocaleString()} GP`
					)
					.join('\n')
			};
		}
	},
	{
		name: 'Sell GP Sources',
		run: async () => {
			const result = await prisma.$queryRawUnsafe<{ item_id: number; gp: number }[]>(`select item_id, sum(gp_received) as gp
from bot_item_sell
group by item_id
order by gp desc
limit 80;
`);

			const totalGPGivenOut = await prisma.$queryRawUnsafe<{ total_gp_given_out: number }[]>(`select sum(gp_received) as total_gp_given_out
from bot_item_sell;`);

			return {
				files: [
					new AttachmentBuilder(
						Buffer.from(
							result
								.map(
									(row, index) =>
										`${index + 1}. ${
											getOSItem(Number(row.item_id)).name
										} - ${row.gp.toLocaleString()} GP (${calcWhatPercent(
											row.gp,
											totalGPGivenOut[0].total_gp_given_out
										).toFixed(1)}%)`
								)
								.join('\n')
						),
						{ name: 'output.txt' }
					)
				]
			};
		}
	}
];

export const adminCommand: OSBMahojiCommand = {
	name: 'admin',
	description: 'Allows you to trade items with other players.',
	guildID: globalConfig.mainServerID,
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'shut_down',
			description: 'Shut down the bot without rebooting.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'reboot',
			description: 'Reboot the bot.'
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'sync_commands',
			description: 'Sync commands',
			options: []
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
			name: 'cancel_task',
			description: 'Cancel a users task',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'bypass_age',
			description: 'Bypass age for a user',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
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
			name: 'badges',
			description: 'Manage badges of a user',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'add',
					description: 'The badge to add',
					required: false,
					autocomplete: async () => {
						return Object.keys(BadgesEnum).map(i => ({ name: i, value: i }));
					}
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'remove',
					description: 'The badge to remove',
					required: false,
					autocomplete: async () => {
						return Object.keys(BadgesEnum).map(i => ({ name: i, value: i }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'command',
			description: 'Enable/disable commands',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'disable',
					description: 'The command to disable',
					required: false,
					autocomplete: async (value: string) => {
						const disabledCommands = Array.from(DISABLED_COMMANDS.values());
						return allAbstractCommands(globalClient.mahojiClient)
							.filter(i => !disabledCommands.includes(i.name))
							.filter(i => (!value ? true : i.name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i.name, value: i.name }));
					}
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'enable',
					description: 'The command to enable',
					required: false,
					autocomplete: async () => {
						const disabledCommands = Array.from(DISABLED_COMMANDS.values());
						return allAbstractCommands(globalClient.mahojiClient)
							.filter(i => disabledCommands.includes(i.name))
							.map(i => ({ name: i.name, value: i.name }));
					}
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'set_price',
			description: 'item stats',
			options: [
				{ ...itemOption(), required: true },
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'price',
					description: 'The price to set',
					required: true,
					min_value: 1
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'bitfield',
			description: 'Manage bitfield of a user',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'add',
					description: 'The bitfield to add',
					required: false,
					autocomplete: async value => {
						return Object.entries(BitFieldData)
							.filter(bf => (!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i[1].name, value: i[0] }));
					}
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'remove',
					description: 'The bitfield to remove',
					required: false,
					autocomplete: async value => {
						return Object.entries(BitFieldData)
							.filter(bf => (!value ? true : bf[1].name.toLowerCase().includes(value.toLowerCase())))
							.map(i => ({ name: i[1].name, value: i[0] }));
					}
				}
			]
		},
		// {
		// 	type: ApplicationCommandOptionType.Subcommand,
		// 	name: 'ltc',
		// 	description: 'Ltc?',
		// 	options: [
		// 		{
		// 			...itemOption(),
		// 			name: 'item',
		// 			description: 'The item.',
		// 			required: false
		// 		}
		// 	]
		// },
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'double_loot',
			description: 'Manage double loot',
			options: [
				{
					type: ApplicationCommandOptionType.Boolean,
					name: 'reset',
					description: 'Reset double loot',
					required: false
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'add',
					description: 'Add double loot time',
					required: false
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'view',
			description: 'View something',
			options: [
				{
					type: ApplicationCommandOptionType.String,
					name: 'thing',
					description: 'The thing',
					required: true,
					choices: viewableThings.map(i => ({ name: i.name, value: i.name }))
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'give_items',
			description: 'Spawn items for a user',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'items',
					description: 'The items to give',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'reason',
					description: 'The reason'
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'box_frenzy',
			description: 'Box frenzy',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'amount',
					description: 'The amount',
					required: true,
					min_value: 1,
					max_value: 500
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'lamp_frenzy',
			description: 'Lamp frenzy',
			options: [
				{
					type: ApplicationCommandOptionType.Integer,
					name: 'amount',
					description: 'The amount',
					required: true,
					min_value: 1,
					max_value: 20
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'lottery_dump',
			description: 'lottery_dump',
			options: []
		}
	],
	run: async ({
		options,
		userID,
		interaction,
		guildID,
		channelID
	}: CommandRunOptions<{
		reboot?: {};
		shut_down?: {};
		sync_commands?: {};
		sync_blacklist?: {};
		cancel_task?: { user: MahojiUserOption };
		bypass_age?: { user: MahojiUserOption };
		command?: { enable?: string; disable?: string };
		set_price?: { item: string; price: number };
		bitfield?: { user: MahojiUserOption; add?: string; remove?: string };
		double_loot?: { reset?: boolean; add?: string };
		view?: { thing: string };
		give_items?: { user: MahojiUserOption; items: string; reason?: string };
		box_frenzy?: { amount: number };
		lamp_frenzy?: { amount: number };
	}>) => {
		await deferInteraction(interaction);

		const adminUser = await mUserFetch(userID);
		const isMod = adminUser.bitfield.includes(BitField.isModerator);
		if (!isMod) return randArrItem(gifs);
		if (!guildID || guildID !== globalConfig.mainServerID) return randArrItem(gifs);
		/**
		 *
		 * Mod Only Commands
		 *
		 */
		if (!isMod) return randArrItem(gifs);
		if (options.cancel_task) {
			const { user } = options.cancel_task.user;
			await cancelTask(user.id);
			globalClient.busyCounterCache.delete(user.id);
			Cooldowns.delete(user.id);
			minionActivityCacheDelete(user.id);
			return 'Done.';
		}

		if (options.command) {
			const { disable } = options.command;
			const { enable } = options.command;

			const currentDisabledCommands = (await prisma.clientStorage.findFirst({
				where: { id: globalConfig.clientID },
				select: { disabled_commands: true }
			}))!.disabled_commands;

			const command = allAbstractCommands(globalClient.mahojiClient).find(c =>
				stringMatches(c.name, disable ?? enable ?? '-')
			);
			if (!command) return "That's not a valid command.";

			if (disable) {
				if (currentDisabledCommands.includes(command.name)) {
					return 'That command is already disabled.';
				}
				const newDisabled = [...currentDisabledCommands, command.name.toLowerCase()];
				await prisma.clientStorage.update({
					where: {
						id: globalConfig.clientID
					},
					data: {
						disabled_commands: newDisabled
					}
				});
				DISABLED_COMMANDS.add(command.name);
				return `Disabled \`${command.name}\`.`;
			}
			if (enable) {
				if (!currentDisabledCommands.includes(command.name)) {
					return 'That command is not disabled.';
				}
				await prisma.clientStorage.update({
					where: {
						id: globalConfig.clientID
					},
					data: {
						disabled_commands: currentDisabledCommands.filter(i => i !== command.name)
					}
				});
				DISABLED_COMMANDS.delete(command.name);
				return `Enabled \`${command.name}\`.`;
			}
			return 'Invalid.';
		}
		if (options.set_price) {
			const item = getItem(options.set_price.item);
			if (!item) return 'Invalid item.';
			const { price } = options.set_price;
			if (!price || price < 1 || price > 1_000_000_000) return 'Invalid price.';
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to set the price of \`${item.name}\`(ID: ${item.id}, Wiki: ${
					item.wiki_url
				}) to \`${price.toLocaleString()}\`?`
			);
			const settings = await mahojiClientSettingsFetch({ custom_prices: true });
			const current = settings.custom_prices as ItemBank;
			const newPrices = { ...current, [item.id]: price };
			await mahojiClientSettingsUpdate({
				custom_prices: newPrices
			});
			await syncCustomPrices();
			return `Set the price of \`${item.name}\` to \`${price.toLocaleString()}\`.`;
		}

		if (options.bitfield) {
			const bitInput = options.bitfield.add ?? options.bitfield.remove;
			const user = await mUserFetch(options.bitfield.user.user.id);
			const bitEntry = Object.entries(BitFieldData).find(i => i[0] === bitInput);
			const action: 'add' | 'remove' = options.bitfield.add ? 'add' : 'remove';
			if (!bitEntry) {
				return Object.entries(BitFieldData)
					.map(entry => `**${entry[0]}:** ${entry[1]?.name}`)
					.join('\n');
			}
			const bit = Number.parseInt(bitEntry[0]);

			if (
				!bit ||
				!(BitFieldData as any)[bit] ||
				[7, 8].includes(bit) ||
				(action !== 'add' && action !== 'remove')
			) {
				return 'Invalid bitfield.';
			}

			let newBits = [...user.bitfield];

			if (action === 'add') {
				if (newBits.includes(bit)) {
					return "Already has this bit, so can't add.";
				}
				newBits.push(bit);
			} else {
				if (!newBits.includes(bit)) {
					return "Doesn't have this bit, so can't remove.";
				}
				newBits = newBits.filter(i => i !== bit);
			}

			await user.update({
				bitfield: uniqueArr(newBits)
			});

			return `${action === 'add' ? 'Added' : 'Removed'} '${(BitFieldData as any)[bit].name}' bit to ${
				options.bitfield.user.user.username
			}.`;
		}
		if (options.reboot) {
			globalClient.isShuttingDown = true;
			await interactionReply(interaction, {
				content: 'https://media.discordapp.net/attachments/357422607982919680/1004657720722464880/freeze.gif'
			});
			await sleep(Time.Second * 20);
			await sendToChannelID(globalConfig.generalChannelID, {
				content: `I am shutting down! Goodbye :(

${META_CONSTANTS.RENDERED_STR}`
			}).catch(noOp);
			process.exit();
		}
		if (options.shut_down) {
			debugLog('SHUTTING DOWN');
			globalClient.isShuttingDown = true;
			const timer = Time.Second * 30;
			await interactionReply(interaction, {
				content: `Shutting down in ${dateFm(new Date(Date.now() + timer))}.`
			});
			await sleep(timer);
			await sendToChannelID(globalConfig.generalChannelID, {
				content: `I am shutting down! Goodbye :(

${META_CONSTANTS.RENDERED_STR}`
			}).catch(noOp);
			process.exit(0);
		}

		if (options.sync_blacklist) {
			await syncBlacklists();
			return `Users Blacklisted: ${BLACKLISTED_USERS.size}
Guilds Blacklisted: ${BLACKLISTED_GUILDS.size}`;
		}

		if (options.sync_commands) {
			const global = Boolean(globalConfig.isProduction);
			const totalCommands = Array.from(globalClient.mahojiClient.commands.values());
			const globalCommands = totalCommands.filter(i => !i.guildID);
			const guildCommands = totalCommands.filter(i => Boolean(i.guildID));
			if (global) {
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: globalCommands,
					guildID: null
				});
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: guildCommands,
					guildID: guildID.toString()
				});
			} else {
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: totalCommands,
					guildID: guildID.toString()
				});
			}

			// If not in production, remove all global commands.
			if (!globalConfig.isProduction) {
				await bulkUpdateCommands({
					client: globalClient.mahojiClient,
					commands: [],
					guildID: null
				});
			}

			return `Synced commands ${global ? 'globally' : 'locally'}.
${totalCommands.length} Total commands
${globalCommands.length} Global commands
${guildCommands.length} Guild commands`;
		}

		if (options.view) {
			const thing = viewableThings.find(i => i.name === options.view?.thing);
			if (!thing) return 'Invalid';
			const clientSettings = await mahojiClientSettingsFetch();
			const res = await thing.run(clientSettings);
			if (!(res instanceof Bank)) return res;
			const image = await makeBankImage({
				bank: res,
				title: thing.name,
				flags: { sort: thing.name === 'All Equipped Items' ? 'name' : (undefined as any) }
			});
			return { files: [image.file] };
		}

		if (options.box_frenzy) {
			boxFrenzy(channelID, 'Box Frenzy started!', options.box_frenzy.amount);
			return null;
		}

		return 'Invalid command.';
	}
};
