import { PerkTier, formatDuration } from '@oldschoolgg/toolkit';
import type { DMChannel, Guild, GuildMember, InteractionReplyOptions, TextChannel, User } from 'discord.js';
import { ComponentType, PermissionsBitField } from 'discord.js';

import { OWNER_IDS, SupportServer } from '../../config';
import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '../../lib/blacklists';
import { BadgesEnum, BitField, Channel, DISABLED_COMMANDS, minionBuyButton } from '../../lib/constants';
import { getPerkTierSync } from '../../lib/perkTier';
import type { CategoryFlag } from '../../lib/types';
import { minionIsBusy } from '../../lib/util/minionIsBusy';
import { mahojiGuildSettingsFetch, untrustedGuildSettingsCache } from '../guildSettings';
import { Cooldowns } from './Cooldowns';

export interface AbstractCommandAttributes {
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	bitfieldsRequired?: BitField[];
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
		APIUser: User;
		user: MUser;
		command: AbstractCommand;
		guild: Guild | null;
		channel: TextChannel | DMChannel;
		member: GuildMember | null;
	}) => Promise<false | InteractionReplyOptions>;
	canBeDisabled: boolean;
	silent?: true;
}

const inhibitors: Inhibitor[] = [
	{
		name: 'settingSyncer',
		run: async ({ guild }) => {
			if (guild && !untrustedGuildSettingsCache.has(guild.id)) {
				await mahojiGuildSettingsFetch(guild);
			}

			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'bots',
		run: async ({ APIUser, user }) => {
			if (!APIUser.bot) return false;
			if (
				![
					'798308589373489172', // BIRDIE#1963
					'902745429685469264' // Randy#0008
				].includes(user.id)
			) {
				return { content: 'Bots cannot use commands.' };
			}
			return false;
		},
		canBeDisabled: false,
		silent: true
	},
	{
		name: 'hasMinion',
		run: async ({ user, command }) => {
			if (!command.attributes?.requiresMinion) return false;

			if (!user.user.minion_hasBought) {
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
		run: async ({ user, command }) => {
			if (!command.attributes?.requiresMinionNotBusy) return false;

			if (minionIsBusy(user.id)) {
				return { content: 'Your minion must not be busy to use this command.' };
			}

			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'bitfieldsRequired',
		run: async ({ user, command }) => {
			if (!command.attributes?.bitfieldsRequired) return false;

			const usersBitfields = user.bitfield;
			if (command.attributes.bitfieldsRequired.some(bit => !usersBitfields.includes(bit))) {
				return { content: "You don't have the required permissions to use this command." };
			}

			return false;
		},
		canBeDisabled: false
	},
	{
		name: 'disabled',
		run: async ({ command, guild, APIUser }) => {
			if (
				!OWNER_IDS.includes(APIUser.id) &&
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
		run: async ({ member, guild, channel, user }) => {
			if (!guild || guild.id !== SupportServer) return false;
			if (channel.id !== Channel.General) return false;
			const perkTier = getPerkTierSync(user.id);
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
		run: async ({ channel, guild, user, member }) => {
			if (!guild || !member) return false;
			// Allow green gem badge holders to run commands in support channel:
			if (channel.id === Channel.HelpAndSupport && user.user.badges.includes(BadgesEnum.GreenGem)) {
				return false;
			}

			// Allow contributors + moderators to use disabled channels in SupportServer
			const userBitfield = user.bitfield;
			const isStaff =
				userBitfield.includes(BitField.isModerator) || userBitfield.includes(BitField.isContributor);
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
		run: async ({ user, command }) => {
			if (!command.attributes?.cooldown) return false;
			if (OWNER_IDS.includes(user.id) || user.bitfield.includes(BitField.isModerator)) return false;
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
		run: async ({ user, guild }) => {
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
	},
	{
		name: 'toa_commands_channel',
		run: async ({ user, guild, channel, command }) => {
			if (!guild || guild.id !== SupportServer) return false;
			if (channel.id !== '1069176960523190292') return false;

			if (user.bitfield.includes(BitField.isModerator)) {
				return false;
			}

			if (command.name === 'raid') return false;

			return {
				content: 'You can only send TOA commands in this channel! Please use <#346304390858145792> instead.',
				ephemeral: true
			};
		},
		canBeDisabled: false,
		silent: true
	}
];

export async function runInhibitors({
	user,
	channel,
	member,
	command,
	guild,
	bypassInhibitors,
	APIUser
}: {
	user: MUser;
	APIUser: User;
	channel: TextChannel | DMChannel;
	member: GuildMember | null;
	command: AbstractCommand;
	guild: Guild | null;
	bypassInhibitors: boolean;
}): Promise<undefined | { reason: InteractionReplyOptions; silent: boolean }> {
	for (const { run, canBeDisabled, silent } of inhibitors) {
		if (bypassInhibitors && canBeDisabled) continue;
		const result = await run({ user, channel, member, command, guild, APIUser });
		if (result !== false) {
			return { reason: result, silent: Boolean(silent) };
		}
	}
}
