import { cryptoRng } from '@oldschoolgg/rng';
import { channelIsSendable, PerkTier, Time } from '@oldschoolgg/toolkit';
import type { NewUser } from '@prisma/client';
import { type APIInteractionGuildMember, ButtonInteraction, type GuildMember } from 'discord.js';
import { isEmpty } from 'remeda';

import type { CommandOptions } from '@/lib/discord/commandOptions.js';
import { postCommand } from '@/lib/discord/postCommand.js';
import { preCommand } from '@/lib/discord/preCommand.js';
import { MInteraction } from '@/lib/structures/MInteraction.js';

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
		continueDeltaMillis,
		ephemeral
	} = options;
	const interaction: MInteraction =
		options.interaction instanceof ButtonInteraction
			? new MInteraction({ interaction: options.interaction })
			: options.interaction;
	const channel = globalClient.channels.cache.get(channelID);
	const command = globalClient.allCommands.find(c => c.name === commandName);
	if (!command || !channelIsSendable(channel)) {
		await interaction.reply({
			content:
				"There was an error running this command, I cannot find the channel you used the command in, or I don't have permission to send messages in it.",
			ephemeral: true
		});
		return null;
	}

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

		const result = await command.run({
			userID: user.id,
			guildID: guildID ? guildID : undefined,
			channelID,
			options: args,
			user,
			member: guildID ? globalClient.guilds.cache.get(guildID)?.members.cache.get(user.id) : undefined,
			interaction: interaction,
			rng: cryptoRng
		});
		if (result && !interaction.replied) {
			await interaction.reply(
				typeof result === 'string'
					? { content: result, ephemeral: ephemeral }
					: { ...result, ephemeral: ephemeral }
			);
		}
		return result;
	} catch (err) {
		Logging.logError({ err, interaction, context: { command: commandName, args } });
	} finally {
		await postCommand({
			command,
			args,
			isContinue: isContinue ?? false,
			inhibited,
			continueDeltaMillis,
			interaction
		});
	}

	return null;
}

export async function isElligibleForPresent(user: MUser) {
	if (user.isIronman) return true;
	if (user.perkTier() >= PerkTier.Four) return true;
	if (user.totalLevel >= 2000) return true;
	const totalActivityDuration: [{ sum: number }] = await prisma.$queryRawUnsafe(`SELECT SUM(duration)
FROM activity
WHERE user_id = ${BigInt(user.id)};`);
	if (totalActivityDuration[0].sum >= Time.Hour * 80) return true;
	return false;
}
