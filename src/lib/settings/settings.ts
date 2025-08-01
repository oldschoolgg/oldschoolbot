import {
	type CommandOptions,
	type CommandResponse,
	channelIsSendable,
	convertMahojiCommandToAbstractCommand
} from '@oldschoolgg/toolkit/discord-util';
import type { NewUser } from '@prisma/client';
import type {
	APIInteractionGuildMember,
	ButtonInteraction,
	ChatInputCommandInteraction,
	GuildMember,
	User
} from 'discord.js';
import { isEmpty } from 'remeda';

import { postCommand } from '../../mahoji/lib/postCommand';
import { preCommand } from '../../mahoji/lib/preCommand';
import { deferInteraction, handleInteractionError, interactionReply } from '../util/interactionReply';
import { logError } from '../util/logError';

export * from './minigames';

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
	interaction: ChatInputCommandInteraction | ButtonInteraction;
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
		client: globalClient.mahojiClient,
		interaction: interaction as ChatInputCommandInteraction
	});
}

interface RunCommandArgs {
	commandName: string;
	args: CommandOptions;
	user: User | MUser;
	channelID: string;
	member: APIInteractionGuildMember | GuildMember | null;
	isContinue?: boolean;
	bypassInhibitors?: true;
	guildID: string | undefined | null;
	interaction: ButtonInteraction | ChatInputCommandInteraction;
	continueDeltaMillis: number | null;
	ephemeral?: boolean;
}
export async function runCommand({
	commandName,
	args,
	isContinue,
	bypassInhibitors,
	channelID,
	guildID,
	user,
	member,
	interaction,
	continueDeltaMillis,
	ephemeral
}: RunCommandArgs): Promise<null | CommandResponse> {
	const channel = globalClient.channels.cache.get(channelID);
	const mahojiCommand = Array.from(globalClient.mahojiClient.commands.values()).find(c => c.name === commandName);
	if (!mahojiCommand || !channelIsSendable(channel)) {
		await interactionReply(interaction, {
			content: 'There was an error repeating your trip, I cannot find the channel you used the command in.',
			ephemeral: true
		});
		return null;
	}
	const abstractCommand = convertMahojiCommandToAbstractCommand(mahojiCommand);

	const error: Error | null = null;
	let inhibited = false;
	try {
		const inhibitedReason = await preCommand({
			abstractCommand,
			userID: user.id,
			channelID,
			guildID,
			bypassInhibitors: bypassInhibitors ?? false,
			apiUser: null,
			options: args
		});

		if (inhibitedReason) {
			inhibited = true;
			let response =
				typeof inhibitedReason.reason! === 'string' ? inhibitedReason.reason : inhibitedReason.reason?.content!;
			if (isEmpty(response)) {
				response = 'You cannot use this command right now.';
			}

			await interactionReply(interaction, {
				content: response,
				ephemeral: inhibitedReason.silent
			});
			return null;
		}

		await deferInteraction(interaction, ephemeral);

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
			await interactionReply(
				interaction,
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
				abstractCommand,
				userID: user.id,
				guildID,
				channelID,
				args,
				error,
				isContinue: isContinue ?? false,
				inhibited,
				continueDeltaMillis
			});
		} catch (err) {
			logError(err);
		}
	}

	return null;
}
