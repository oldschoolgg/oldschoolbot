import { cryptoRng } from '@oldschoolgg/rng';
import { SpecialResponse } from '@oldschoolgg/toolkit';
import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

import { convertAPIOptionsToCommandOptions } from '@/lib/discord/index.js';
import { postCommand } from '@/lib/discord/postCommand.js';
import { preCommand } from '@/lib/discord/preCommand.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';
import { allCommands } from '@/mahoji/commands/allCommands.js';

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
			user,
			member: interaction.member,
			channelID: interaction.channelId,
			guildID: interaction.guild?.id,
			userID: interaction.user.id,
			rng: cryptoRng
		});
		if (response === null) return;
		if (response === SpecialResponse.PaginatedMessageResponse) {
			return;
		}

		await interaction.reply(response);
	} catch (err) {
		Logging.logError({
			err: err as Error,
			interaction,
			context: { command: command.name, options: JSON.stringify(options) }
		});
	} finally {
		if (runPostCommand) {
			await postCommand({
				command,
				inhibited,
				interaction,
				continueDeltaMillis: null,
				isContinue: false,
				args: options
			});
		}
	}
}
