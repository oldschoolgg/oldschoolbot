import './base.js';

import { REST } from 'discord.js';

import { globalConfig } from '@/lib/constants.js';
import { bulkUpdateCommands } from '@/lib/discord/utils.js';
import { allCommandsDONTIMPORT } from '@/mahoji/commands/allCommands.js';

async function main() {
	const rest = new REST({ version: '10' }).setToken(globalConfig.botToken);
	await bulkUpdateCommands({
		commands: allCommandsDONTIMPORT,
		rest,
		applicationID: globalConfig.clientID
	});
}

main()
	.then(() => {
		console.log('Slash commands synced.');
		process.exit(0);
	})
	.catch(err => {
		console.error('Failed to sync slash commands.', err);
		process.exit(1);
	});
