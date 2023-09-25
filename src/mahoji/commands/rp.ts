import { codeBlock } from '@discordjs/builders';
import { toTitleCase } from '@oldschoolgg/toolkit';
import { Duration } from '@sapphire/time-utilities';
import { SnowflakeUtil } from 'discord.js';
import { randArrItem, Time } from 'e';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';
import { MahojiUserOption } from 'mahoji/dist/lib/types';
import { Bank } from 'oldschooljs';

import { ADMIN_IDS, OWNER_IDS, production, SupportServer } from '../../config';
import { BitField, Channel } from '../../lib/constants';
import { GrandExchange } from '../../lib/grandExchange';
import { mahojiUserSettingsUpdate } from '../../lib/MUser';
import { dateFm, formatDuration } from '../../lib/util';
import { handleMahojiConfirmation } from '../../lib/util/handleMahojiConfirmation';
import { deferInteraction } from '../../lib/util/interactionReply';
import { makeBankImage } from '../../lib/util/makeBankImage';
import { parseBank } from '../../lib/util/parseStringBank';
import { sendToChannelID } from '../../lib/util/webhook';
import { OSBMahojiCommand } from '../lib/util';
import { mahojiUsersSettingsFetch } from '../mahojiSettings';
import { gifs } from './admin';

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
							required: true
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
						},
						{
							type: ApplicationCommandOptionType.Boolean,
							name: 'partial',
							description: "If they don't have all items, delete what they have"
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
		action?: {
			validate_ge?: {};
		};
		player?: {
			viewbank?: { user: MahojiUserOption; json?: boolean };
			add_patron_time?: { user: MahojiUserOption; tier: number; time: string };
			steal_items?: {
				user: MahojiUserOption;
				items: string;
				reason?: string;
				delete?: boolean;
				partial?: boolean;
			};
			set_buy_date?: {
				user: MahojiUserOption;
				message_id: string;
			};
		};
	}>) => {
		await deferInteraction(interaction);

		const adminUser = await mUserFetch(userID);
		const isOwner = OWNER_IDS.includes(userID.toString());
		const isMod = isOwner || adminUser.bitfield.includes(BitField.isModerator);
		if (!guildID || !isMod || (production && guildID.toString() !== SupportServer)) return randArrItem(gifs);

		if (options.action?.validate_ge) {
			const isValid = await GrandExchange.extensiveVerification();
			if (isValid) {
				return 'No issues found.';
			}
			return 'Something was invalid. Check logs!';
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
				const json = JSON.stringify(bank.bank);
				if (json.length > 1900) {
					return { files: [{ attachment: Buffer.from(json), name: 'bank.json' }] };
				}
				return `${codeBlock('json', json)}`;
			}
			return { files: [(await makeBankImage({ bank, title: userToCheck.usernameOrMention })).file] };
		}

		if (options.player?.add_patron_time) {
			const { tier, time, user: userToGive } = options.player.add_patron_time;
			if (![1, 2, 3, 4, 5, 6].includes(tier)) return 'Invalid input.';
			const duration = new Duration(time);
			const ms = duration.offset;
			if (ms < Time.Second || ms > Time.Year * 3) return 'Invalid input.';
			const input = await mahojiUsersSettingsFetch(userToGive.user.id, {
				premium_balance_tier: true,
				premium_balance_expiry_date: true,
				id: true
			});

			const currentBalanceTier = input.premium_balance_tier;

			if (currentBalanceTier !== null && currentBalanceTier !== tier) {
				await handleMahojiConfirmation(
					interaction,
					`They already have Tier ${currentBalanceTier}; this will replace the existing balance entirely, are you sure?`
				);
			}
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to add ${formatDuration(ms)} of Tier ${tier} patron to ${
					userToGive.user.username
				}?`
			);
			await mahojiUserSettingsUpdate(input.id, {
				premium_balance_tier: tier
			});

			const currentBalanceTime =
				input.premium_balance_expiry_date === null ? null : Number(input.premium_balance_expiry_date);

			let newBalanceExpiryTime = 0;
			if (currentBalanceTime !== null && tier === currentBalanceTier) {
				newBalanceExpiryTime = currentBalanceTime + ms;
			} else {
				newBalanceExpiryTime = Date.now() + ms;
			}
			await mahojiUserSettingsUpdate(input.id, {
				premium_balance_expiry_date: newBalanceExpiryTime
			});

			return `Gave ${formatDuration(ms)} of Tier ${tier} patron to ${
				userToGive.user.username
			}. They have ${formatDuration(newBalanceExpiryTime - Date.now())} remaining.`;
		}
		if (options.player?.steal_items) {
			if (!isOwner && !ADMIN_IDS.includes(userID)) {
				return randArrItem(gifs);
			}
			const partial = options.player.steal_items.partial ?? false;
			let removedPartial = false;
			const toDelete = options.player.steal_items.delete ?? false;
			const actionMsg = toDelete ? 'delete' : 'steal';
			const actionMsgPast = toDelete ? 'deleted' : 'stole';

			const items = parseBank({ inputStr: options.player.steal_items.items, noDuplicateItems: true });
			const user = await mUserFetch(options.player.steal_items.user.user.id);
			await handleMahojiConfirmation(
				interaction,
				`Are you sure you want to ${actionMsg} ${items} from ${user.usernameOrMention}?`
			);
			let missing = new Bank();
			if (!user.owns(items)) {
				missing = items.clone().remove(user.bank);
				if (partial) {
					items.remove(missing);
					removedPartial = true;
				} else {
					return `${user.mention} doesn't have all items. Missing: ${missing}`;
				}
			}
			await sendToChannelID(Channel.BotLogs, {
				content: `${adminUser.logName} ${actionMsgPast} \`${items}\` from ${user.logName} for ${
					options.player.steal_items.reason ?? 'No reason'
				}${removedPartial ? `\n\nFailed to remove: ${missing}` : ''}`
			});

			await user.removeItemsFromBank(items);
			if (!toDelete) await adminUser.addItemsToBank({ items, collectionLog: false });
			return `${toTitleCase(actionMsgPast)} ${items} from ${user.mention}${
				removedPartial ? `\n\nFailed to remove: ${missing}` : ''
			}`;
		}

		return 'Invalid command.';
	}
};
