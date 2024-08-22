import { Emoji } from '../../lib/constants';
import type { OSBMahojiCommand } from '../lib/util';

export const patreonCommand: OSBMahojiCommand = {
	name: 'patreon',
	description: 'Shows the patreon link for the bot, where you can donate.',
	options: [],
	run: async () => {
		return `You can become a patron to support me or thank me if you're enjoying the bot, and receive some perks. It's highly appreciated. <https://www.patreon.com/oldschoolbot> OR <https://github.com/sponsors/gc> ${Emoji.PeepoOSBot}`;
	}
};
