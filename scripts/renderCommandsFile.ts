import './base.js';

import { readFileSync, writeFileSync } from 'node:fs';
import { md5sum, Stopwatch, stringMatches } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { DateTime } from 'luxon';

import { allCommands } from '@/mahoji/commands/allCommands.js';
import { BOT_TYPE } from '../src/lib/constants.js';
import { tearDownScript } from './scriptUtil.js';

async function renderCommands() {
	return allCommands
		.filter(c => {
			const has = typeof c.description === 'string' && c.description.length > 1;
			if (!has) {
				console.log(`Command ${c.name} has no description/attributes.`);
			}
			return has;
		})
		.filter(i => !['admin', 'testpotato'].includes(i.name))
		.map(cmd => {
			const mahojiCommand = allCommands.find(i => stringMatches(i.name, cmd.name));
			if (!mahojiCommand) {
				throw new Error(`Could not find mahoji command for ${cmd.name}`);
			}
			const subOptions: string[] = [];
			for (const option of mahojiCommand.options) {
				if (
					option.type === ApplicationCommandOptionType.SubcommandGroup ||
					option.type === ApplicationCommandOptionType.Subcommand
				) {
					subOptions.push(option.name);
				}
			}
			subOptions.sort((a, b) => a.localeCompare(b));
			return {
				name: cmd.name,
				desc: cmd?.description,
				examples: cmd.attributes?.examples?.sort((a, b) => a.localeCompare(b)),
				flags: cmd.attributes?.categoryFlags?.sort((a, b) => a.localeCompare(b)),
				subOptions
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

export async function renderCommandsFile() {
	const stopwatch = new Stopwatch();
	const commands = await renderCommands();
	const filePath = `data/${BOT_TYPE.toLowerCase()}/commands.json`;

	const hash = md5sum(JSON.stringify(commands));
	const previousHash = JSON.parse(readFileSync(filePath, 'utf-8')).hash || '';
	if (hash === previousHash) {
		console.log('Commands JSON file is up to date');
		return;
	}

	writeFileSync(
		filePath,
		`${JSON.stringify(
			{
				hash,
				date: DateTime.utc().toISO(),
				data: commands
			},
			null,
			'	'
		)}\n`
	);
	stopwatch.check('Finished commands file.');
}

renderCommandsFile();
tearDownScript();
