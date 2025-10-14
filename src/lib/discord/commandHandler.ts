import { cryptoRng } from '@oldschoolgg/rng';
import { SpecialResponse } from '@oldschoolgg/toolkit';
import { type ChatInputCommandInteraction, PermissionFlagsBits } from 'discord.js';

import { busyImmuneCommands } from '@/lib/constants.js';
import { type CommandOptions, convertAPIOptionsToCommandOptions } from '@/lib/discord/index.js';
import { preCommand } from '@/lib/discord/preCommand.js';
import { DebugStopwatch } from '@/lib/structures/DebugTimer.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';

export async function rawCommandHandlerInner({
	interaction,
	command,
	options
}: {
	interaction: MInteraction;
	command: OSBMahojiCommand;
	options: CommandOptions;
}) {
	const sw = new DebugStopwatch({ name: 'CommandHandler', interaction });

	// Permissions
	if (command.requiredPermissions) {
		if (!interaction.member || !interaction.member.permissions) return null;
		for (const perm of command.requiredPermissions) {
			if (!interaction.member.permissions.has(PermissionFlagsBits[perm])) {
				await interaction.reply({
					content: "You don't have permission to use this command.",
					ephemeral: true
				});
				return;
			}
		}
	}

	const user = await mUserFetch(interaction.user.id, {
		last_command_date: new Date(),
		username: globalClient.users.cache.get(interaction.user.id)?.username
	});
	if (user.isBusy && !busyImmuneCommands.includes(command.name)) {
		await interaction.reply({
			content: 'You cannot use a command right now.',
			ephemeral: true
		});
		return;
	}
	if (!busyImmuneCommands.includes(command.name)) {
		user.modifyBusy('lock', `Running command: ${command.name}`);
	}

	try {
		sw.check();
		const inhibitedResponse = await preCommand({
			command,
			interaction,
			options,
			user
		});
		sw.check('PreCommand');
		if (inhibitedResponse) {
			await interaction.reply({
				ephemeral: true,
				...inhibitedResponse.reason
			});
			return;
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
		user.modifyBusy('unlock', `Finished running command: ${command.name}`);
	}
}

export async function commandHandler(rawInteraction: ChatInputCommandInteraction) {
	const interaction = new MInteraction({ interaction: rawInteraction });
	const command = globalClient.allCommands.find(c => c.name === interaction.commandName)!;
	const options = convertAPIOptionsToCommandOptions(rawInteraction.options.data, rawInteraction.options.resolved);

	await rawCommandHandlerInner({ interaction, command, options });
}
