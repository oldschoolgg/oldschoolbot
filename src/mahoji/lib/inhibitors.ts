import type { DMChannel, Guild, GuildMember, InteractionReplyOptions, TextChannel } from 'discord.js';

import { BLACKLISTED_GUILDS, BLACKLISTED_USERS } from '../../lib/blacklists';
import { BitField, DISABLED_COMMANDS } from '../../lib/constants';
import { randomizationMethods } from '../../lib/randomizer';
import type { CategoryFlag } from '../../lib/types';
import { formatDuration } from '../../lib/util';
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
		name: 'hasMinion',
		run: async ({ user, command }) => {
			if (!user.user.minion_hasBought && command.name !== 'minion') {
				return {
					ephemeral: true,
					content: `Use /minion buy to buy a minion first, you can choose between 2 randomizer methods:
${randomizationMethods.map(m => `${m.name}: ${m.desc}`).join('\n')}`
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
		run: async ({ command, guild }) => {
			if (command.attributes?.enabled === false || DISABLED_COMMANDS.has(command.name)) {
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
		name: 'cooldown',
		run: async ({ user, command }) => {
			if (!command.attributes?.cooldown) return false;
			if (user.bitfield.includes(BitField.isModerator)) return false;
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
	}
];

export async function runInhibitors({
	user,
	channel,
	member,
	command,
	guild,
	bypassInhibitors
}: {
	user: MUser;
	channel: TextChannel | DMChannel;
	member: GuildMember | null;
	command: AbstractCommand;
	guild: Guild | null;
	bypassInhibitors: boolean;
}): Promise<undefined | { reason: InteractionReplyOptions; silent: boolean }> {
	for (const { run, canBeDisabled, silent } of inhibitors) {
		if (bypassInhibitors && canBeDisabled) continue;
		const result = await run({ user, channel, member, command, guild });
		if (result !== false) {
			return { reason: result, silent: Boolean(silent) };
		}
	}
}
