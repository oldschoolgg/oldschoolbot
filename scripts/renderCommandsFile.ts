import { writeFile } from 'node:fs/promises';
import { stringMatches } from '@oldschoolgg/toolkit/util';
import { ApplicationCommandOptionType } from 'discord.js';

import '../src/lib/safeglobals';
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
			return {
				name: cmd.name,
				desc: cmd.attributes?.description,
				examples: cmd.attributes?.examples,
				flags: cmd.attributes?.categoryFlags,
				subOptions
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

async function renderCommandsFile() {
	const commands = await renderCommands();
	const path = `data/${BOT_TYPE.toLowerCase()}.commands.json`;
	await writeFile(path, `${JSON.stringify(commands, null, '	')}\n`);
	process.exit(0);
}

renderCommandsFile();
