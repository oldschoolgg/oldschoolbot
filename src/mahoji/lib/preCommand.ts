import { TextChannel } from 'discord.js';
import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';

import { client } from '../..';
import { runInhibitors } from './inhibitors';
import { convertMahojiCommandToAbstractCommand, OSBMahojiCommand } from './util';

export async function preCommand({
	command,
	interaction
}: {
	command: OSBMahojiCommand;
	interaction: SlashCommandInteraction;
}): Promise<string | undefined> {
	const user = await client.fetchUser(interaction.userID.toString());
	const guild = client.guilds.cache.get(interaction.guildID.toString());
	const member = guild?.members.cache.get(interaction.userID.toString());
	const channel = client.channels.cache.get(interaction.channelID.toString()) as TextChannel;
	const inhibitResult = await runInhibitors({
		user,
		guild: guild ?? null,
		member: member ?? null,
		command: convertMahojiCommandToAbstractCommand(command),
		channel: channel ?? null
	});
	if (typeof inhibitResult === 'string') {
		return inhibitResult;
	}
}
