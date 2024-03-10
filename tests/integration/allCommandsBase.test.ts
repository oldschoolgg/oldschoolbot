import { ApplicationCommandOptionType } from 'discord.js';
import { randInt, shuffleArr } from 'e';
import { CommandOption } from 'mahoji/dist/lib/types';
import { test, vi } from 'vitest';

import { activitiesCommand } from '../../src/mahoji/commands/activities';
import { askCommand } from '../../src/mahoji/commands/ask';
import { bankCommand } from '../../src/mahoji/commands/bank';
import { bsCommand } from '../../src/mahoji/commands/bs';
import { buildCommand } from '../../src/mahoji/commands/build';
import { buyCommand } from '../../src/mahoji/commands/buy';
import { chooseCommand } from '../../src/mahoji/commands/choose';
import { chopCommand } from '../../src/mahoji/commands/chop';
import { claimCommand } from '../../src/mahoji/commands/claim';
import { clueCommand } from '../../src/mahoji/commands/clue';
import { cluesCommand } from '../../src/mahoji/commands/clues';
import { createCommand } from '../../src/mahoji/commands/create';
import { dryCalcCommand } from '../../src/mahoji/commands/drycalc';
import { farmingCommand } from '../../src/mahoji/commands/farming';
import { fishCommand } from '../../src/mahoji/commands/fish';
import { fletchCommand } from '../../src/mahoji/commands/fletch';
import { gpCommand } from '../../src/mahoji/commands/gp';
import { huntCommand } from '../../src/mahoji/commands/hunt';
import { lapsCommand } from '../../src/mahoji/commands/laps';
import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard';
import { lightCommand } from '../../src/mahoji/commands/light';
import { lootCommand } from '../../src/mahoji/commands/loot';
import { minigamesCommand } from '../../src/mahoji/commands/minigames';
import { minionCommand } from '../../src/mahoji/commands/minion';
import { openCommand } from '../../src/mahoji/commands/open';
import { patreonCommand } from '../../src/mahoji/commands/patreon';
import { payCommand } from '../../src/mahoji/commands/pay';
import { pohCommand } from '../../src/mahoji/commands/poh';
import { priceCommand } from '../../src/mahoji/commands/price';
import { raidCommand } from '../../src/mahoji/commands/raid';
import { rollCommand } from '../../src/mahoji/commands/roll';
import { runecraftCommand } from '../../src/mahoji/commands/runecraft';
import { slayerCommand } from '../../src/mahoji/commands/slayer';
import { smeltingCommand } from '../../src/mahoji/commands/smelt';
import { stealCommand } from '../../src/mahoji/commands/steal';
import { toolsCommand } from '../../src/mahoji/commands/tools';
import { randomMock } from './setup';
import { createTestUser, TestUser } from './util';

// Don't let any of these commands create an activity
vi.mock('../../../src/lib/util/addSubTaskToActivityTask', async () => {
	const actual: any = await vi.importActual('../../../src/lib/util/addSubTaskToActivityTask');
	return {
		...actual,
		default: async (args: any) => {
			console.log(`Sending ${args}`);
		}
	};
});

const commands = [
	activitiesCommand,
	askCommand,
	bankCommand,
	bsCommand,
	clueCommand,
	claimCommand,
	cluesCommand,
	farmingCommand,
	gpCommand,
	lapsCommand,
	leaderboardCommand,
	fletchCommand,
	fishCommand,
	dryCalcCommand,
	createCommand,
	chopCommand,
	chooseCommand,
	buildCommand,
	buyCommand,
	huntCommand,
	lightCommand,
	lootCommand,
	minionCommand,
	minigamesCommand,
	runecraftCommand,
	stealCommand,
	rollCommand,
	raidCommand,
	priceCommand,
	openCommand,
	patreonCommand,
	payCommand,
	pohCommand,
	slayerCommand,
	toolsCommand,
	stealCommand,
	smeltingCommand
];

type CommandInput = Record<string, any>;
async function generateCommandInputs(
	user: TestUser,
	options: CommandOption[],
	currentPath: CommandInput = {}
): Promise<CommandInput[]> {
	let results: CommandInput[] = [];

	for (const option of options) {
		switch (option.type) {
			case ApplicationCommandOptionType.SubcommandGroup:
			case ApplicationCommandOptionType.Subcommand:
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(user, option.options);
					subOptionsResults.forEach(subResult => {
						results.push({ [option.name]: subResult });
					});
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete('', { id: user.id } as any, {} as any);
					shuffleArr(autoCompleteResults)
						.slice(0, 5)
						.forEach(result => {
							results.push({ ...currentPath, [option.name]: result.value as string });
						});
				}
				if (option.choices) {
					option.choices.forEach(choice => {
						results.push({ ...currentPath, [option.name]: choice.value });
					});
				} else {
					// For simplicity, omitting autocomplete handling
					results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				}
				break;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Number:
				if (option.choices) {
					option.choices.forEach(choice => {
						results.push({ ...currentPath, [option.name]: choice.value });
					});
				} else {
					let value = randInt(1, 1000);
					if (option.min_value && option.max_value) {
						value = randInt(option.min_value, option.max_value);
					}
					// For simplicity, omitting autocomplete handling
					results.push({ ...currentPath, [option.name]: value });
				}
				break;
			case ApplicationCommandOptionType.Boolean:
			case ApplicationCommandOptionType.User:
			case ApplicationCommandOptionType.Channel:
			case ApplicationCommandOptionType.Role:
			case ApplicationCommandOptionType.Mentionable:
				results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				break;
		}
	}

	return results;
}

test('All Commands Base Test', async () => {
	randomMock();
	const user = await createTestUser();
	for (const command of commands) {
		const options = await generateCommandInputs(user, command.options!);
		for (const option of options) {
			try {
				const res = await user.runCommand(command, option);
				console.log(`Ran command ${command.name}
Options: ${JSON.stringify(option)}
Result: ${res}`);
			} catch (err) {
				console.error(`Failed to run command ${command.name} with options ${JSON.stringify(option)}`);
			}
		}
	}
});
