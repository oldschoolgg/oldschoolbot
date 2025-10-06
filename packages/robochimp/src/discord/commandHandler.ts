import { SpecialResponse } from '@oldschoolgg/toolkit';
import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

import { convertAPIOptionsToCommandOptions } from '@/discord/commandOptions.js';
import { MInteraction } from '@/structures/MInteraction.js';


export async function commandHandler(rawInteraction: ChatInputCommandInteraction) {
	const interaction = new MInteraction({ interaction: rawInteraction });
	const command = globalClient.allCommands.find(c => c.name === interaction.commandName)!;
	const options = convertAPIOptionsToCommandOptions(rawInteraction.options.data, rawInteraction.options.resolved);

	// Permissions
	if (command.requiredPermissions) {
		if (!interaction.member || !interaction.member.permissions) return null;
		for (const perm of command.requiredPermissions) {
			if (!interaction.member.permissions.has(PermissionFlagsBits[perm])) {
				return interaction.reply({
					content: "You don't have permission to use this command.",
					ephemeral: true
				});
			}
		}
	}

	const user = await globalClient.fetchUser(interaction.user.id);

	try {
		const response = await command.run({
			interaction,
			options,
			user,
			member: interaction.member,
			channelID: interaction.channelId,
			guildID: interaction.guild?.id,
			userID: interaction.user.id,
			client: globalClient
		});
		if (response === null) return;
		if (response === SpecialResponse.PaginatedMessageResponse) {
			return;
		}

		await interaction.reply(response);
	} catch (err) {
		console.error(err);
	}
}
