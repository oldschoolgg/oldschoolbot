import './no-prisma';

import { writeFileSync } from 'node:fs';
import { stringMatches } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';

import { BOT_TYPE } from '../lib/constants';
import { allCommands } from '../mahoji/commands/allCommands';
import type { AbstractCommand } from '../mahoji/lib/inhibitors';
import { convertMahojiCommandToAbstractCommand } from '../mahoji/lib/util';

async function renderCommands() {
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

export async function commandsFile() {
	const commands = await renderCommands();
	const path = `./src/lib/data/${BOT_TYPE.toLowerCase()}.commands.json`;
	writeFileSync(path, `${JSON.stringify(commands, null, '	')}\n`);
}
