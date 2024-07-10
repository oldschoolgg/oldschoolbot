import { dateFm, toTitleCase } from '@oldschoolgg/toolkit';
import type { CommandRunOptions } from '@oldschoolgg/toolkit';
import type { MahojiUserOption } from '@oldschoolgg/toolkit';
import { UserEventType, xp_gains_skill_enum } from '@prisma/client';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { codeBlock } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import { randArrItem } from 'e';
import { Bank } from 'oldschooljs';
import type { Item } from 'oldschooljs/dist/meta/types';

import { ADMIN_IDS, OWNER_IDS, SupportServer, production } from '../../config';
import { calculateCompCapeProgress } from '../../lib/bso/calculateCompCapeProgress';
import { BitField, Channel } from '../../lib/constants';
import { allCollectionLogsFlat } from '../../lib/data/Collections';
import type { GearSetupType } from '../../lib/gear/types';
import { unEquipAllCommand } from '../../lib/minions/functions/unequipAllCommand';
import { unequipPet } from '../../lib/minions/functions/unequipPet';

import { isValidDiscordSnowflake } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { insertUserEvent } from '../../lib/util/userEvents';
import { sendToChannelID } from '../../lib/util/webhook';
import { gearSetupOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { gifs } from './admin';

const itemFilters = [
	{
		name: 'Tradeable',
		filter: (item: Item) => itemIsTradeable(item.id, true)
	}
];

export const rpCommand: OSBMahojiCommand = {
	name: 'rp',
	description: 'Admin tools second set',
	guildID: SupportServer,
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'action',
			description: 'Action tools',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'validate_ge',
					description: 'Validate the g.e.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'patreon_reset',
					description: 'Reset all patreon data.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'force_comp_update',
					description: 'Force the top 100 completionist users to update their completion percentage.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'view_all_items',
					description: 'View all item IDs present in banks/cls.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'analytics_tick',
					description: 'analyticsTick.',
					options: []
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'networth_sync',
					description: 'networth_sync.',
					options: []
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'player',
			description: 'Player manipulation tools',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'givetgb',
					description: 'Give em a tgb',
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
					name: 'set_buy_date',
					description: 'Set the minion buy date of a user.',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'message_id',
							description: 'The message id when they bought their minion.',
							required: true
						}
					]
				},
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
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'json',
							description: 'Get bank in JSON format',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'add_patron_time',
					description: 'Give user temporary patron time.',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: ApplicationCommandOptionType.Integer,
							name: 'tier',
							description: 'The tier to give.',
							required: true,
							choices: [1, 2, 3, 4, 5, 6].map(i => ({ name: i.toString(), value: i }))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'time',
							description: 'The time.',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'unequip_all_items',
					description: 'Force unequip all items from a user.',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							...gearSetupOption,
							required: false
						},
						{
							name: 'all',
							description: 'Unequip all gear slots',
							type: ApplicationCommandOptionType.Boolean,
							required: false
						},
						{
							name: 'pet',
							description: 'Unequip pet also?',
							type: ApplicationCommandOptionType.Boolean,
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'steal_items',
					description: 'Steal items from a user',
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
							description: 'The items to take',
							required: false
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'item_filter',
							description: 'A preconfigured item filter.',
							required: false,
							choices: itemFilters.map(i => ({ name: i.name, value: i.name }))
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'reason',
							description: 'The reason'
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'delete',
							description: 'To delete the items instead'
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'view_user',
					description: 'View a users info',
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
					name: 'migrate_user',
					description: "Migrate a user's minion profile across Discord accounts",
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'source',
							description: 'Source account with data to preserve and migrate',
							required: true
						},
						{
							type: ApplicationCommandOptionType.User,
							name: 'dest',
							description: 'Destination account (any existing data on this account will be deleted)',
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
					name: 'list_trades',
					description: 'Show trades between users',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user',
							required: true
						},
						{
							type: ApplicationCommandOptionType.User,
							name: 'partner',
							description: 'Optional second user, will only show trades between the users',
							required: false
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'guild_id',
							description: 'Optional - Restrict search to this guild.',
							required: false
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'ge_cancel',
					description: 'Cancel GE Listings',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user',
							required: true
						}
					]
				}
			]
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'user_event',
			description: 'Manage user events.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'cl_completion',
					description: 'CL Completion',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user that completed the cl.',
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'cl_name',
							description: 'The cl the user completed',
							required: true,
							autocomplete: async val => {
								return allCollectionLogsFlat
									.map(c => c.name)
									.filter(c => (!val ? true : c.toLowerCase().includes(val.toLowerCase())))
									.map(val => ({ name: val, value: val }));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'message_id',
							description: 'The message id of when they got it',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'max_total',
					description: 'Set max total level or total xp',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user that reached max total xp or level',
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'type',
							description: 'Did they reach max total level or max total xp',
							required: true,
							choices: [
								{ name: UserEventType.MaxTotalLevel, value: UserEventType.MaxTotalLevel },
								{ name: UserEventType.MaxTotalXP, value: UserEventType.MaxTotalXP }
							]
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'message_id',
							description: 'The message id of when they got it',
							required: true
						}
					]
				},
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'max',
					description: 'Set max level/xp, e.g. lvl 99 or 200m in one skill',
					options: [
						{
							type: ApplicationCommandOptionType.User,
							name: 'user',
							description: 'The user that reached max total xp or level',
							required: true
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'type',
							description: 'Did they reach max level or max xp',
							required: true,
							choices: [
								{ name: UserEventType.MaxXP, value: UserEventType.MaxXP },
								{ name: UserEventType.MaxLevel, value: UserEventType.MaxLevel }
							]
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'skill',
							description: 'What skill?',
							required: true,
							autocomplete: async val => {
								return Object.values(xp_gains_skill_enum)
									.filter(s => (!val ? true : s.includes(val.toLowerCase())))
									.map(s => ({ name: s, value: s }));
							}
						},
						{
							type: ApplicationCommandOptionType.String,
							name: 'message_id',
							description: 'The message id of when they got it',
							required: true
						}
					]
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
		user_event?: {
			cl_completion?: { user: MahojiUserOption; cl_name: string; message_id: string };
			max_total?: { user: MahojiUserOption; type: UserEventType; message_id: string };
			max?: { user: MahojiUserOption; type: UserEventType; skill: xp_gains_skill_enum; message_id: string };
		};
		action?: {
			patreon_reset?: {};
			force_comp_update?: {};
		};
		player?: {
			viewbank?: { user: MahojiUserOption; json?: boolean };
			add_patron_time?: { user: MahojiUserOption; tier: number; time: string };
			steal_items?: {
				user: MahojiUserOption;
				items?: string;
				item_filter?: string;
				reason?: string;
				delete?: boolean;
			};
			unequip_all_items?: {
				user: MahojiUserOption;
				gear_setup?: string;
				all?: boolean;
				pet?: boolean;
			};
			view_user?: { user: MahojiUserOption };
		};
	}>) => {
		await deferInteraction(interaction);

		const adminUser = await mUserFetch(userID);
		const isOwner = OWNER_IDS.includes(userID.toString());
		const isAdmin = ADMIN_IDS.includes(userID);
		const isMod = isOwner || isAdmin || adminUser.bitfield.includes(BitField.isModerator);
		if (!guildID || (production && guildID.toString() !== SupportServer)) return randArrItem(gifs);
		if (!isAdmin && !isMod) return randArrItem(gifs);

		if (options.user_event) {
			const messageId =
				options.user_event.cl_completion?.message_id ??
				options.user_event.max?.message_id ??
				options.user_event.max_total?.message_id;
			if (!messageId || !isValidDiscordSnowflake(messageId)) return null;

			const snowflake = DiscordSnowflake.timestampFrom(messageId);
			const date = new Date(snowflake);
			const userId =
				options.user_event.cl_completion?.user.user.id ??
				options.user_event.max?.user.user.id ??
				options.user_event.max_total?.user.user.id;
			if (!userId) return null;
			const targetUser = await mUserFetch(userId);
			let type: UserEventType = UserEventType.CLCompletion;
			let skill = undefined;
			let collectionLogName = undefined;

			let confirmationStr = `Please confirm:
User: ${targetUser.rawUsername}
Date: ${dateFm(date)}`;
			if (options.user_event.cl_completion) {
				confirmationStr += `\nCollection log: ${options.user_event.cl_completion.cl_name}`;
				type = UserEventType.CLCompletion;
				collectionLogName = options.user_event.cl_completion.cl_name;
			}
			if (options.user_event.max) {
				confirmationStr += `\nSkill: ${options.user_event.max.skill}`;
				type = options.user_event.max.type;
				skill = options.user_event.max.skill;
			}
			if (options.user_event.max_total) {
				type = options.user_event.max_total.type;
			}
			await handleMahojiConfirmation(interaction, confirmationStr);
			await insertUserEvent({
				userID: targetUser.id,
				type,
				skill,
				collectionLogName,
				date
			});
			await sendToChannelID(Channel.BotLogs, {
				content: `${adminUser.logName} created userevent for ${targetUser.logName}: ${type} ${dateFm(date)} ${
					skill ?? ''
				}`
			});
			return `Done: ${confirmationStr.replace('Please confirm:', '')}`;
		}

		if (!isMod) return randArrItem(gifs);

		if (!guildID || (production && guildID.toString() !== SupportServer)) return randArrItem(gifs);

		if (!isMod) return randArrItem(gifs);
		// Mod+ only commands:
		if (options.action?.force_comp_update) {
			const usersToUpdate = await prisma.userStats.findMany({
				where: {
					untrimmed_comp_cape_percent: {
						not: null
					}
				},
				orderBy: {
					untrimmed_comp_cape_percent: 'desc'
				},
				take: 100
			});
			for (const user of usersToUpdate) {
				await calculateCompCapeProgress(await mUserFetch(user.user_id.toString()));
			}
			return 'Done.';
		}

		if (options.player?.viewbank) {
			const userToCheck = await mUserFetch(options.player.viewbank.user.user.id);
			const bank = userToCheck.allItemsOwned;
			if (options.player?.viewbank.json) {
				const json = JSON.stringify(bank.bank);
				if (json.length > 1900) {
					return { files: [{ attachment: Buffer.from(json), name: 'bank.json' }] };
				}
				return `${codeBlock('json', json)}`;
			}
			return { files: [(await makeBankImage({ bank, title: userToCheck.usernameOrMention })).file] };
		}

		// Unequip Items
		if (options.player?.unequip_all_items) {
			if (!isOwner && !isAdmin) {
				return randArrItem(gifs);
			}
			const allGearSlots = ['melee', 'range', 'mage', 'misc', 'skilling', 'other', 'wildy', 'fashion'];
			const opts = options.player.unequip_all_items;
			const targetUser = await mUserFetch(opts.user.user.id);
			const warningMsgs: string[] = [];
			if (targetUser.minionIsBusy) warningMsgs.push("User's minion is busy.");
			const gearSlot = opts.all
				? 'all'
				: opts.gear_setup && allGearSlots.includes(opts.gear_setup)
					? opts.gear_setup
					: undefined;
			if (gearSlot === undefined) {
				return 'No gear slot specified.';
			}
			await handleMahojiConfirmation(
				interaction,
				`Unequip ${gearSlot} gear from ${targetUser.usernameOrMention}?${
					warningMsgs.length > 0 ? warningMsgs.join('\n') : ''
				}`
			);
			const slotsToUnequip = gearSlot === 'all' ? allGearSlots : [gearSlot];

			for (const gear of slotsToUnequip) {
				const result = await unEquipAllCommand(targetUser.id, gear as GearSetupType, true);
				if (!result.endsWith('setup.')) return result;
			}

			let petResult = '';
			if (opts.pet) {
				petResult = await unequipPet(targetUser);
			}
			return `Successfully removed ${gearSlot} gear.${opts.pet ? ` ${petResult}` : ''}`;
		}

		// Steal Items
		if (options.player?.steal_items) {
			if (!isOwner && !isAdmin) {
				return randArrItem(gifs);
			}
			const toDelete = options.player.steal_items.delete ?? false;
			const actionMsg = toDelete ? 'delete' : 'steal';
			const actionMsgPast = toDelete ? 'deleted' : 'stole';

			const userToStealFrom = await mUserFetch(options.player.steal_items.user.user.id);

			const items = new Bank();
			if (options.player.steal_items.item_filter) {
				const filter = itemFilters.find(i => i.name === options.player?.steal_items?.item_filter);
				if (!filter) return 'Invalid item filter.';
				for (const [item, qty] of userToStealFrom.bank.items()) {
					if (filter.filter(item)) {
						items.add(item.id, qty);
					}
				}
			} else {
				items.add(
					parseBank({
						inputStr: options.player.steal_items.items,
						noDuplicateItems: true,
						inputBank: userToStealFrom.bankWithGP
					})
				);
			}
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to ${actionMsg} ${items.toString().slice(0, 500)} from ${
					userToStealFrom.usernameOrMention
				}?`
			);
			let missing = new Bank();
			if (!userToStealFrom.owns(items)) {
				missing = items.clone().remove(userToStealFrom.bankWithGP);
				return `${userToStealFrom.mention} doesn't have all items. Missing: ${missing
					.toString()
					.slice(0, 500)}`;
			}

			await sendToChannelID(Channel.BotLogs, {
				content: `${adminUser.logName} ${actionMsgPast} \`${items.toString().slice(0, 500)}\` from ${
					userToStealFrom.logName
				} for ${options.player.steal_items.reason ?? 'No reason'}`,
				files: [{ attachment: Buffer.from(items.toString()), name: 'items.txt' }]
			});

			await userToStealFrom.removeItemsFromBank(items);
			if (!toDelete) await adminUser.addItemsToBank({ items, collectionLog: false });
			return `${toTitleCase(actionMsgPast)} ${items.toString().slice(0, 500)} from ${userToStealFrom.mention}`;
		}

		return 'Invalid command.';
	}
};
