import type { CommandRunOptions, ICommand, MahojiUserOption } from '@oldschoolgg/toolkit/discord-util';
import { ApplicationCommandOptionType, MessageFlags } from 'discord.js';

import { Bits, fetchUser, sendToChannelID } from '../util.js';

function logBlacklist(str: string) {
	return sendToChannelID('782459317218967602', str);
}

export const blacklistCommand: ICommand = {
	name: 'blacklist',
	description: 'Oook ook ook!.',
	options: [
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'add',
			description: 'Add a user to the blacklist.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user.',
					required: true
				},
				{
					type: ApplicationCommandOptionType.String,
					name: 'reason',
					description: 'The reason for blacklisting.',
					required: true
				}
			]
		},
		{
			type: ApplicationCommandOptionType.Subcommand,
			name: 'remove',
			description: 'Remove a user from the blacklist.',
			options: [
				{
					type: ApplicationCommandOptionType.User,
					name: 'user',
					description: 'The user.',
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		userID,
		user
	}: CommandRunOptions<{
		add?: { user: MahojiUserOption; reason: string };
		remove?: { user: MahojiUserOption };
	}>) => {
		const dbUser = await fetchUser(userID);
		if (!dbUser.bits.includes(Bits.Mod)) return { content: 'Ook OOK OOK', flags: MessageFlags.Ephemeral };
		const inputUser = options.add?.user ?? options.remove?.user;
		if (!inputUser) return 'Invalid command.';
		const userToBlacklist = await fetchUser(BigInt(inputUser.user.id));
		if (userToBlacklist.bits.includes(Bits.Mod)) {
			return { content: 'I will destroy you.', flags: MessageFlags.Ephemeral };
		}

		const id = BigInt(inputUser.user.id);
		const isBlacklisted =
			(await roboChimpClient.blacklistedEntity.count({
				where: { id }
			})) > 0;

		if (options.add) {
			if (isBlacklisted) return 'That user is already blacklisted.';
			await roboChimpClient.blacklistedEntity.create({
				data: {
					id,
					type: 'user',
					reason: options.add.reason
				}
			});
			logBlacklist(
				`${inputUser.user.username}[${inputUser.user.id}] was blacklisted by ${user.username}, reason: \`${options.add.reason}\`.`
			);
			return `Blacklisted ${inputUser.user.username}[${inputUser.user.id}], for \`${options.add.reason}\``;
		}
		if (options.remove) {
			if (!isBlacklisted) return "That user isn't blacklisted.";
			await roboChimpClient.blacklistedEntity.delete({
				where: {
					id
				}
			});
			logBlacklist(`${inputUser.user.username}[${inputUser.user.id}] was unblacklisted by ${user.username}.`);
			return `Unblacklisted ${inputUser.user.username}[${inputUser.user.id}].`;
		}
		return 'Invalid command.';
	}
};
