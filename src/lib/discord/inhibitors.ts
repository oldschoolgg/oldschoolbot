import { formatDuration, PerkTier } from '@oldschoolgg/toolkit';
import {
	ComponentType,
	type Guild,
	type InteractionReplyOptions,
	PermissionsBitField,
	type TextBasedChannel
} from 'discord.js';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '@/lib/blacklists.js';
import { perkTierCache, untrustedGuildSettingsCache } from '@/lib/cache.js';
import { BadgesEnum, BitField, Channel, DISABLED_COMMANDS, globalConfig } from '@/lib/constants.js';
import { minionBuyButton } from '@/lib/sharedComponents.js';
import type { MMember } from '@/lib/structures/MInteraction.js';
import { mahojiGuildSettingsFetch } from '@/mahoji/guildSettings.js';
import { Cooldowns } from '@/mahoji/lib/Cooldowns.js';

interface Inhibitor {
	name: string;
	run: (options: {
		user: MUser;
		command: OSBMahojiCommand;
		guild: Guild | null;
		channel: TextBasedChannel | null;
		member: MMember | null;
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
		run: ({ user, command }) => {
			if (!command.attributes?.requiresMinion) return false;

			if (!user.hasMinion) {
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
		run: ({ user, command }) => {
			if (!command.attributes?.requiresMinionNotBusy) return false;

			if (ActivityManager.minionIsBusy(user.id)) {
				return { content: 'Your minion must not be busy to use this command.' };
			}

			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'disabled',
		run: ({ command, guild, user }) => {
			if (
				!globalConfig.adminUserIDs.includes(user.id) &&
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
		run: ({ member, guild, channel, user }) => {
			if (!guild || guild.id !== globalConfig.supportServerID || !channel) return false;
			if (channel.id !== Channel.ServerGeneral) return false;
			const perkTier = perkTierCache.get(user.id) ?? 0;
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
		run: ({ channel, guild, user, member }) => {
			if (!guild || !member || !channel) return false;
			// Allow green gem badge holders to run commands in support channel:
			if (channel.id === Channel.HelpAndSupport && user.user.badges.includes(BadgesEnum.GreenGem)) {
				return false;
			}

			// Allow contributors + moderators to use disabled channels in SupportServer
			const userBitfield = user.bitfield;
			const isStaff = userBitfield.includes(BitField.isModerator);
			if (guild.id === globalConfig.supportServerID && isStaff) {
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
		run: ({ user, command }) => {
			if (!command.attributes?.cooldown) return false;
			if (globalConfig.adminUserIDs.includes(user.id) || user.bitfield.includes(BitField.isModerator))
				return false;
			const cooldownForThis = Cooldowns.get(user.id, command.name, command.attributes.cooldown);
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
		run: ({ user, guild }) => {
			if (BLACKLISTED_USERS.has(user.id)) {
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
	user,
	channel,
	member,
	command,
	guild,
	bypassInhibitors
}: {
	user: MUser;
	channel: TextBasedChannel | null;
	member: MMember | null;
	command: OSBMahojiCommand;
	guild: Guild | null;
	bypassInhibitors: boolean;
}): undefined | { reason: InteractionReplyOptions; silent: boolean } {
	for (const { run, canBeDisabled, silent } of inhibitors) {
		if (bypassInhibitors && canBeDisabled) continue;
		const result = run({
			user,
			channel,
			member,
			command,
			guild
		});
		if (result !== false) {
			return { reason: result, silent: Boolean(silent) };
		}
	}
}
