import type { OSBMahojiCommand } from '../lib/util';

export const inviteCommand: OSBMahojiCommand = {
	name: 'invite',
	description: 'Shows the invite link for the bot.',
	options: [],
	run: async () => {
		return `**Old School Bot (OSB):** https://discord.com/application-directory/303730326692429825
**Bot School Old (BSO):** https://discord.com/application-directory/729244028989603850`;
	}
};
