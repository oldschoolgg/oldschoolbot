import { readFileSync, writeFileSync } from 'node:fs';
import { type AbstractCommand, convertMahojiCommandToAbstractCommand } from '@oldschoolgg/toolkit/discord-util';
import { md5sum } from '@oldschoolgg/toolkit/node';
import { stringMatches } from '@oldschoolgg/toolkit/string-util';
import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { ApplicationCommandOptionType } from 'discord.js';
import { DateTime } from 'luxon';

import { BOT_TYPE } from '../src/lib/constants.js';
import { allCommands } from '../src/mahoji/commands/allCommands.js';

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
