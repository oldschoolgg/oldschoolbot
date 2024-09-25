import type { CommandRunOptions } from '@oldschoolgg/toolkit/util';

import { minionStatusCommand } from '../lib/abstracted_commands/minionStatusCommand';
import type { OSBMahojiCommand } from '../lib/util';

export const mCommand: OSBMahojiCommand = {
	name: 'm',
	description: 'See your current minion status and helpful buttons.',
	options: [],
	run: async ({ userID }: CommandRunOptions) => {
		return minionStatusCommand(await mUserFetch(userID));
	}
};
