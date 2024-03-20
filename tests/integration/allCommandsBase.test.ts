import { writeFileSync } from 'node:fs';

import { ObjectEnumValue } from '@prisma/client/runtime/library';
import { ApplicationCommandOptionType } from 'discord.js';
import { notEmpty, randArrItem, randInt, shuffleArr, Time } from 'e';
import { CommandOption } from 'mahoji/dist/lib/types';
import { Bank, Items } from 'oldschooljs';
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
import { createTestUser, mockClient, TestUser } from './util';

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
async function generateCommandInputs(user: TestUser, options: readonly CommandOption[]): Promise<CommandInput[]> {
	let results: CommandInput[] = [];
	const allPossibleOptions: Record<string, any[]> = {};

	for (const option of options) {
		switch (option.type) {
			case ApplicationCommandOptionType.SubcommandGroup:
			case ApplicationCommandOptionType.Subcommand:
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(user, option.options);
					allPossibleOptions[option.name] = subOptionsResults;
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete('', { id: user.id } as any, {} as any);
					allPossibleOptions[option.name] = autoCompleteResults.map(c => c.value);
				} else if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value);
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				break;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Number:
				if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value);
				} else {
					let value = randInt(1, 1000);
					if (option.min_value && option.max_value) {
						value = randInt(option.min_value, option.max_value);
					}
					allPossibleOptions[option.name] = [option.min_value, option.max_value, value];
				}
				break;
			case ApplicationCommandOptionType.Boolean: {
				allPossibleOptions[option.name] = [true, false];
				break;
			}
			case ApplicationCommandOptionType.User: {
				allPossibleOptions[option.name] = [
					{
						user: {
							id: '123',
							username: 'username',
							bot: false
						},
						member: undefined
					}
				];
				break;
			}
			case ApplicationCommandOptionType.Channel:
			case ApplicationCommandOptionType.Role:
			case ApplicationCommandOptionType.Mentionable:
				// results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				break;
		}
	}

	const longestOptions = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length)[0].length;
	for (let i = 0; i < longestOptions; i++) {
		let obj: Record<string, any> = {};
		for (const [key, val] of Object.entries(allPossibleOptions)) {
			obj[key] = val[i] ?? randArrItem(val);
		}
		results.push(obj);
	}
	return results;
}

const bank = new Bank();
for (const item of Items.array()) {
	bank.add(item.id, 100_000_000);
}

test(
	'All Commands Base Test',
	async () => {
		randomMock();
		const user = await createTestUser();
		const maxUser = await createTestUser();
		await maxUser.max();
		await maxUser.addItemsToBank({ items: bank });
		const client = await mockClient();
		for (const command of commands) {
			if (command.name === 'bank') continue;
			const options = await generateCommandInputs(user, command.options!);
			// writeFileSync(`${command.name}.txt`, JSON.stringify(options, null, 4));
			for (const option of options) {
				try {
					console.log(`Running command ${command.name}
Options: ${JSON.stringify(option)}`);
					const res = await maxUser.runCommand(command, option);
					await client.processActivities();
					console.log(`Result: ${JSON.stringify(res)}`);
				} catch (err) {
					console.error(
						`Failed to run command ${command.name} with options ${JSON.stringify(option)}: ${err}`
					);
					throw err;
				}
			}
		}
	},
	{
		timeout: Time.Minute * 10
	}
);
