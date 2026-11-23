import { ButtonBuilder, ButtonStyle, codeBlock, dateFm, EmbedBuilder, InteractionID } from '@oldschoolgg/discord';
import { type GearSetupType, GearSetupTypes } from '@oldschoolgg/gear';
import { CHANNELS, sumArr, toTitleCase } from '@oldschoolgg/toolkit';
import { isValidDiscordSnowflake } from '@oldschoolgg/util';
import { DiscordSnowflake } from '@sapphire/snowflake';
import { Bank, type Item, type ItemBank } from 'oldschooljs';

import { activity_type_enum, command_name_enum, UserEventType, xp_gains_skill_enum } from '@/prisma/main/enums.js';
import { choicesOf, gearSetupOption } from '@/discord/index.js';
import { marketPricemap } from '@/lib/cache.js';
import { CanvasModule } from '@/lib/canvas/CanvasModule.js';
import { GeImageGenerator } from '@/lib/canvas/geImage.js';
import { OSRSCanvas } from '@/lib/canvas/OSRSCanvas.js';
import { Channel, globalConfig } from '@/lib/constants.js';
import { allCollectionLogsFlat, allDcSet } from '@/lib/data/Collections.js';
import { type GEListingWithTransactions, GrandExchange, geListingToString } from '@/lib/grandExchange.js';
import { unEquipAllCommand } from '@/lib/minions/functions/unequipAllCommand.js';
import { unequipPet } from '@/lib/minions/functions/unequipPet.js';
import { runRolesTask } from '@/lib/rolesTask.js';
import { TeamLoot } from '@/lib/simulation/TeamLoot.js';
import {
	autocompleteStaffBestowRewards,
	canUserBestow,
	MAX_STAFF_BESTOW_QUANTITY,
	sendStaffBestowReward
} from '@/lib/staffBestow.js';
import { dmCyrAudit } from '@/lib/util/cyrAudit.js';
import itemIsTradeable from '@/lib/util/itemIsTradeable.js';
import { makeBankImage } from '@/lib/util/makeBankImage.js';
import { migrateUser } from '@/lib/util/migrateUser.js';
import { parseBank } from '@/lib/util/parseStringBank.js';
import { insertUserEvent } from '@/lib/util/userEvents.js';
import { gifs } from '@/mahoji/commands/admin.js';
import { getUserInfo } from '@/mahoji/commands/minion.js';
import { sellPriceOfItem } from '@/mahoji/commands/sell.js';
import { cancelUsersListings } from '@/mahoji/lib/abstracted_commands/cancelGEListingCommand.js';
import { gearViewCommand } from '@/mahoji/lib/abstracted_commands/gearCommands.js';
import {
	historyAutocomplete,
	recentActivities,
	recentCommands,
	specificActivity,
	specificCommand
} from '@/mahoji/lib/abstracted_commands/playerData.js';

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

function isProtectedAccount(user: MUser) {
	const botAccounts = ['303730326692429825', '729244028989603850', '969542224058654790'];
	if (botAccounts.includes(user.id)) return true;
	return user.isModOrAdmin;
}

type StealItemsOptions = {
	delete?: boolean;
	user: {
		user: {
			id: string;
		};
	};
	item_filter?: string;
	items?: string;
	reason?: string;
};

function allowedChannel(channelId: string): { success: true } | { success: false; message: string } {
	if (
		globalConfig.isProduction &&
		![Channel.CyrCommandsChannel, CHANNELS.MODERATORS, CHANNELS.MODERATORS_COMMANDS].includes(channelId)
	) {
		return {
			success: false,
			message: `You can only use this command in <#${CHANNELS.MODERATORS}> or <#${CHANNELS.MODERATORS_COMMANDS}>.`
		};
	}
	return { success: true };
}

async function handleStealItems({
	adminUser,
	interaction,
	rng,
	stealItemsOptions
}: {
	adminUser: MUser;
	interaction: MInteraction;
	rng: RNGProvider;
	stealItemsOptions: StealItemsOptions;
}): CommandResponse {
	if (!adminUser.isModOrAdmin) {
		return rng.pick(gifs);
	}
	if (!adminUser.isAdmin) {
		const restricted = allowedChannel(interaction.channelId);
		if (!restricted.success) return restricted.message;
	}
	const toDelete = stealItemsOptions.delete ?? false;
	const actionMsg = toDelete ? 'delete' : 'steal';
	const actionMsgPast = toDelete ? 'deleted' : 'stole';

	const userToStealFrom = await mUserFetch(stealItemsOptions.user.user.id);

	if (userToStealFrom.isAdmin) return rng.pick(gifs);

	const items = new Bank();
	if (stealItemsOptions.item_filter) {
		const filter = itemFilters.find(i => i.name === stealItemsOptions.item_filter);
		if (!filter) return 'Invalid item filter.';
		for (const [item, qty] of userToStealFrom.bank.items()) {
			if (filter.filter(item)) {
				items.add(item.id, qty);
			}
		}
	} else {
		items.add(
			parseBank({
				inputStr: stealItemsOptions.items,
				noDuplicateItems: true,
				inputBank: userToStealFrom.bankWithGP
			})
		);
	}
	if (items.length === 0) {
		return `${userToStealFrom.mention} doesn't have those items, or they don't exist.`;
	}
	const containsDiscontinued = items.itemIDs.some(i => allDcSet.has(i));
	await interaction.confirmation(
		`Are you sure you want to ${actionMsg} ${items.toString().slice(0, 500)} from ${
			userToStealFrom.usernameOrMention
		}?`
	);
	let missing = new Bank();
	if (!userToStealFrom.owns(items)) {
		missing = items.clone().remove(userToStealFrom.bankWithGP);
		return `${userToStealFrom.mention} doesn't have all items. Missing: ${missing.toString().slice(0, 500)}`;
	}

	const auditMessage = {
		content: `${adminUser.logName} ${actionMsgPast} \`${items.toString().slice(0, 500)}\` from ${
			userToStealFrom.logName
		} for ${stealItemsOptions.reason ?? 'No reason'}`,
		files: [{ buffer: Buffer.from(items.toString()), name: 'items.txt' }]
	};
	await globalClient.sendMessage(Channel.BotLogs, auditMessage);
	if (!adminUser.isAdmin && (!adminUser.isGameHacker || containsDiscontinued)) {
		await dmCyrAudit(auditMessage.content, auditMessage.files);
	}

	await userToStealFrom.removeItemsFromBank(items);
	if (!toDelete) await adminUser.addItemsToBank({ items, collectionLog: false });
	return `${toTitleCase(actionMsgPast)} ${items.toString().slice(0, 500)} from ${userToStealFrom.mention}`;
}

async function generateAdminGEListingsImage({
	user,
	listingData,
	unlockedSlots,
	trim
}: {
	user: MUser;
	listingData: GEListingWithTransactions[];
	unlockedSlots: number;
	trim?: true;
}) {
	await CanvasModule.waitTillReady();
	if (!GeImageGenerator.ready) await GeImageGenerator.init();

	const rowLength = 4;
	const startY = 78;
	const slotCount =
		Math.ceil(
			(trim ? Math.max(listingData.length, rowLength) : Math.max(listingData.length, unlockedSlots)) / rowLength
		) * rowLength;
	const rowCount = Math.max(1, slotCount / rowLength);
	const height = startY + rowCount * GeImageGenerator.geSlotOpen!.height + (rowCount - 1) * 10 + 10;
	const canvas = new OSRSCanvas({ width: GeImageGenerator.geInterface!.width, height });
	const ctx = canvas.ctx;
	const interfaceImage = GeImageGenerator.geInterface!;
	const bodyHeight = interfaceImage.height - 38;

	for (let y = 34; y < canvas.height - 3; y += bodyHeight) {
		const drawHeight = Math.min(bodyHeight, canvas.height - 3 - y);
		ctx.drawImage(interfaceImage, 4, 34, canvas.width - 8, drawHeight, 4, y, canvas.width - 8, drawHeight);
	}
	ctx.drawImage(interfaceImage, 0, 0, canvas.width, 34, 0, 0, canvas.width, 34);
	ctx.fillStyle = '#4b463c';
	ctx.fillRect(4, 4, canvas.width - 8, 26);
	ctx.fillStyle = '#1d1b18';
	ctx.fillRect(0, 31, canvas.width, 3);
	ctx.fillRect(0, canvas.height - 3, canvas.width, 3);
	ctx.fillRect(0, 0, 3, canvas.height);
	ctx.fillRect(canvas.width - 3, 0, 3, canvas.height);

	const title = `${user.username}'s Listings`;
	const slots = `Slots Used: ${listingData.length} of ${unlockedSlots}`;
	const timestamp = new Date()
		.toISOString()
		.replace('T', ' ')
		.replace(/\.\d{3}Z$/, '');
	const userID = `ID: ${user.id}`;
	canvas.drawTitleText({ text: title, x: 16, y: 20 });
	canvas.drawTitleText({ text: slots, x: canvas.width - 16 - canvas.measureTextWidth(slots, 'Bold'), y: 20 });
	canvas.drawTitleText({ text: timestamp, x: 16, y: 56 });
	canvas.drawTitleText({ text: userID, x: canvas.width - 16 - canvas.measureTextWidth(userID, 'Bold'), y: 56 });

	await GeImageGenerator.addInterfaceSlots(canvas, listingData, {
		unlockedSlots,
		trim,
		rowLength,
		startY,
		user
	});

	return canvas.toScaledOutput(2);
}

export const rpCommand = defineCommand({
	name: 'rp',
	description: 'Admin tools second set',
	guildId: globalConfig.supportServerID,
	options: [
		{
			type: 'Subcommand',
			name: 'bestow',
			description: 'Bestow a staff reward.',
			options: [
				{
					type: 'String',
					name: 'reward',
					description: 'The reward to bestow.',
					required: true,
					autocomplete: autocompleteStaffBestowRewards
				},
				{
					type: 'User',
					name: 'user',
					description: 'The user to receive the reward.',
					required: true
				},
				{
					type: 'Integer',
					name: 'quantity',
					description: 'The quantity to bestow.',
					required: false,
					min_value: 1,
					max_value: MAX_STAFF_BESTOW_QUANTITY
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'pdata',
			description: 'Player history',
			options: [
				{
					type: 'Subcommand',
					name: 'activity_recent',
					description: 'Recent activities',
					options: [
						{ type: 'User', name: 'user', description: 'Player', required: true },
						{
							type: 'Integer',
							name: 'qty',
							description: 'Quantity (default 25)',
							min_value: 1,
							max_value: 1000,
							required: false
						},
						{
							type: 'String',
							name: 'trip_type',
							description: 'Activity type',
							required: false,
							autocomplete: async ({ value }: StringAutoComplete) =>
								historyAutocomplete(Object.values(activity_type_enum), value)
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'activity_specific',
					description: 'View an activity',
					options: [
						{ type: 'User', name: 'user', description: 'Player', required: true },
						{ type: 'Integer', name: 'trip_id', description: 'Activity ID', required: true, min_value: 1 }
					]
				},
				{
					type: 'Subcommand',
					name: 'commands_recent',
					description: 'Recent command usage',
					options: [
						{ type: 'User', name: 'user', description: 'Player', required: true },
						{
							type: 'Integer',
							name: 'qty',
							description: 'Quantity (default 25)',
							min_value: 1,
							max_value: 1000,
							required: false
						},
						{
							type: 'String',
							name: 'command_name',
							description: 'Command name',
							required: false,
							autocomplete: async ({ value }: StringAutoComplete) =>
								historyAutocomplete(Object.values(command_name_enum), value)
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'commands_specific',
					description: 'View command usage',
					options: [
						{ type: 'User', name: 'user', description: 'Player', required: true },
						{
							type: 'Integer',
							name: 'command_id',
							description: 'Command usage ID',
							required: true,
							min_value: 1
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'player',
			description: 'Player manipulation tools',
			options: [
				{
					type: 'Subcommand',
					name: 'set_buy_date',
					description: 'Set the minion buy date of a user.',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: 'String',
							name: 'message_id',
							description: 'The message id when they bought their minion.',
							required: true
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'viewbank',
					description: 'View a users bank.',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: 'Boolean',
							name: 'json',
							description: 'Get bank in JSON format',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'viewgear',
					description: 'View a users gear.',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user.',
							required: true
						},
						{
							type: 'String',
							name: 'setup',
							description: 'The setup you want to view.',
							required: false,
							choices: ['All', ...GearSetupTypes, 'Lost on wildy death'].map(i => ({
								name: toTitleCase(i),
								value: i
							}))
						},
						{
							type: 'Boolean',
							name: 'text_format',
							description: 'Do you want to see their gear in plaintext?',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'unequip_all_items',
					description: 'Force unequip all items from a user.',
					options: [
						{
							type: 'User',
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
							type: 'Boolean',
							required: false
						},
						{
							name: 'pet',
							description: 'Unequip pet also?',
							type: 'Boolean',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'steal_items',
					description: 'Steal items from a user',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user',
							required: true
						},
						{
							type: 'String',
							name: 'items',
							description: 'The items to take',
							required: false
						},
						{
							type: 'String',
							name: 'item_filter',
							description: 'A preconfigured item filter.',
							required: false,
							choices: choicesOf(itemFilters.map(i => i.name))
						},
						{
							type: 'String',
							name: 'reason',
							description: 'The reason'
						},
						{
							type: 'Boolean',
							name: 'delete',
							description: 'To delete the items instead'
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'view_user',
					description: 'View a users info',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user',
							required: true
						},
						{
							type: 'Boolean',
							name: 'refresh',
							description: 'Refresh cache before loading user',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'migrate_user',
					description: "Migrate a user's minion profile across Discord accounts",
					options: [
						{
							type: 'User',
							name: 'source',
							description: 'Source account with data to preserve and migrate',
							required: true
						},
						{
							type: 'User',
							name: 'dest',
							description: 'Destination account (any existing data on this account will be deleted)',
							required: true
						},
						{
							type: 'String',
							name: 'reason',
							description: 'The reason'
						},
						{
							type: 'Boolean',
							name: 'force',
							description: 'Admin only: allow protected or self migration',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'list_trades',
					description: 'Show trades between users',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user',
							required: true
						},
						{
							type: 'User',
							name: 'partner',
							description: 'Optional second user, will only show trades between the users',
							required: false
						},
						{
							type: 'String',
							name: 'guild_id',
							description: 'Optional - Restrict search to this guild.',
							required: false
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'ge_cancel',
					description: 'Cancel GE Listings',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user',
							required: true
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'ge_list',
					description: "Show a user's Grand Exchange listings.",
					options: [
						{ type: 'User', name: 'user', description: 'The user', required: true },
						{
							type: 'Boolean',
							name: 'all',
							description: 'Include recent completed listings',
							required: false
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'user_event',
			description: 'Manage user events.',
			options: [
				{
					type: 'Subcommand',
					name: 'cl_completion',
					description: 'CL Completion',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user that completed the cl.',
							required: true
						},
						{
							type: 'String',
							name: 'cl_name',
							description: 'The cl the user completed',
							required: true,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return allCollectionLogsFlat
									.map(c => c.name)
									.filter(c => (!value ? true : c.toLowerCase().includes(value.toLowerCase())))
									.map(val => ({ name: val, value }));
							}
						},
						{
							type: 'String',
							name: 'message_id',
							description: 'The message id of when they got it',
							required: true
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'max_total',
					description: 'Set max total level or total xp',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user that reached max total xp or level',
							required: true
						},
						{
							type: 'String',
							name: 'type',
							description: 'Did they reach max total level or max total xp',
							required: true,
							choices: choicesOf([UserEventType.MaxTotalLevel, UserEventType.MaxTotalXP])
						},
						{
							type: 'String',
							name: 'message_id',
							description: 'The message id of when they got it',
							required: true
						}
					]
				},
				{
					type: 'Subcommand',
					name: 'max',
					description: 'Set max level/xp, e.g. lvl 99 or 200m in one skill',
					options: [
						{
							type: 'User',
							name: 'user',
							description: 'The user that reached max total xp or level',
							required: true
						},
						{
							type: 'String',
							name: 'type',
							description: 'Did they reach max level or max xp',
							required: true,
							choices: choicesOf([UserEventType.MaxXP, UserEventType.MaxLevel])
						},
						{
							type: 'String',
							name: 'skill',
							description: 'What skill?',
							required: true,
							autocomplete: async ({ value }: StringAutoComplete) => {
								return Object.values(xp_gains_skill_enum)
									.filter(s => (!value ? true : s.includes(value.toLowerCase())))
									.map(s => ({ name: s, value: s }));
							}
						},
						{
							type: 'String',
							name: 'message_id',
							description: 'The message id of when they got it',
							required: true
						}
					]
				}
			]
		},
		{
			type: 'SubcommandGroup',
			name: 'roles',
			description: 'Manage support server roles.',
			options: [
				{
					type: 'Subcommand',
					name: 'sync',
					description: 'Run the support server roles sync task.',
					options: [
						{
							type: 'Boolean',
							name: 'dry_run',
							description: 'Run without making any changes.',
							required: false
						}
					]
				}
			]
		}
	],
	run: async ({ options, user: adminUser, interaction, guildId, rng }) => {
		const isAdmin = adminUser.isAdmin;
		const isGameHacker = adminUser.isGameHacker || isAdmin;
		const canBestow = canUserBestow(adminUser);

		if (!guildId || (globalConfig.isProduction && guildId.toString() !== globalConfig.supportServerID)) {
			return rng.pick(gifs);
		}

		// This is staff only, too, but we'll check canBestow instead in case we expand to wiki contribs:
		if (options.bestow) {
			if (!canBestow) return rng.pick(gifs);

			if (!isAdmin) {
				if (globalConfig.isProduction && interaction.channelId !== Channel.GeneralChannel) {
					return {
						content: `You can only use this command in <#${Channel.GeneralChannel}>.`,
						ephemeral: true
					};
				}
				if (options.bestow.user.user.bot) {
					return { content: "You can't bestow rewards to a bot.", ephemeral: true };
				}
			}

			const recipient = await mUserFetch(options.bestow.user.user.id);
			return sendStaffBestowReward({
				user: adminUser,
				rawReward: options.bestow.reward,
				quantity: options.bestow.quantity ?? 1,
				recipient,
				guildId,
				interaction
			});
		}

		// Staff only below this point:
		if (!adminUser.isStaff) return rng.pick(gifs);
		await interaction.defer();

		if (options.pdata) {
			if (!adminUser.isModOrAdmin) return 'Only moderators and admins can view player data.';
			const targetId =
				options.pdata.activity_recent?.user.user.id ??
				options.pdata.activity_specific?.user.user.id ??
				options.pdata.commands_recent?.user.user.id ??
				options.pdata.commands_specific?.user.user.id;
			if (!targetId) return 'Invalid player data request.';
			if (!adminUser.isAdmin) {
				const target = await mUserFetch(targetId);
				if (target.isAdmin || (!adminUser.isGameHacker && target.isMod)) {
					return 'You cannot view this player’s data.';
				}
			}
		}

		if (options.pdata?.activity_recent) {
			const o = options.pdata.activity_recent;
			return recentActivities(o.user.user.id, o.qty ?? 25, o.trip_type);
		}
		if (options.pdata?.activity_specific) {
			const o = options.pdata.activity_specific;
			return specificActivity(adminUser, o.user.user.id, o.trip_id);
		}
		if (options.pdata?.commands_recent) {
			const o = options.pdata.commands_recent;
			return recentCommands(o.user.user.id, o.qty ?? 25, o.command_name);
		}
		if (options.pdata?.commands_specific) {
			const o = options.pdata.commands_specific;
			return specificCommand(adminUser, o.user.user.id, o.command_id);
		}

		if (options.user_event) {
			const messageId =
				options.user_event.cl_completion?.message_id ??
				options.user_event.max?.message_id ??
				options.user_event.max_total?.message_id;
			if (!messageId || !isValidDiscordSnowflake(messageId)) return 'Invalid';

			const snowflake = DiscordSnowflake.timestampFrom(messageId);
			const date = new Date(snowflake);
			const userId =
				options.user_event.cl_completion?.user.user.id ??
				options.user_event.max?.user.user.id ??
				options.user_event.max_total?.user.user.id;
			if (!userId) return 'Invalid';
			const targetUser = await mUserFetch(userId);
			let type: UserEventType = UserEventType.CLCompletion;
			let skill: xp_gains_skill_enum | undefined;
			let collectionLogName: string | undefined;
			const targetUserUsername = await Cache.getBadgedUsername(targetUser.id);

			let confirmationStr = `Please confirm:
User: ${targetUserUsername}
Date: ${dateFm(date)}`;
			if (options.user_event.cl_completion) {
				confirmationStr += `\nCollection log: ${options.user_event.cl_completion.cl_name}`;
				type = UserEventType.CLCompletion;
				collectionLogName = options.user_event.cl_completion.cl_name;
			}
			if (options.user_event.max) {
				confirmationStr += `\nSkill: ${options.user_event.max.skill}`;
				type = options.user_event.max.type;
				skill = options.user_event.max.skill as xp_gains_skill_enum;
			}
			if (options.user_event.max_total) {
				type = options.user_event.max_total.type;
			}
			await interaction.confirmation(confirmationStr);
			await insertUserEvent({
				userID: targetUser.id,
				type,
				skill,
				collectionLogName,
				date
			});
			await globalClient.sendMessage(Channel.BotLogs, {
				content: `${adminUser.logName} created userevent for ${targetUser.logName}: ${type} ${dateFm(date)} ${
					skill ?? ''
				}`
			});
			return `Done: ${confirmationStr.replace('Please confirm:', '')}`;
		}

		if (options.player?.steal_items) {
			return handleStealItems({
				adminUser,
				interaction,
				rng,
				stealItemsOptions: options.player.steal_items
			});
		}

		if (options.player?.set_buy_date) {
			const userToCheck = await mUserFetch(options.player.set_buy_date.user.user.id);
			const res = DiscordSnowflake.deconstruct(options.player.set_buy_date.message_id);
			const date = new Date(Number(res.timestamp));

			await interaction.confirmation(
				`Are you sure you want to set the buy date of ${userToCheck.usernameOrMention} to ${dateFm(date)}?`
			);
			await globalClient.sendMessage(Channel.BotLogs, {
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
					return { files: [{ buffer: Buffer.from(json), name: 'bank.json' }] };
				}
				return `${codeBlock('json', json)}`;
			}
			return { files: [await makeBankImage({ bank, title: userToCheck.usernameOrMention })] };
		}

		if (options.player?.viewgear) {
			const { setup, text_format, user } = options.player.viewgear;
			const userToCheck = await mUserFetch(user.user.id);
			if (setup) {
				return gearViewCommand(userToCheck, setup, Boolean(text_format));
			}
			const gearImage = await userToCheck.generateGearImage({ setupType: 'all' });
			return {
				content: `${userToCheck.usernameOrMention}'s gear setups`,
				files: [{ buffer: gearImage, name: 'gear.png' }]
			};
		}

		// Unequip Items
		if (options.player?.unequip_all_items) {
			if (!isGameHacker) {
				return rng.pick(gifs);
			}
			const allGearSlots = ['melee', 'range', 'mage', 'misc', 'skilling', 'other', 'wildy', 'fashion'];
			const opts = options.player.unequip_all_items;
			const targetUser = await mUserFetch(opts.user.user.id);
			const warningMsgs: string[] = [];
			if (await targetUser.minionIsBusy()) warningMsgs.push("User's minion is busy.");
			const gearSlot = opts.all
				? 'all'
				: opts.gear_setup && allGearSlots.includes(opts.gear_setup)
					? opts.gear_setup
					: undefined;
			if (gearSlot === undefined) {
				return 'No gear slot specified.';
			}
			await interaction.confirmation(
				`Unequip ${gearSlot} gear from ${targetUser.usernameOrMention}?${
					warningMsgs.length > 0 ? warningMsgs.join('\n') : ''
				}`
			);
			const slotsToUnequip = gearSlot === 'all' ? allGearSlots : [gearSlot];

			for (const gear of slotsToUnequip) {
				await unEquipAllCommand(targetUser, gear as GearSetupType, true);
			}

			let petResult = '';
			if (opts.pet) {
				petResult = await unequipPet(targetUser);
			}
			return `Successfully removed ${gearSlot} gear.${opts.pet ? ` ${petResult}` : ''}`;
		}

		if (options.player?.view_user) {
			const msg = '';
			const userToView = await mUserFetch(options.player.view_user.user.user.id);
			return msg + '\n' + (await getUserInfo(userToView)).everythingString;
		}

		if (options.player?.migrate_user) {
			const { source, dest, reason, force } = options.player.migrate_user;

			if (source.user.id === dest.user.id) {
				return 'Destination cannot be the same as the source!';
			}

			const selfMigration = source.user.id === adminUser.id || dest.user.id === adminUser.id;
			const sourceUser = await mUserFetch(source.user.id);
			const destUser = await mUserFetch(dest.user.id);
			const protectedAccount = isProtectedAccount(destUser);
			if (selfMigration || protectedAccount) {
				if (!adminUser.isAdmin || force !== true) {
					return selfMigration
						? 'You cannot migrate yourself! Ask another mod if you need help, this is because Discord makes it too easy to put your own user accidentally.'
						: 'You cannot clobber that account.';
				}
				await interaction.confirmation(
					`**FORCED MIGRATION WARNING:** ${selfMigration ? 'This migration involves your own account. ' : ''}${protectedAccount ? 'The destination is a protected account. ' : ''}You are overriding a safeguard and destroying the destination account's existing data. Are you sure?`,
					{
						buttons: [
							new ButtonBuilder()
								.setCustomId('FORCE_SRUE')
								.setLabel('Srue')
								.setStyle(ButtonStyle.Success),
							new ButtonBuilder()
								.setCustomId(InteractionID.CANCEL)
								.setLabel('Nope')
								.setStyle(ButtonStyle.Secondary),
							new ButtonBuilder()
								.setCustomId(InteractionID.CONFIRM)
								.setLabel("Yes, I'm SURE")
								.setStyle(ButtonStyle.Danger)
						]
					}
				);
			}
			const sourceXp = sumArr(Object.values(sourceUser.skillsAsXP));
			const destXp = sumArr(Object.values(destUser.skillsAsXP));
			if (destXp > sourceXp) {
				await interaction.confirmation(
					`The target user, ${destUser.logName}, has more XP than the source user; are you really sure the names aren't backwards?`,
					{ swap: true }
				);
			}
			await interaction.confirmation(
				`Are you 1000%, totally, **REALLY** sure that \`${sourceUser.logName}\` is the account you want to preserve, and \`${destUser.logName}\` is the new account that will have ALL existing data destroyed?`
			);
			await interaction.reply('Reticulating splines...');
			const result = await migrateUser(sourceUser, destUser);

			const auditParts = [];
			auditParts.push(`${sourceUser.logName} to ${destUser.logName}`);
			if (reason) auditParts.push(`, because ${reason}`);

			if (result === true) {
				auditParts.unshift(`${adminUser.logName} migrated `);
				await globalClient.sendMessage(Channel.BotLogs, {
					content: auditParts.join('')
				});
				return 'Done';
			} else {
				auditParts.unshift(`${adminUser.logName} tried to migrate `);
				auditParts.push(` but failed: ${result}`);
				const auditMessage = auditParts.join('');
				await globalClient.sendMessage(Channel.BotLogs, {
					content: auditMessage,
					files: [{ buffer: Buffer.from(result), name: 'error.txt' }]
				});
				if (!isAdmin) await dmCyrAudit(auditMessage);
				return result;
			}
		}
		if (options.player?.list_trades) {
			const baseSql =
				'SELECT date, sender::text as sender_id, recipient::text as recipient_id, s.username as sender, r.username as recipient, items_sent, items_received, type, guild_id::text from economy_transaction e inner join users s on sender = s.id::bigint inner join users r on recipient = r.id::bigint';
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

			const sql = `${baseSql} WHERE ${where.join(' AND ')} ORDER BY date DESC`;

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

			return { files: [{ buffer: Buffer.from(report), name: 'trade_report.txt' }] };
		}

		if (options.player?.ge_list) {
			const user = await mUserFetch(options.player.ge_list.user.user.id);
			const showAll = options.player.ge_list.all ?? false;
			const activeListings = await prisma.gEListing.findMany({
				where: {
					user_id: user.id,
					quantity_remaining: {
						gt: 0
					},
					fulfilled_at: null,
					cancelled_at: null
				},
				include: {
					buyTransactions: true,
					sellTransactions: true
				},
				orderBy: {
					created_at: 'desc'
				}
			});
			const recentInactiveListings = showAll
				? await prisma.gEListing.findMany({
						where: {
							user_id: user.id,
							...(isAdmin ? {} : { cancelled_at: null }),
							OR: [
								{
									fulfilled_at: {
										not: null
									}
								},
								{
									quantity_remaining: 0
								},
								...(isAdmin
									? [
											{
												cancelled_at: {
													not: null
												}
											}
										]
									: [])
							]
						},
						include: {
							buyTransactions: true,
							sellTransactions: true
						},
						orderBy: {
							created_at: 'desc'
						},
						take: 5
					})
				: [];
			const slots = await GrandExchange.calculateSlotsOfUser(user);
			const activeListingText = activeListings.length
				? (
						await Promise.all(
							activeListings.map(async listing => {
								const buyLimit = await GrandExchange.checkBuyLimitForListing(listing);
								return geListingToString(listing, buyLimit);
							})
						)
					).join('\n')
				: '-- No Listings --';
			const recentInactiveListingText = recentInactiveListings.length
				? recentInactiveListings.map(i => geListingToString(i)).join('\n')
				: '-- No Listings --';
			const listingSections = [
				`**Active Listings**\n${activeListingText}`,
				`**Recent ${isAdmin ? 'Fulfilled/Cancelled' : 'Fulfilled'} Listings**\n${recentInactiveListingText}`
			];

			return {
				embeds: showAll ? [new EmbedBuilder().setDescription(listingSections.join('\n\n'))] : [],
				files: [
					{
						name: 'ge-listings.png',
						buffer: await generateAdminGEListingsImage({
							user,
							listingData: activeListings,
							unlockedSlots: slots.slots,
							...(!showAll ? { trim: true } : {})
						})
					}
				]
			};
		}

		if (options.player?.ge_cancel) {
			const targetUser = await mUserFetch(options.player.ge_cancel.user.user.id);
			await cancelUsersListings(targetUser);
			return `Cancelled listings for ${targetUser}`;
		}

		if (options.roles?.sync) {
			await interaction.defer();
			if (!isGameHacker) {
				return rng.pick(gifs);
			}
			const dryRun = options.roles.sync.dry_run ?? false;
			if (!dryRun) {
				await interaction.confirmation('Are you sure you want to sync support server roles?');
			}
			const result = await runRolesTask(dryRun);
			await globalClient.sendMessage(Channel.BotLogs, {
				content: `${adminUser.logName} ran the support server roles sync${dryRun ? ' (dry run)' : ''}.`
			});
			return result;
		}

		return 'Invalid command.';
	}
});
