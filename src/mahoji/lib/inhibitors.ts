import { PerkTier, formatDuration } from '@oldschoolgg/toolkit/util';
import type { DMChannel, Guild, GuildMember, InteractionReplyOptions, TextChannel } from 'discord.js';
import { ComponentType, PermissionsBitField } from 'discord.js';

import { OWNER_IDS, SupportServer } from '../../config';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '../../lib/blacklists';
import { type PartialUser, partialUserCache, perkTierCache } from '../../lib/cache';
import { BadgesEnum, BitField, Channel, DISABLED_COMMANDS } from '../../lib/constants';
import { minionBuyButton } from '../../lib/sharedComponents';
import type { CategoryFlag } from '../../lib/types';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { mahojiGuildSettingsFetch, untrustedGuildSettingsCache } from '../guildSettings';
import { Cooldowns } from './Cooldowns';

export interface AbstractCommandAttributes {
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	enabled?: boolean;
	cooldown?: number;
	requiresMinionNotBusy?: boolean;
	requiresMinion?: boolean;
	description: string;
}

export interface AbstractCommand {
	name: string;
	attributes?: AbstractCommandAttributes;
}

interface Inhibitor {
	name: string;
	run: (options: {
		cachedUser: PartialUser | undefined;
		userID: string;
		command: AbstractCommand;
		guild: Guild | null;
		channel: TextChannel | DMChannel;
		member: GuildMember | null;
	}) => false | InteractionReplyOptions;
	canBeDisabled: boolean;
	silent?: true;
}

const inhibitors: Inhibitor[] = [
	{
		name: 'settingSyncer',
		run: ({ guild }) => {
			if (guild && !untrustedGuildSettingsCache.has(guild.id)) {
				mahojiGuildSettingsFetch(guild);
			}
			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'hasMinion',
		run: ({ cachedUser, command }) => {
			if (!command.attributes?.requiresMinion || !cachedUser) return false;

			if (!cachedUser.minion_hasBought) {
				return {
					content: 'You need a minion to use this command.',
					components: [
						{
							components: [minionBuyButton],
							type: ComponentType.ActionRow
						}
					],
					flags: undefined
				};
			}

			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'minionNotBusy',
		run: ({ userID, command }) => {
			if (!command.attributes?.requiresMinionNotBusy) return false;

			if (minionIsBusy(userID)) {
				return { content: 'Your minion must not be busy to use this command.' };
			}

			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'disabled',
		run: ({ command, guild, userID }) => {
			if (
				!OWNER_IDS.includes(userID) &&
				(command.attributes?.enabled === false || DISABLED_COMMANDS.has(command.name))
			) {
				return { content: 'This command is globally disabled.' };
			}
			if (!guild) return false;
			const cachedSettings = untrustedGuildSettingsCache.get(guild.id);
			if (cachedSettings?.disabledCommands.includes(command.name)) {
				return { content: 'This command is disabled in this server.' };
			}
			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'commandRoleLimit',
		run: ({ member, guild, channel, userID }) => {
			if (!guild || guild.id !== SupportServer) return false;
			if (channel.id !== Channel.General) return false;
			const perkTier = perkTierCache.get(userID) ?? 0;
			if (member && perkTier >= PerkTier.Two) {
				return false;
			}

			return { content: "You cannot use commands in the general channel unless you're a patron" };
		},
		canBeDisabled: false,
		silent: true
	},
	{
		name: 'onlyStaffCanUseCommands',
		run: ({ channel, guild, cachedUser, member }) => {
			if (!guild || !member || !cachedUser) return false;
			// Allow green gem badge holders to run commands in support channel:
			if (channel.id === Channel.HelpAndSupport && cachedUser.badges.includes(BadgesEnum.GreenGem)) {
				return false;
			}

			// Allow contributors + moderators to use disabled channels in SupportServer
			const userBitfield = cachedUser.bitfield;
			const isStaff = userBitfield.includes(BitField.isModerator);
			if (guild.id === SupportServer && isStaff) {
				return false;
			}

			// Allow guild-moderators to use commands in disabled channels
			const settings = untrustedGuildSettingsCache.get(guild.id);
			if (settings?.staffOnlyChannels.includes(channel.id)) {
				const hasPerm = member.permissions.has(PermissionsBitField.Flags.BanMembers);
				if (!hasPerm) {
					return { content: "You need the 'Ban Members' permission to use commands in disabled channels." };
				}
			}

			return false;
		},
		canBeDisabled: false,
		silent: true
	},
	{
		name: 'cooldown',
		run: ({ userID, command, cachedUser }) => {
			if (!command.attributes?.cooldown || !cachedUser) return false;
			if (OWNER_IDS.includes(userID) || cachedUser.bitfield.includes(BitField.isModerator)) return false;
			const cooldownForThis = Cooldowns.get(userID, command.name, command.attributes.cooldown);
			if (cooldownForThis) {
				return {
					content: `This command is on cooldown, you can use it again in ${formatDuration(cooldownForThis)}`
				};
			}
			return false;
		},
		canBeDisabled: true
	},
	{
		name: 'blacklisted',
		run: ({ userID, guild }) => {
			if (BLACKLISTED_USERS.has(userID)) {
				return { content: 'This user is blacklisted.' };
			}
			if (guild && BLACKLISTED_GUILDS.has(guild.id)) {
				return { content: 'This guild is blacklisted.' };
			}
			return false;
		},
		canBeDisabled: false,
		silent: true
	}
];

export function runInhibitors({
	userID,
	channel,
	member,
	command,
	guild,
	bypassInhibitors
}: {
	userID: string;
	channel: TextChannel | DMChannel;
	member: GuildMember | null;
	command: AbstractCommand;
	guild: Guild | null;
	bypassInhibitors: boolean;
}): undefined | { reason: InteractionReplyOptions; silent: boolean } {
	for (const { run, canBeDisabled, silent } of inhibitors) {
		if (bypassInhibitors && canBeDisabled) continue;
		const result = run({
			userID: userID,
			channel,
			member,
			command,
			guild,
			cachedUser: partialUserCache.get(userID)
		});
		if (result !== false) {
			return { reason: result, silent: Boolean(silent) };
		}
	}
}
