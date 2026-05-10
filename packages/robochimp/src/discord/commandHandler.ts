import { type APIChatInputApplicationCommandInteraction, SpecialResponse } from '@oldschoolgg/discord';

import { convertAPIOptionsToCommandOptions } from '@/discord/index.js';
import { preCommand } from '@/discord/preCommand.js';

export async function rawCommandHandlerInner({
	interaction,
	command,
	options
}: {
	interaction: MInteraction;
	command: AnyCommand;
	options: CommandOptions;
}): CommandResponse {
	// Permissions
	if (command.requiredPermissions) {
		const hasPerms =
			interaction.member !== null &&
			(await globalClient.memberHasPermissions(interaction.member, command.requiredPermissions));
		if (!hasPerms) {
			return {
				content: "You don't have permission to use this command.",
				ephemeral: true
			};
		}
	}
	const user = await globalClient.fetchRUser(interaction.userId);

	try {
		const inhibitedResponse = await preCommand({
			command,
			interaction,
			options,
			user
		});
		if (inhibitedResponse) {
			return {
				ephemeral: true,
				...inhibitedResponse.reason
			};
		}

		const response: Awaited<CommandResponse> = await command.run({
			interaction,
			options,
			user,
			member: interaction.member,
			channelId: interaction.channelId,
			guildId: interaction.guildId,
			userId: interaction.userId
		});
		return response;
	} catch (err) {
		if ((err as Error).message === 'SILENT_ERROR') return SpecialResponse.SilentErrorResponse;
		console.error({
			err: err as Error,
			interaction,
			context: { command: command.name, options: JSON.stringify(options) }
		});
		return {
			content: `An error occurred while running this command.`
		};
	} finally {
	}
}

export async function commandHandler(
	rawInteraction: APIChatInputApplicationCommandInteraction,
	interaction: MInteraction
) {
	const command = globalClient.allCommands.find(c => c.name === rawInteraction.data.name)!;
	const options = convertAPIOptionsToCommandOptions({
		guildId: rawInteraction.guild_id,
		options: rawInteraction.data.options ?? [],
		resolvedObjects: rawInteraction.data.resolved
	});

	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({
		interaction,
		command,
		options
	});
	if (
		response === SpecialResponse.PaginatedMessageResponse ||
		response === SpecialResponse.SilentErrorResponse ||
		response === SpecialResponse.RespondedManually
	) {
		return;
	}
	await interaction.reply(response);
}
