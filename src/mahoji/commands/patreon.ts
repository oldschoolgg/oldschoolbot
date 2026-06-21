import { Emoji } from '@oldschoolgg/toolkit';

export const patreonCommand = defineCommand({
	name: 'patreon',
	description: 'Shows the patreon link for the bot, where you can donate.',
	options: [],
	run: async () => {
		return `You can become a patron to support me or thank me if you're enjoying the bot, and receive some perks. It's highly appreciated. <:seer:924198628191531030> Cyr: <https://www.patreon.com/OldSchoolCyr> OR Magna: <https://github.com/sponsors/gc> ${Emoji.PeepoOSBot}`;
	}
});
