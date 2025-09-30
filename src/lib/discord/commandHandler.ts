import { convertAPIOptionsToCommandOptions, SpecialResponse } from '@oldschoolgg/toolkit';
import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

import { MInteraction } from '@/lib/structures/MInteraction.js';
import { allCommands } from '@/mahoji/commands/allCommands.js';
import { postCommand } from '@/mahoji/lib/postCommand.js';
import { preCommand } from '@/mahoji/lib/preCommand.js';

export async function commandHandler(rawInteraction: ChatInputCommandInteraction) {
	const interaction = new MInteraction({ interaction: rawInteraction });
	const command = allCommands.find(c => c.name === interaction.commandName)!;
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

	const user = await mUserFetch(interaction.user.id);

	let error: Error | null = null;
	let inhibited = false;
	let runPostCommand = true;
	try {
		const inhibitedResponse = await preCommand({
			command,
			interaction,
			options,
			bypassInhibitors: false,
			user
		});
		if (inhibitedResponse) {
			if (inhibitedResponse.dontRunPostCommand) runPostCommand = false;
			inhibited = true;
			return interaction.reply({
				ephemeral: true,
				...inhibitedResponse.reason
			});
		}

		const response = await command.run({
			interaction,
			options,
			user: interaction.user,
			member: interaction.member,
			channelID: interaction.channelId,
			guildID: interaction.guild?.id,
			userID: interaction.user.id
		});
		if (response === null) return;
		if (response === SpecialResponse.PaginatedMessageResponse) {
			return;
		}

		await interaction.reply(response);
	} catch (err) {
		if (!(err instanceof Error)) console.error('Received an error that isnt an Error.');
		error = err as Error;
		if (error) {
			return { error };
		}
	} finally {
		if (runPostCommand) {
			await postCommand({
				command,
				error,
				inhibited,
				interaction,
				continueDeltaMillis: null,
				isContinue: false,
				args: options
			});
		}
	}
}
