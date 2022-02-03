import { DMChannel, Guild, GuildMember, PermissionResolvable, Permissions, TextChannel } from 'discord.js';
import { Time } from 'e';
import { KlasaUser } from 'klasa';

import { client } from '../..';
import { production } from '../../config';
import { BadgesEnum, BitField, BotID, Channel, DISABLED_COMMANDS, PerkTier, SupportServer } from '../../lib/constants';
import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { UserSettings } from '../../lib/settings/types/UserSettings';
import { CategoryFlag } from '../../lib/types';
import { formatDuration } from '../../lib/util';
import getUsersPerkTier from '../../lib/util/getUsersPerkTier';
import { Cooldowns } from './Cooldowns';

export type CommandArgs = (string | number | boolean | unknown)[] | Record<string, unknown>;

export interface AbstractCommandAttributes {
	altProtection?: boolean;
	oneAtTime?: boolean;
	guildOnly?: boolean;
	perkTier?: PerkTier;
	ironCantUse?: boolean;
	examples?: string[];
	categoryFlags?: CategoryFlag[];
	bitfieldsRequired?: BitField[];
	enabled?: boolean;
	testingCommand?: boolean;
	cooldown?: number;
	requiredPermissionsForBot?: PermissionResolvable[];
	requiredPermissionsForUser?: PermissionResolvable[];
	runIn?: string[];
	description: string;
}

export interface AbstractCommand {
	name: string;
	attributes?: AbstractCommandAttributes;
}

interface Inhibitor {
	name: string;
	run: (options: {
		user: KlasaUser;
		command: AbstractCommand;
		guild: Guild | null;
		channel: TextChannel | DMChannel;
		member: GuildMember | null;
	}) => Promise<false | string>;
}

const inhibitors: Inhibitor[] = [
	{
		name: 'settingSyncer',
		run: async ({ user }) => {
			await user.settings.sync();
			return false;
		}
	},
	{
		name: 'bots',
		run: async ({ user }) => {
			if (!user.bot) return false;
			if (
				![
					'798308589373489172', // BIRDIE#1963
					'902745429685469264' // Randy#0008
				].includes(user.id)
			) {
				return 'Bots cannot use commands.';
			}
			return false;
		}
	},
	{
		name: 'altProtection',
		run: async ({ user, command }) => {
			if (!command.attributes?.altProtection) return false;
			if (getUsersPerkTier(user) >= PerkTier.Four) return false;

			if (
				Date.now() - user.createdTimestamp < Time.Month &&
				!user.settings.get(UserSettings.BitField).includes(BitField.BypassAgeRestriction)
			) {
				return 'You cannot use this command as your account is too new. You can ask to be manually verified if you have social media accounts as proof of identity.';
			}

			return false;
		}
	},
	{
		name: 'bitfieldsRequired',
		run: async ({ user, command }) => {
			if (!command.attributes?.bitfieldsRequired) return false;

			const usersBitfields = user.settings.get(UserSettings.BitField);
			if (command.attributes.bitfieldsRequired.some(bit => !usersBitfields.includes(bit))) {
				return "You don't have the required permissions to use this command.";
			}

			return false;
		}
	},
	{
		name: 'oneAtTime',
		run: async ({ user, command }) => {
			if (!command.attributes?.oneAtTime) return false;
			if (user.isBusy) {
				return 'You just used a command and need to wait a second.';
			}
			return false;
		}
	},
	{
		name: 'ironCantUse',
		run: async ({ user, command }) => {
			if (command.attributes?.ironCantUse && user.settings.get(UserSettings.Minion.Ironman)) {
				return "Ironman players can't use this command.";
			}
			return false;
		}
	},
	{
		name: 'disabled',
		run: async ({ command, guild, user }) => {
			if (
				!client.owners.has(user) &&
				(command.attributes?.enabled === false || DISABLED_COMMANDS.has(command.name))
			) {
				return 'This command is globally disabled.';
			}
			if (!guild) return false;
			const settings = await getGuildSettings(guild);
			if (settings.get(GuildSettings.DisabledCommands).includes(command.name)) {
				return 'This command is disabled in this server.';
			}
			return false;
		}
	},
	{
		name: 'commandRoleLimit',
		run: async ({ member, guild, channel, user }) => {
			if (!guild || guild.id !== SupportServer) return false;
			if (channel.id !== Channel.General) return false;

			const perkTier = getUsersPerkTier(user);

			if (member && perkTier >= PerkTier.Two) {
				return false;
			}

			return "You cannot use commands in the general channel unless you're a patron";
		}
	},
	{
		name: 'guildOnly',
		run: async ({ command, guild }) => {
			if (!command.attributes?.guildOnly) return false;
			if (!guild) {
				return 'You can only use this command in servers.';
			}
			return false;
		}
	},
	{
		name: 'onlyStaffCanUseCommands',
		run: async ({ channel, guild, user, member }) => {
			if (!guild || !member) return false;
			// Allow green gem badge holders to run commands in support channel:
			if (
				channel.id === Channel.HelpAndSupport &&
				user.settings.get(UserSettings.Badges).includes(BadgesEnum.GreenGem)
			) {
				return false;
			}

			// Allow contributors + moderators to use disabled channels in SupportServer
			const userBitfield = user.settings.get(UserSettings.BitField);
			const isStaff =
				userBitfield.includes(BitField.isModerator) || userBitfield.includes(BitField.isContributor);
			if (guild.id === SupportServer && isStaff) {
				return false;
			}

			// Allow guild-moderators to use commands in disabled channels
			const settings = await getGuildSettings(guild!);
			if (settings.get(GuildSettings.StaffOnlyChannels).includes(channel.id)) {
				const hasPerm = await member.permissions.has(Permissions.FLAGS.BAN_MEMBERS);
				if (!hasPerm) return "You need the 'Ban Members' permission to use commands in disabled channels.";
			}

			return false;
		}
	},
	{
		name: 'perkTierCommands',
		run: async ({ command, user }) => {
			if (!command.attributes?.perkTier) return false;

			if (getUsersPerkTier(user) < command.attributes.perkTier) {
				return `You need to be a ${
					command.attributes.perkTier - 1 > 0
						? `tier ${command.attributes.perkTier - 1} patron`
						: `tier ${command.attributes.perkTier} patron or server booster`
				} to use this command. You can become this patron tier at https://www.patreon.com/oldschoolbot`;
			}

			return false;
		}
	},
	{
		name: 'testingCommands',
		run: async ({ command }) => {
			if (command.attributes?.testingCommand) {
				if (production || !client.user || client.user.id === BotID) {
					return 'This is a testing command and cannot be used.';
				}
			}
			return false;
		}
	},
	{
		name: 'cooldown',
		run: async ({ user, command }) => {
			if (client.owners.has(user) || !command.attributes?.cooldown) return false;
			const cooldownForThis = Cooldowns.get(user.id, command.name, command.attributes.cooldown);
			if (cooldownForThis) {
				return `This command is on cooldown, you can use it again in ${formatDuration(cooldownForThis)}`;
			}
			return false;
		}
	},
	{
		// verified
		name: 'missingBotPermissions',
		run: async ({ command, channel }) => {
			if (!command.attributes?.requiredPermissionsForBot) return false;
			const missing =
				channel.type === 'text'
					? channel.permissionsFor(client.user!)!.missing(command.attributes.requiredPermissionsForBot)
					: [];
			if (missing.length > 0) {
				return `To run this command, I need these permissions: ${missing.join(', ')}.`;
			}
			return false;
		}
	},
	{
		// verified
		name: 'missingUserPermissions',
		run: async ({ command, channel, user }) => {
			if (!command.attributes?.requiredPermissionsForUser) return false;
			if (channel.type === 'dm') return false;
			const missing = channel.permissionsFor(user)!.missing(command.attributes.requiredPermissionsForUser);
			if (missing.length > 0) {
				return `You can't run this command, unless you have these permissions in the server: ${missing.join(
					', '
				)}.`;
			}
			return false;
		}
	},
	{
		name: 'runIn',
		run: async ({ command, channel }) => {
			if (!command.attributes?.runIn?.length) return false;
			if (!command.attributes?.runIn?.includes(channel.type)) {
				return 'You cannot use this command in this type of channel.';
			}
			return false;
		}
	}
];

export async function runInhibitors({
	user,
	channel,
	member,
	command,
	guild
}: {
	user: KlasaUser;
	channel: TextChannel | DMChannel;
	member: GuildMember | null;
	command: AbstractCommand;
	guild: Guild | null;
}) {
	for (const { run } of inhibitors) {
		const result = await run({ user, channel, member, command, guild });
		if (typeof result === 'string') {
			return result;
		}
	}
}
