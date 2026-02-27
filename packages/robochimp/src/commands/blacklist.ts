import { syncBlacklists } from '@/lib/syncBlacklists.js';
import { CHANNELS } from '@/util.js';

async function emitBlacklistLog(message: string) {
	if (globalClient.isProduction) {
		globalClient.sendMessage(CHANNELS.BLACKLIST_LOGS, message);
	}
}

export const blacklistCommand = defineCommand({
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
	run: async ({ options, user }) => {
		if (!user.isMod()) return { content: 'Ook OOK OOK', epfhemeral: true };
		const inputUser = options.add?.user ?? options.remove?.user;
		if (!inputUser) return 'Invalid command.';
		const userToBlacklist = await globalClient.fetchRUser(inputUser.user.id);
		if (userToBlacklist.isMod()) {
			return { content: 'I will destroy you.', epfhemeral: true };
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
			await syncBlacklists();
			await emitBlacklistLog(
				`${inputUser.user.username}[${inputUser.user.id}] was blacklisted by ${user.mention}, reason: \`${options.add.reason}\`.`
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
			await syncBlacklists();
			await emitBlacklistLog(
				`${inputUser.user.username}[${inputUser.user.id}] was unblacklisted by ${user.mention}.`
			);
			return `Unblacklisted ${inputUser.user.username}[${inputUser.user.id}].`;
		}
		return 'Invalid command.';
	}
});
