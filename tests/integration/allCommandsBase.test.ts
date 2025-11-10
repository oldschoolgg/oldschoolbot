import { cryptoRng, type RNGProvider } from '@oldschoolgg/rng';
import type { IChannel, IRole } from '@oldschoolgg/schemas';
import { Stopwatch, Time, uniqueArr } from '@oldschoolgg/toolkit';
import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import PromiseQueue from 'p-queue';
import { test } from 'vitest';

import { SkillsArray } from '@/lib/skilling/types.js';
import { Gear } from '@/lib/structures/Gear.js';
import { allCommandsDONTIMPORT } from '../../src/mahoji/commands/allCommands.js';
import { getMaxUserValues } from '../../src/mahoji/commands/testpotato.js';
import { allUsableItems } from '../../src/mahoji/lib/abstracted_commands/useCommand.js';
import { createTestUser, mockClient, mockIMember, mockUser, TestClient } from './util.js';

type CommandInput = Record<string, any>;
type TestCommandOptionsValue = number | string | MahojiUserOption | IChannel | IRole | boolean;

const LIMIT_PER_COMMAND = 50;
const BASE_LEVEL_ACCOUNTS_TO_TEST = [99, 90, 70, 50, 30, 20, 15, 10];

export async function generateCommandInputs(
	commandName: string,
	mockedUser: MUser,
	rng: RNGProvider,
	options: readonly CommandOption[]
): Promise<CommandInput[]> {
	const results: CommandInput[] = [];
	const allPossibleOptions: Record<string, TestCommandOptionsValue[]> = {};

	if (options.length === 0) {
		return [{}];
	}

	for (const option of options) {
		switch (option.type) {
			case 'SubcommandGroup':
			case 'Subcommand':
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(commandName, mockedUser, rng, option.options);
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case 'String':
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete({ value: '', user: mockedUser, userId: mockedUser.id, guildId: cryptoRng.pick(['940758552425955348', null]) });
					allPossibleOptions[option.name] = rng.shuffle(autoCompleteResults.map(c => c.value));
					if (allPossibleOptions[option.name].some(i => typeof i === 'undefined')) throw new Error('1');
				} else if (option.choices) {
					allPossibleOptions[option.name] = rng.shuffle(option.choices.map(c => c.value));
					if (allPossibleOptions[option.name].some(i => typeof i === 'undefined')) throw new Error('2');
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				if (allPossibleOptions[option.name].length === 0) {
					allPossibleOptions[option.name] = ['default'];
				}
				break;
			case 'Integer':
			case 'Number':
				if (option.choices) {
					allPossibleOptions[option.name] = rng.shuffle(option.choices.map(c => c.value));
				} else {
					allPossibleOptions[option.name] = [option.min_value ?? 0, option.max_value ?? 1_000_000];
					const min = option.min_value ?? 0;
					const max = option.max_value ?? 1_000_000;
					for (let i = 0; i < 3; i++) {
						allPossibleOptions[option.name].push(rng.randInt(min, max));
					}
					allPossibleOptions[option.name] = uniqueArr(allPossibleOptions[option.name]);
				}
				break;
			case 'Boolean': {
				allPossibleOptions[option.name] = [true, false];
				break;
			}
			case 'User': {
				const userForOption = await createTestUser();
				const opt: MahojiUserOption = {
					user: userForOption.getIUser(),
					member: mockIMember({ userId: userForOption.id })
				};
				const optWithoutMember: MahojiUserOption = {
					user: userForOption.getIUser()
				};
				allPossibleOptions[option.name] = [opt, optWithoutMember];
				if (allPossibleOptions[option.name].some(i => typeof i === 'undefined')) throw new Error('3');
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
	const max = sorted[0]?.length ?? 1;

	// pad all arrays to max length
	for (const key of Object.keys(allPossibleOptions)) {
		const arr = allPossibleOptions[key];
		if (arr.length < max) {
			const padded: any[] = [];
			for (let i = 0; i < max; i++) padded.push(arr[i % arr.length]);
			allPossibleOptions[key] = padded;
		}
	}

	for (let i = 0; i < max; i++) {
		const obj: Record<string, any> = {};
		for (const [key, arr] of Object.entries(allPossibleOptions)) obj[key] = arr[i];
		results.push(obj);
	}

	return results;
}

const bankWithAllItems = new Bank();
for (const item of Items.keys()) {
	bankWithAllItems.add(item, 100_000);
}
async function createUserWithBaseStats(baseLevel: number) {
	const options = {
		...(getMaxUserValues() as any),
		GP: 100_000_000_000
	};
	for (const skill of SkillsArray) {
		options[`skills_${skill}`] = convertLVLtoXP(baseLevel);
	}
	if (baseLevel > 80) {
		options.gear_range = new Gear({
			head: 'Masori mask(f)',
			neck: 'Necklace of anguish',
			body: 'Masori Body (f)',
			cape: "Blessed dizana's quiver",
			hands: 'Zaryte vambraces',
			legs: 'Masori chaps (f)',
			feet: 'Pegasian boots',
			'2h': 'Twisted bow',
			ring: 'Venator ring',
			ammo: 'Dragon arrow'
		}).raw();
		options.gear_mage = new Gear({
			head: 'Ancestral hat',
			neck: 'Occult necklace',
			body: 'Ancestral robe top',
			cape: 'Imbued saradomin cape',
			hands: 'Tormented bracelet',
			legs: 'Ancestral robe bottom',
			feet: 'Eternal boots',
			'2h': "Tumeken's shadow",
			ring: 'Magus ring'
		}).raw();
		options.gear_melee = new Gear({
			head: 'Torva full helm',
			neck: 'Amulet of torture',
			body: 'Torva platebody',
			cape: 'Infernal cape',
			hands: 'Ferocious gloves',
			legs: 'Torva platelegs',
			feet: 'Primordial boots',
			'2h': 'Scythe of vitur',
			ring: 'Ultor ring'
		}).raw();
	}
	const user = await createTestUser(bankWithAllItems, options);
	return user;
}

test(
	'All Commands Base Test',
	{
		timeout: Time.Minute * 10
	},
	async () => {
		await mockClient();

		await ClientSettings.fetch({ construction_cost_bank: true });

		const ignoredCommands = [
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
			'rp',
			'admin',
			'simulate',
			'leagues',
			'kill',
			'stats',
			'gearpresets',
			'cl',
			'bank',
			'bs',
			'ge',
			'data',
			'mass'
		];
		const commandsToTest = allCommandsDONTIMPORT.filter(c => !ignoredCommands.includes(c.name));

		const ignoredSubCommands = [
			['tools', 'patron', 'cl_bank'],
			['loot', 'view'],
			['gear', 'best_in_slot'],
			['gear', 'view']
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

		const rngProvider = cryptoRng;
		const stopwatch = new Stopwatch();
		const processedCommands: { command: AnyCommand; options: CommandOptions[] }[] = [];
		let totalCommands = 0;
		for (const command of commandsToTest) {
			if (ignoredCommands.includes(command.name)) continue;
			let options: CommandOptions[] = hardcodedOptions[command.name];

			if (!options && command.options && command.options.length > 0) {
				options = await generateCommandInputs(command.name, mockedUser, rngProvider, command.options);
				options.push(...(await generateCommandInputs(command.name, mockedUser, rngProvider, command.options)));
				options.push(...(await generateCommandInputs(command.name, mockedUser, rngProvider, command.options)));
			}
			if (!options) {
				continue;
			}
			outer: for (const option of options) {
				for (const [parent, sub, subCommand] of ignoredSubCommands) {
					// @ts-expect-error
					if (command.name === parent && option[sub] && (subCommand ? option[sub][subCommand] : true)) {
						continue outer;
					}
				}
			}
			options = cryptoRng.shuffle(options).slice(0, LIMIT_PER_COMMAND);
			totalCommands += options.length;
			processedCommands.push({ command, options });
		}

		console.log(`Starting to run ${totalCommands} command permutations...`);

		let commandsRan = 0;
		const queue = new PromiseQueue({ concurrency: 12, timeout: Time.Second * 30, throwOnTimeout: true });

		for (const { command, options: allOptions } of processedCommands) {
			for (const options of allOptions) {
				queue.add(async () => {
					try {
						const allUsers = await Promise.all(
							BASE_LEVEL_ACCOUNTS_TO_TEST.map(_l => createUserWithBaseStats(_l))
						);
						await Promise.all(allUsers.map(u => u.runCmdAndTrip(command, options)));
						commandsRan += BASE_LEVEL_ACCOUNTS_TO_TEST.length;
					} catch (err) {
						console.error(
							`Failed to run command ${command.name} with options ${JSON.stringify(options)}: ${err}`
						);
						throw err;
					}
				});
			}
		}
		queue.on('next', () => {
			console.log(`${queue.size} commands remaining...`);
		});
		await queue.onEmpty();

		console.log(
			`[${stopwatch.toString()}] Finished running ${commandsRan} commands, ${TestClient.activitiesProcessed} activities`
		);
	}
);
