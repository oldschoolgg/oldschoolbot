import { type CommandOptions, channelIsSendable } from '@oldschoolgg/toolkit';
import type { NewUser } from '@prisma/client';
import { type APIInteractionGuildMember, ButtonInteraction, type GuildMember, type User } from 'discord.js';
import { isEmpty } from 'remeda';

import { MInteraction } from '@/lib/structures/MInteraction.js';
import { handleInteractionError } from '@/lib/util/interactionReply.js';
import { logError } from '@/lib/util/logError.js';
import { allCommands } from '@/mahoji/commands/allCommands.js';
import { postCommand } from '@/mahoji/lib/postCommand.js';
import { preCommand } from '@/mahoji/lib/preCommand.js';

export async function getNewUser(id: string): Promise<NewUser> {
	const value = await prisma.newUser.findUnique({ where: { id } });
	if (!value) {
		return prisma.newUser.create({
			data: {
				id,
				minigame: {}
			}
		});
	}
	return value;
}

async function runMahojiCommand({
	channelID,
	userID,
	guildID,
	commandName,
	options,
	user,
	interaction
}: {
	interaction: MInteraction;
	commandName: string;
	options: Record<string, unknown>;
	channelID: string;
	userID: string;
	guildID: string | undefined | null;
	user: User | MUser;
	member: APIInteractionGuildMember | GuildMember | null;
}) {
	const mahojiCommand = Array.from(globalClient.mahojiClient.commands.values()).find(c => c.name === commandName);
	if (!mahojiCommand) {
		throw new Error(`No mahoji command found for ${commandName}`);
	}

	return mahojiCommand.run({
		userID,
		guildID: guildID ? guildID : undefined,
		channelID,
		options,
		user: globalClient.users.cache.get(user.id)!,
		member: guildID ? globalClient.guilds.cache.get(guildID)?.members.cache.get(user.id) : undefined,
		interaction: interaction
	});
}

interface RunCommandArgs {
	commandName: string;
	args: CommandOptions;
	user: MUser;
	channelID: string;
	member: APIInteractionGuildMember | GuildMember | null;
	isContinue?: boolean;
	bypassInhibitors?: true;
	guildID: string | undefined | null;
	interaction: ButtonInteraction | MInteraction;
	continueDeltaMillis: number | null;
	ephemeral?: boolean;
}

export async function runCommand(options: RunCommandArgs): Promise<null | CommandResponse> {
	const {
		commandName,
		args,
		isContinue,
		bypassInhibitors,
		channelID,
		guildID,
		user,
		member,
		continueDeltaMillis,
		ephemeral
	} = options;
	const interaction: MInteraction =
		options.interaction instanceof ButtonInteraction
			? new MInteraction({ interaction: options.interaction })
			: options.interaction;
	const channel = globalClient.channels.cache.get(channelID);
	const command = allCommands.find(c => c.name === commandName);
	if (!command || !channelIsSendable(channel)) {
		await interaction.reply({
			content:
				"There was an error running this command, I cannot find the channel you used the command in, or I don't have permission to send messages in it.",
			ephemeral: true
		});
		return null;
	}

	const error: Error | null = null;
	let inhibited = false;
	try {
		const inhibitedReason = await preCommand({
			command,
			bypassInhibitors: bypassInhibitors ?? false,
			options: args,
			interaction,
			user
		});

		if (inhibitedReason) {
			inhibited = true;
			let response =
				typeof inhibitedReason.reason! === 'string' ? inhibitedReason.reason : inhibitedReason.reason?.content!;
			if (isEmpty(response)) {
				response = 'You cannot use this command right now.';
			}

			await interaction.reply({
				content: response,
				ephemeral: inhibitedReason.silent
			});
			return null;
		}

		await interaction.defer({ ephemeral });

		const result = await runMahojiCommand({
			options: args,
			commandName,
			guildID,
			channelID,
			userID: user.id,
			member,
			user,
			interaction
		});
		if (result && !interaction.replied) {
			await interaction.reply(
				typeof result === 'string'
					? { content: result, ephemeral: ephemeral }
					: { ...result, ephemeral: ephemeral }
			);
		}
		return result;
	} catch (err: any) {
		await handleInteractionError(err, interaction);
	} finally {
		try {
			await postCommand({
				command,
				args,
				error,
				isContinue: isContinue ?? false,
				inhibited,
				continueDeltaMillis,
				interaction
			});
		} catch (err) {
			logError(err);
		}
	}

	return null;
}
