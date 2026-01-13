import { minionStatusCommand } from '@/mahoji/lib/abstracted_commands/minionStatusCommand.js';

export const mCommand = defineCommand({
	name: 'm',
	description: 'See your current minion status and helpful buttons.',
	options: [],
	run: async ({ user, channelId }) => {
		return minionStatusCommand(user, channelId);
	}
});
