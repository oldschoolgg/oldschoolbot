import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import {
	type CommandRunOptions,
	type MahojiUserOption,
	dateFm,
	isValidDiscordSnowflake,
	toTitleCase
} from '@oldschoolgg/toolkit/util';
import { type Prisma, UserEventType, xp_gains_skill_enum } from '@prisma/client';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Duration } from '@sapphire/time-utilities';
import { ApplicationCommandOptionType, SnowflakeUtil, codeBlock } from 'discord.js';
import { Time, objectValues, randArrItem, sumArr } from 'e';
import { Bank, type Item } from 'oldschooljs';

import { ADMIN_IDS, OWNER_IDS, SupportServer, production } from '../../config';
import { BitField, Channel, globalConfig } from '../../lib/constants';
import { allCollectionLogsFlat } from '../../lib/data/Collections';
import type { GearSetupType } from '../../lib/gear/types';
import { GrandExchange } from '../../lib/grandExchange';
import { marketPricemap } from '../../lib/marketPrices';
import { unEquipAllCommand } from '../../lib/minions/functions/unequipAllCommand';
import { unequipPet } from '../../lib/minions/functions/unequipPet';
import { premiumPatronTime } from '../../lib/premiumPatronTime';

import { sql } from '../../lib/postgres';
import { runRolesTask } from '../../lib/rolesTask';
import { TeamLoot } from '../../lib/simulation/TeamLoot';
import { SkillsEnum } from '../../lib/skilling/types';
import type { ItemBank } from '../../lib/types';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import itemIsTradeable from '../../lib/util/itemIsTradeable';
import { logError } from '../../lib/util/logError';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { migrateUser } from '../../lib/util/migrateUser';
import { parseBank } from '../../lib/util/parseStringBank';
import { insertUserEvent } from '../../lib/util/userEvents';
import { sendToChannelID } from '../../lib/util/webhook';
import { cancelUsersListings } from '../lib/abstracted_commands/cancelGEListingCommand';
import { gearSetupOption } from '../lib/mahojiCommandOptions';
import type { OSBMahojiCommand } from '../lib/util';
import { gifs } from './admin';
import { getUserInfo } from './minion';
import { sellPriceOfItem } from './sell';

const itemFilters = [
	{
		name: 'Tradeable',
		filter: (item: Item) => itemIsTradeable(item.id, true),
		run: async () => {
			const isValid = await GrandExchange.extensiveVerification();
			if (isValid) {
				return 'No issues found.';
			}
			return 'Something was invalid. Check logs!';
		}
	}
];

async function usernameSync() {
	const roboChimpUsersToCache = (
		await roboChimpClient.user.findMany({
			where: {
				OR: [
					{
						osb_cl_percent: {
							gte: 80
						}
					},
					{
						bso_total_level: {
							gte: 80
						}
					},
					{
						osb_total_level: {
							gte: 1500
						}
					},
					{
						bso_total_level: {
							gte: 1500
						}
					},
					{
						leagues_points_total: {
							gte: 20_000
						}
					}
				]
			},
			select: {
				id: true
			}
		})
	).map(i => i.id.toString());

	const orConditions: Prisma.UserWhereInput[] = [];
	for (const skill of objectValues(SkillsEnum)) {
		orConditions.push({
			[`skills_${skill}`]: {
				gte: 15_000_000
			}
		});
	}
	const usersToCache = (
		await prisma.user.findMany({
			where: {
				OR: [
					...orConditions,
					{
						last_command_date: {
							gt: new Date(Date.now() - Number(Time.Month))
						}
					}
				],
				id: {
					notIn: roboChimpUsersToCache
				}
			},
			select: {
				id: true
			}
		})
	).map(i => i.id);

	const response: string[] = [];
	const allNewUsers = await prisma.newUser.findMany({
		where: {
			username: {
				not: null
			},
			id: {
				in: [...usersToCache, ...roboChimpUsersToCache]
			}
		},
		select: {
			id: true,
			username: true
		}
	});

	response.push(`Cached ${allNewUsers.length} usernames.`);
	return response.join(', ');
}

function isProtectedAccount(user: MUser) {
	const botAccounts = ['303730326692429825', '729244028989603850', '969542224058654790'];
	if ([...ADMIN_IDS, ...OWNER_IDS, ...botAccounts].includes(user.id)) return true;
	if ([BitField.isModerator].some(bf => user.bitfield.includes(bf))) return true;
	return false;
}

const actions = [
	{
		name: 'validate_ge',
		allowed: (user: MUser) => ADMIN_IDS.includes(user.id) || OWNER_IDS.includes(user.id),
		run: async () => {
			const isValid = await GrandExchange.extensiveVerification();
			if (isValid) {
				return 'No issues found.';
			}
			return 'Something was invalid. Check logs!';
		}
	},
	{
		name: 'sync_roles',
		allowed: (user: MUser) =>
			ADMIN_IDS.includes(user.id) || OWNER_IDS.includes(user.id) || user.bitfield.includes(BitField.isModerator),
		run: async () => {
			return runRolesTask(!globalConfig.isProduction);
		}
	},
	{
		name: 'sync_usernames',
		allowed: (user: MUser) => ADMIN_IDS.includes(user.id) || OWNER_IDS.includes(user.id),
		run: async () => {
			return usernameSync();
		}
	},
	{
		name: 'force_garbage_collection',
		allowed: (user: MUser) => ADMIN_IDS.includes(user.id) || OWNER_IDS.includes(user.id),
		run: async () => {
			const timer = new Stopwatch();
			for (let i = 0; i < 3; i++) {
				gc!();
			}
			return `Garbage collection took ${timer.stop()}`;
		}
	},
	{
		name: 'prismadebug',
		allowed: (user: MUser) => ADMIN_IDS.includes(user.id) || OWNER_IDS.includes(user.id),
		run: async () => {
			const debugs = [
				{
					name: 'pgjs activity select',
					run: async () => {
						await sql`
							SELECT * FROM activity WHERE completed = false AND finish_date < NOW() LIMIT 5;
						`;
					}
				},
				{
					name: 'Raw Activity Select',
					run: async () => {
						await prisma.$queryRawUnsafe(
							'SELECT * FROM activity WHERE completed = false AND finish_date < NOW() LIMIT 5;'
						);
					}
				},
				{
					name: 'Prisma Activity Select',
					run: async () => {
						await prisma.activity.findMany({
							where: {
								completed: false,
								finish_date: {
									lt: new Date()
								}
							},
							take: 5
						});
					}
				},
				{
					name: 'pgjs user select',
					run: async () => {
						await sql`
							SELECT * FROM users WHERE id = '157797566833098752';
						`;
					}
				},
				{
					name: 'muserfetch',
					run: async () => {
						await mUserFetch('157797566833098752');
					}
				},
				{
					name: 'raw user fetch',
					run: async () => {
						await prisma.$queryRawUnsafe("SELECT * FROM users WHERE id = '157797566833098752';");
					}
				}
			];

			let res = '';
			for (const debug of debugs) {
				const results = [];
				for (let i = 0; i < 500; i++) {
					const start = performance.now();
					await debug.run();
					const end = performance.now();
					results.push(end - start);
				}
				const avg = results.reduce((a, b) => a + b, 0) / results.length;
				const max = Math.max(...results);
				const min = Math.min(...results);
				const median = results.sort((a, b) => a - b)[Math.floor(results.length / 2)];
				const obj = { avg, max, min, median };
				res += `${debug.name} took ${Object.entries(obj)
					.map(t => `${t[0]}: ${t[1].toFixed(2)}ms`)
					.join(' | ')}\n`;
			}

			return res;
		}
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
			description: 'Actions',
			options: actions.map(a => ({
				type: ApplicationCommandOptionType.Subcommand,
				name: a.name,
				description: a.name,
				options: []
			}))
		},
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'player',
			description: 'Player manipulation tools',
			options: [
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
		action?: any;
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
			set_buy_date?: {
				user: MahojiUserOption;
				message_id: string;
			};
			view_user?: { user: MahojiUserOption };
			migrate_user?: { source: MahojiUserOption; dest: MahojiUserOption; reason?: string };
			list_trades?: {
				user: MahojiUserOption;
				partner?: MahojiUserOption;
				guild_id?: string;
			};
			ge_cancel?: { user: MahojiUserOption };
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

		if (options.action) {
			for (const action of actions) {
				if (options.action[action.name]) {
					if (!action.allowed(adminUser)) return randArrItem(gifs);
					try {
						const result = await action.run();
						return result;
					} catch (err) {
						logError(err);
						return 'An error occurred.';
					}
				}
			}
		}

		if (options.player?.set_buy_date) {
			const userToCheck = await mUserFetch(options.player.set_buy_date.user.user.id);
			const res = SnowflakeUtil.deconstruct(options.player.set_buy_date.message_id);
			const date = new Date(Number(res.timestamp));

			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to set the buy date of ${userToCheck.usernameOrMention} to ${dateFm(date)}?`
			);
			await sendToChannelID(Channel.BotLogs, {
				content: `${adminUser.logName} set minion buy date of ${userToCheck.logName} to ${dateFm(date)}`
			});
			await userToCheck.update({ minion_bought_date: date });
			return `Set minion buy date of ${userToCheck.usernameOrMention} to ${dateFm(date)}.`;
		}

		if (options.player?.viewbank) {
			const userToCheck = await mUserFetch(options.player.viewbank.user.user.id);
			const bank = userToCheck.allItemsOwned;
			if (options.player?.viewbank.json) {
				const json = JSON.stringify(bank.toJSON());
				if (json.length > 1900) {
					return { files: [{ attachment: Buffer.from(json), name: 'bank.json' }] };
				}
				return `${codeBlock('json', json)}`;
			}
			return { files: [(await makeBankImage({ bank, title: userToCheck.usernameOrMention })).file] };
		}

		if (options.player?.add_patron_time) {
			const { tier, time, user: userToGive } = options.player.add_patron_time;
			const duration = new Duration(time);
			if (![1, 2, 3, 4, 5, 6].includes(tier)) return 'Invalid input.';
			const ms = duration.offset;
			if (ms < Time.Second || ms > Time.Year * 3) return 'Invalid input.';
			const res = await premiumPatronTime(ms, tier, await mUserFetch(userToGive.user.id), interaction);
			return res;
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

		if (options.player?.view_user) {
			const userToView = await mUserFetch(options.player.view_user.user.user.id);
			return (await getUserInfo(userToView)).everythingString;
		}

		if (options.player?.migrate_user) {
			if (!isOwner && !isAdmin) {
				return randArrItem(gifs);
			}

			const { source, dest, reason } = options.player.migrate_user;

			if (source.user.id === dest.user.id) {
				return 'Destination cannot be the same as the source!';
			}
			const sourceUser = await mUserFetch(source.user.id);
			const destUser = await mUserFetch(dest.user.id);

			if (isProtectedAccount(destUser)) return 'You cannot clobber that account.';
			const sourceXp = sumArr(Object.values(sourceUser.skillsAsXP));
			const destXp = sumArr(Object.values(destUser.skillsAsXP));
			if (destXp > sourceXp) {
				await handleMahojiConfirmation(
					interaction,
					`The target user, ${destUser.logName}, has more XP than the source user; are you really sure the names aren't backwards?`
				);
			}
			await handleMahojiConfirmation(
				interaction,
				`Are you 1000%, totally, **REALLY** sure that \`${sourceUser.logName}\` is the account you want to preserve, and \`${destUser.logName}\` is the new account that will have ALL existing data destroyed?`
			);
			const result = await migrateUser(sourceUser, destUser);
			if (result === true) {
				await sendToChannelID(Channel.BotLogs, {
					content: `${adminUser.logName} migrated ${sourceUser.logName} to ${destUser.logName}${
						reason ? `, for ${reason}` : ''
					}`
				});
				return 'Done';
			}
			return result;
		}
		if (options.player?.list_trades) {
			const baseSql =
				'SELECT date, sender::text as sender_id, recipient::text as recipient_id, s.username as sender, r.username as recipient, items_sent, items_received, type, guild_id::text from economy_transaction e inner join new_users s on sender = s.id::bigint inner join new_users r on recipient = r.id::bigint';
			const where: string[] = [];
			if (options.player.list_trades.partner) {
				const inUsers = `(${options.player.list_trades.partner.user.id}, ${options.player.list_trades.user.user.id})`;
				where.push(`(sender IN ${inUsers} AND recipient IN ${inUsers})`);
			} else {
				where.push(
					`(sender = ${options.player.list_trades.user.user.id} OR recipient = ${options.player.list_trades.user.user.id})`
				);
			}
			if (options.player.list_trades.guild_id) {
				where.push(`guild_id = ${options.player.list_trades.guild_id}`);
			}

			const sql = `${`${baseSql} WHERE ${where.join(' AND ')}`} ORDER BY date DESC`;

			let report =
				'date\tguild_id\tsender_id\trecipient_id\tsender\trecipient\tsent_bank\trcvd_bank\tsent_value\trcvd_value\tsent_value_last_100\trcvd_value_last_100\n';

			const totalsSent = new TeamLoot();
			const totalsRcvd = new TeamLoot();
			const result: {
				date: Date;
				sender_id: string;
				recipient_id: string;
				sender: string;
				recipient: string;
				items_sent: ItemBank;
				items_received: ItemBank;
				type: 'gri' | 'trade' | 'giveaway';
				guild_id: string;
			}[] = await prisma.$queryRawUnsafe(sql);
			for (const row of result) {
				const sentBank = new Bank(row.items_sent);
				const recvBank = new Bank(row.items_received);

				// Calculate values of the traded banks:
				let sentValueGuide = 0;
				let sentValueLast100 = 0;
				let recvValueGuide = 0;
				let recvValueLast100 = 0;

				// We use Object.entries(bank) instead of bank.items() so we can filter out deleted/broken items:
				for (const [item, qty] of sentBank.items()) {
					const marketData = marketPricemap.get(item.id);
					if (marketData) {
						sentValueGuide += marketData.guidePrice * qty;
						sentValueLast100 += marketData.averagePriceLast100 * qty;
					} else {
						const { price } = sellPriceOfItem(item, 0);
						sentValueGuide += price * qty;
						sentValueLast100 += price * qty;
					}
				}
				for (const [item, qty] of recvBank.items()) {
					const marketData = marketPricemap.get(item.id);
					if (marketData) {
						recvValueGuide += marketData.guidePrice * qty;
						recvValueLast100 += marketData.averagePriceLast100 * qty;
					} else {
						const { price } = sellPriceOfItem(item, 0);
						recvValueGuide += price * qty;
						recvValueLast100 += price * qty;
					}
				}
				totalsSent.add(row.sender_id, 'Coins', sentValueLast100);
				totalsRcvd.add(row.sender_id, 'Coins', recvValueLast100);
				totalsSent.add(row.recipient_id, 'Coins', recvValueLast100);
				totalsRcvd.add(row.recipient_id, 'Coins', sentValueLast100);

				// Add report row:
				report += `${row.date.toLocaleString('en-us')}\t${row.guild_id}\t${row.sender_id}\t${
					row.recipient_id
				}\t${row.sender}\t${
					row.recipient
				}\t${sentBank}\t${recvBank}\t${sentValueGuide}\t${recvValueGuide}\t${sentValueLast100}\t${recvValueLast100}\n`;
			}
			report += '\n\n';
			report += 'User ID\tTotal Sent\tTotal Received\n';
			for (const [userId, bank] of totalsSent.entries()) {
				report += `${userId}\t${bank}\t${totalsRcvd.get(userId)}\n`;
			}

			return { files: [{ attachment: Buffer.from(report), name: 'trade_report.txt' }] };
		}

		if (options.player?.ge_cancel) {
			const targetUser = await mUserFetch(options.player.ge_cancel.user.user.id);
			await cancelUsersListings(targetUser);
			return `Cancelled listings for ${targetUser}`;
		}

		return 'Invalid command.';
	}
};
