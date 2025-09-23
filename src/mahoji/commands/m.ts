import { minionStatusCommand } from '@/mahoji/lib/abstracted_commands/minionStatusCommand.js';

export const mCommand: OSBMahojiCommand = {
	name: 'm',
	description: 'See your current minion status and helpful buttons.',
	options: [],
	run: async ({ userID, channelID }: CommandRunOptions) => {
		return minionStatusCommand(await mUserFetch(userID), channelID.toString());
	}
};
