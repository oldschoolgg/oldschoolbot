import { Guild } from 'discord.js';
import { KlasaUser } from 'klasa';
import { ApplicationCommandOptionType, CommandRunOptions } from 'mahoji';

import { client } from '../..';
import { getGuildSettings } from '../../lib/settings/settings';
import { GuildSettings } from '../../lib/settings/types/GuildSettings';
import { hasBanMemberPerms, OSBMahojiCommand } from '../lib/util';

async function handleChannelEnable(
	user: KlasaUser,
	guild: Guild | null,
	channelID: bigint,
	choice: 'enable' | 'disable'
) {
	if (!guild) return 'This command can only be run in servers.';
	if (!(await hasBanMemberPerms(user, guild))) return "You need to be 'Ban Member' permissions to use this command.";
	const cID = channelID.toString();
	const settings = await getGuildSettings(guild);
	const isDisabled = settings.get(GuildSettings.StaffOnlyChannels).includes(cID);

	if (choice === 'disable') {
		if (isDisabled) return 'This channel is already disabled.';

		await settings.update(GuildSettings.StaffOnlyChannels, cID, {
			arrayAction: 'add'
		});

		return 'Channel disabled. Staff of this server can still use commands in this channel.';
	}
	if (!isDisabled) return 'This channel is already enabled.';

	await settings.update(GuildSettings.StaffOnlyChannels, cID, {
		arrayAction: 'remove'
	});

	return 'Channel enabled. Anyone can use commands in this channel now.';
}

export const configCommand: OSBMahojiCommand = {
	name: 'config',
	description: 'Commands configuring settings and options.',
	options: [
		{
			type: ApplicationCommandOptionType.SubcommandGroup,
			name: 'server',
			description: 'Change settings for your server.',
			options: [
				{
					type: ApplicationCommandOptionType.Subcommand,
					name: 'channel',
					description: 'Enable or disable commands in this channel.',
					options: [
						{
							type: ApplicationCommandOptionType.String,
							name: 'choice',
							description: 'Enable or disable commands for this channel.',
							required: true,
							choices: [
								{ name: 'Enable', value: 'enable' },
								{ name: 'Disable', value: 'disable' }
							]
						}
					]
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		guildID,
		channelID
	}: CommandRunOptions<{
		server?: { channel?: { choice: 'enable' | 'disable' } };
	}>) => {
		const user = await client.fetchUser(userID.toString());
		const guild = client.guilds.cache.get(guildID.toString()) ?? null;
		if (options.server) {
			if (options.server.channel) {
				return handleChannelEnable(user, guild, channelID, options.server.channel.choice);
			}
		}
		return 'wut da';
	}
};
