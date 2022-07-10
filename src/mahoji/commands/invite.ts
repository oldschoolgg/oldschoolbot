import { OSBMahojiCommand } from '../lib/util';

export const inviteCommand: OSBMahojiCommand = {
	name: 'invite',
	description: 'Shows the invite link for the bot.',
	options: [],
	run: async () => {
		return `OSB - https://www.oldschool.gg/invite/osb
BSO - https://www.oldschool.gg/invite/bso`;
	}
};
