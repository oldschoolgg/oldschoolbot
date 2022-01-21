import { SlashCommandInteraction } from 'mahoji/dist/lib/structures/SlashCommandInteraction';

import { prisma } from '../../lib/settings/prisma';
import { makeCommandUsage } from '../../lib/util/commandUsage';
import { OSBMahojiCommand } from './util';

export async function postCommand({
	command,
	interaction
}: {
	command: OSBMahojiCommand;
	interaction: SlashCommandInteraction;
}) {
	const commandUsage = makeCommandUsage({
		userID: interaction.userID.toString(),
		channelID: interaction.channelID.toString(),
		guildID: interaction.guildID.toString(),
		commandName: command.name,
		args: interaction.options
	});
	await prisma.commandUsage.create({
		data: commandUsage
	});
}
