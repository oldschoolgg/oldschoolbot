import { CommandRunOptions } from 'mahoji';

import { minionStatusCommand } from '../lib/abstracted_commands/minionStatusCommand';
import { OSBMahojiCommand } from '../lib/util';

export const mCommand: OSBMahojiCommand = {
	name: 'm',
	description: 'See your current minion status and helpful buttons.',
	options: [],
	run: async ({ userID }: CommandRunOptions) => {
		return minionStatusCommand(userID);
	}
};
