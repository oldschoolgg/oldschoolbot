import { readFileSync, writeFileSync } from 'node:fs';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { md5sum, stringMatches } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';
import { DateTime } from 'luxon';

import { BOT_TYPE } from '../src/lib/constants';
import { allCommands } from '../src/mahoji/commands/allCommands';
import type { AbstractCommand } from '../src/mahoji/lib/inhibitors';
import { convertMahojiCommandToAbstractCommand } from '../src/mahoji/lib/util';

function renderCommands() {
	return allCommands
		.map(c => convertMahojiCommandToAbstractCommand(c))
		.filter(c => {
			const has = typeof c.attributes?.description === 'string' && c.attributes.description.length > 1;
			if (!has) {
				console.log(`Command ${c.name} has no description/attributes.`);
			}
			return has;
		})
		.filter(i => !['admin', 'testpotato'].includes(i.name))
		.map((cmd: AbstractCommand) => {
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
				desc: cmd.attributes?.description,
				examples: cmd.attributes?.examples?.sort((a, b) => a.localeCompare(b)),
				flags: cmd.attributes?.categoryFlags?.sort((a, b) => a.localeCompare(b)),
				subOptions
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

export function renderCommandsFile() {
	const stopwatch = new Stopwatch();
	const commands = renderCommands();
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
