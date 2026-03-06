import { type APIChatInputApplicationCommandInteraction, SpecialResponse } from '@oldschoolgg/discord';
import { cryptoRng } from 'node-rng/crypto';

import { convertAPIOptionsToCommandOptions } from '@/discord/index.js';
import { preCommand } from '@/discord/preCommand.js';
import { busyImmuneCommands, SILENT_ERROR } from '@/lib/constants.js';
import { RawSQL } from '@/lib/rawSql.js';

export async function rawCommandHandlerInner({
	interaction,
	command,
	options,
	ignoreUserIsBusy,
	rng
}: {
	interaction: OSInteraction;
	command: AnyCommand;
	options: CommandOptions;
	ignoreUserIsBusy?: true;
	rng: RNGProvider;
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
	const user = interaction.user;
	RawSQL.updateUserLastCommandDate({ userId: interaction.userId }).catch(err => Logging.logError(err));

	// TODO: remove later
	if (user.user.completed_achievement_diaries.length === 0) {
		user.syncCompletedAchievementDiaries().catch(err => Logging.logError(err));
	}

	const shouldIgnoreBusy = ignoreUserIsBusy || busyImmuneCommands.includes(command.name);

	if (!shouldIgnoreBusy && (await user.getIsLocked())) {
		return {
			content: 'You cannot use a command right now.',
			ephemeral: true
		};
	}
	if (!shouldIgnoreBusy) {
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

		const runClosure = () =>
			command.run({
				interaction,
				options,
				user,
				member: interaction.member,
				channelId: interaction.channelId,
				guildId: interaction.guildId,
				userId: interaction.userId,
				rng
			});

		const requiresLock = Boolean('flags' in command && command.flags?.includes('REQUIRES_LOCK'));
		if (requiresLock) {
			await interaction.defer();
		}
		const response: Awaited<CommandResponse> = requiresLock
			? await user.withLock(command.name, runClosure)
			: await runClosure();
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
		if (!shouldIgnoreBusy) {
			user.modifyBusy('unlock', `Finished running command: ${command.name}`);
		}
	}
}

export async function commandHandler(
	rawInteraction: APIChatInputApplicationCommandInteraction,
	interaction: OSInteraction
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
		options,
		rng: cryptoRng
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
