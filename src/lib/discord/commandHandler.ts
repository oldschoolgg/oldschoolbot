import { cryptoRng } from '@oldschoolgg/rng';
import { SpecialResponse } from '@oldschoolgg/toolkit';
import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

import { busyImmuneCommands, SILENT_ERROR } from '@/lib/constants.js';
import { type AnyCommand, type CommandOptions, convertAPIOptionsToCommandOptions } from '@/lib/discord/index.js';
import { preCommand } from '@/lib/discord/preCommand.js';
import { RawSQL } from '@/lib/rawSql.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';

export async function rawCommandHandlerInner({
	interaction,
	command,
	options,
	ignoreUserIsBusy
}: {
	interaction: MInteraction;
	command: AnyCommand;
	options: CommandOptions;
	ignoreUserIsBusy?: true;
}): CommandResponse {
	// Permissions
	if (command.requiredPermissions) {
		for (const perm of command.requiredPermissions) {
			if (!interaction.member.permissions.has(PermissionFlagsBits[perm])) {
				return {
					content: "You don't have permission to use this command.",
					ephemeral: true
				};
			}
		}
	}
	const user = await mUserFetch(interaction.user.id);

	try {
		const updatePromise = RawSQL.updateUserLastCommandDate({ userId: interaction.user.id });
		Promise.resolve(updatePromise).catch(console.error);
	} catch (err) {
		console.error(err);
	}

	if (
		user.user.completed_achievement_diaries.length === 0 &&
		typeof user.syncCompletedAchievementDiaries === 'function'
	) {
		const syncResult = user.syncCompletedAchievementDiaries();
		Promise.resolve(syncResult).catch(console.error);
	}

	const shouldIgnoreBusy = ignoreUserIsBusy || busyImmuneCommands.includes(command.name);

	if (user.isBusy && !shouldIgnoreBusy) {
		return {
			content: 'You cannot use a command right now.',
			ephemeral: true
		};
	}
	if (!shouldIgnoreBusy && typeof user.modifyBusy === 'function') {
		user.modifyBusy('lock', `Running command: ${command.name}`);
	}

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

		if (typeof command.run !== 'function') {
			return {
				content: 'This command is not available right now.',
				ephemeral: true
			};
		}

		const response: Awaited<CommandResponse> = await command.run({
			interaction,
			options,
			user,
			member: interaction.member,
			channelID: interaction.channelId,
			guildID: interaction.guild?.id,
			userID: interaction.user.id,
			rng: cryptoRng
		});
		return response;
	} catch (err) {
		if ((err as Error).message === SILENT_ERROR) return SpecialResponse.SilentErrorResponse;
		Logging.logError({
			err: err as Error,
			interaction,
			context: { command: command.name, options: JSON.stringify(options) }
		});
		return {
			content: `An error occurred while running this command.`
		};
	} finally {
		if (!shouldIgnoreBusy && typeof user.modifyBusy === 'function') {
			user.modifyBusy('unlock', `Finished running command: ${command.name}`);
		}
	}
}

export async function commandHandler(rawInteraction: ChatInputCommandInteraction) {
	const interaction = new MInteraction({ interaction: rawInteraction });
	const command = globalClient.allCommands.find(c => c.name === interaction.commandName)!;
	const options = convertAPIOptionsToCommandOptions(rawInteraction.options.data, rawInteraction.options.resolved);

	const response: Awaited<CommandResponse> = await rawCommandHandlerInner({ interaction, command, options });
	if (response === SpecialResponse.PaginatedMessageResponse || response === SpecialResponse.SilentErrorResponse)
		return;
	await interaction.reply(response);
}
