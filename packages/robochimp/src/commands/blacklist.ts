import { MessageFlags } from 'discord.js';

import { CHANNELS } from '@/util.js';

export const blacklistCommand: RoboChimpCommand = {
	name: 'blacklist',
	description: 'Oook ook ook!.',
	options: [
		{
			type: 'Subcommand',
			name: 'add',
			description: 'Add a user to the blacklist.',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user.',
					required: true
				},
				{
					type: 'String',
					name: 'reason',
					description: 'The reason for blacklisting.',
					required: true
				}
			]
		},
		{
			type: 'Subcommand',
			name: 'remove',
			description: 'Remove a user from the blacklist.',
			options: [
				{
					type: 'User',
					name: 'user',
					description: 'The user.',
					required: true
				}
			]
		}
	],
	run: async ({
		options,
		user
	}: CommandRunOptions<{
		add?: { user: MahojiUserOption; reason: string };
		remove?: { user: MahojiUserOption };
	}>) => {
		if (!user.isMod()) return { content: 'Ook OOK OOK', flags: MessageFlags.Ephemeral };
		const inputUser = options.add?.user ?? options.remove?.user;
		if (!inputUser) return 'Invalid command.';
		const userToBlacklist = await globalClient.fetchUser(inputUser.user.id);
		if (userToBlacklist.isMod()) {
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
			globalClient.sendToChannelID(
				CHANNELS.BLACKLIST_LOGS,
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
			globalClient.sendToChannelID(
				CHANNELS.BLACKLIST_LOGS,
				`${inputUser.user.username}[${inputUser.user.id}] was unblacklisted by ${user.username}.`
			);
			return `Unblacklisted ${inputUser.user.username}[${inputUser.user.id}].`;
		}
		return 'Invalid command.';
	}
};
