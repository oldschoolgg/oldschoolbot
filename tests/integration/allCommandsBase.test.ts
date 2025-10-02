import { type RNGProvider, SeedableRNG } from '@oldschoolgg/rng';
import { Stopwatch, sumArr, Time } from '@oldschoolgg/toolkit';
import { Bank, Items } from 'oldschooljs';
import PromiseQueue from 'p-queue';
import { shuffle } from 'remeda';
import { test } from 'vitest';

import { allCommands } from '../../src/mahoji/commands/allCommands.js';
import { getMaxUserValues } from '../../src/mahoji/commands/testpotato.js';
import { allUsableItems } from '../../src/mahoji/lib/abstracted_commands/useCommand.js';
import { createTestUser, mockClient, mockDjsUser, mockedId, mockUser, mockUserOption, TestClient } from './util.js';

type CommandInput = Record<string, any>;

export async function generateCommandInputs(
	mockedUser: MUser,
	rng: RNGProvider,
	options: readonly CommandOption[]
): Promise<CommandInput[]> {
	const results: CommandInput[] = [];
	const allPossibleOptions: Record<string, any[]> = {};

	if (options.length === 0) {
		return [{}];
	}

	for (const option of options) {
		switch (option.type) {
			case 'SubcommandGroup':
			case 'Subcommand':
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(mockedUser, rng, option.options);
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case 'String':
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete('', mockedUser, {} as any);
					allPossibleOptions[option.name] = rng.shuffle(autoCompleteResults.map(c => c.value)).slice(0, 10);
				} else if (option.choices) {
					allPossibleOptions[option.name] = rng.shuffle(option.choices.map(c => c.value)).slice(0, 10);
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				break;
			case 'Integer':
			case 'Number':
				if (option.choices) {
					allPossibleOptions[option.name] = rng.shuffle(option.choices.map(c => c.value)).slice(0, 10);
				} else {
					let value = rng.randInt(1, 10);
					if (option.min_value && option.max_value) {
						value = rng.randInt(option.min_value, option.max_value);
					}
					allPossibleOptions[option.name] = [
						option.min_value ?? 0,
						rng.randInt(option.min_value ?? 0, value),
						value
					];
				}
				break;
			case 'Boolean': {
				allPossibleOptions[option.name] = [true, false];
				break;
			}
			case 'User': {
				const opt: MahojiUserOption = mockUserOption();
				const optWithoutMember: MahojiUserOption = {
					user: mockDjsUser({ userId: mockedId() })
				};
				allPossibleOptions[option.name] = [opt, optWithoutMember];
				break;
			}
			case 'Channel':
			case 'Role':
			case 'Mentionable':
				// results.push({ ...currentPath, [option.name]: `Any ${option.type}` });
				break;
		}
	}

	const sorted = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length);
	const longestOptions = sorted[0]?.length;
	for (let i = 0; i < longestOptions; i++) {
		const obj: Record<string, any> = {};
		for (const [key, val] of Object.entries(allPossibleOptions)) {
			obj[key] = val[i] ?? (val.length > 0 && rng.pick(val));
		}
		results.push(obj);
	}
	return results;
}

test(
	'All Commands Base Test',
	{
		timeout: Time.Minute * 2
	},
	async () => {
		const bankWithAllItems = new Bank();
		for (const item of Items.keys()) {
			bankWithAllItems.add(item, 100_000);
		}
		await mockClient();

		await ClientSettings.fetch({ construction_cost_bank: true });

		const ignoredCommands = [
			'bank',
			'bingo',
			'bossrecords',
			'stats',
			'clues',
			'kc',
			'lvl',
			'testpotato',
			'xp',
			'wiki',
			'casket',
			'finish',
			'trivia',
			'ge',
			'rp',
			'cl',
			'gearpresets',
			'admin',
			'loot',
			'slayer',
			'trade',
			'trivia',
			'data',
			'leaderboard',
			'lb',
			'bs',
			'redeem',

			'simulate',
			'leagues',
			'kill'
		];
		const commandsToTest = allCommands.filter(c => !ignoredCommands.includes(c.name));
		console.log(`Running ${commandsToTest.length} commands...`);

		const ignoredSubCommands = [
			['tools', 'patron', 'cl_bank'],
			['loot', 'view'],
			['minion', 'bankbg'],
			['minion', 'daily'],
			['gamble', 'luckypick'],
			['gamble', 'duel'],
			['config', 'toggle']
		];

		const useCommandOptions: Record<string, any>[] = [];
		for (const item of allUsableItems) {
			useCommandOptions.push({
				item: item,
				secondary_item: null
			});
		}

		const mockedUser: MUser = await mockUser();

		const hardcodedOptions: Record<string, Record<string, any>[]> = {
			use: useCommandOptions
		};

		const rngProvider = new SeedableRNG(1);
		const stopwatch = new Stopwatch();
		const processedCommands: { command: OSBMahojiCommand; options: any[] }[] = [];
		for (const command of commandsToTest) {
			if (ignoredCommands.includes(command.name)) continue;
			let options = hardcodedOptions[command.name];

			if (!options && command.options && command.options.length > 0) {
				options = await generateCommandInputs(mockedUser, rngProvider, command.options);
			}

			if (!options) {
				continue;
			}
			outer: for (const option of options) {
				for (const [parent, sub, subCommand] of ignoredSubCommands) {
					if (command.name === parent && option[sub] && (subCommand ? option[sub][subCommand] : true)) {
						// stopwatch.check(
						// 	`Skipping subcommand ${command.name} with options ${JSON.stringify(option)} due to ignore list.`
						// );
						continue outer;
					}
				}
			}
			processedCommands.push({ command, options });
		}

		// If running in CI, limit amount of permutations that are ran
		if (process.env.CI) {
			for (const command of processedCommands) {
				command.options = shuffle(command.options).slice(0, 2);
			}
		}

		const totalCommands = sumArr(processedCommands.map(i => i.options.length));

		const queue = new PromiseQueue({ concurrency: 6 });

		let commandsRan = 0;
		for (const { command, options: allOptions } of processedCommands) {
			for (const options of allOptions) {
				queue.add(async () => {
					try {
						const maxUser = await createTestUser(bankWithAllItems, {
							...(getMaxUserValues() as any),
							GP: 100_000_000_000
						});
						// stopwatch.check(`	[${command.name}] User ${maxUser.id} created and maxed.`);
						await maxUser.runCommand(command, options);
						await maxUser.runActivity();
						// stopwatch.check(`	[${command.name}] Finished running command ${command.name}, result was: ${typeof res === "string" ? res.replace(/\r?\n|\r/g, ' ').replace(/[*_`~>|#]/g, '') : res}`);
						commandsRan++;
						// stopwatch.check(`${commandsRan}/${totalCommands} commands ran ${command.name}`);
					} catch (err) {
						console.error(
							`Failed to run command ${command.name} with options ${JSON.stringify(options)}: ${err}`
						);
						throw err;
					}
				});
			}
		}

		await queue.onEmpty();
		await queue.onIdle();
		console.log(
			`[${stopwatch.toString()}] Finished running ${commandsRan}/${totalCommands} commands, ${TestClient.activitiesProcessed} activities`
		);
	}
);
