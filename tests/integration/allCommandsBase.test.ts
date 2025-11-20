import { cryptoRng, type RNGProvider } from '@oldschoolgg/rng';
import type { IChannel, IRole } from '@oldschoolgg/schemas';
import { Time, uniqueArr } from '@oldschoolgg/toolkit';
import { convertLVLtoXP } from 'oldschooljs';
import PromiseQueue from 'p-queue';
import { omit } from 'remeda';
import { test } from 'vitest';

import { BitField } from '@/lib/constants.js';
import { SkillsArray } from '@/lib/skilling/types.js';
import { Gear } from '@/lib/structures/Gear.js';
import { allCommandsDONTIMPORT } from '../../src/mahoji/commands/allCommands.js';
import { getMaxUserValues } from '../../src/mahoji/commands/testpotato.js';
import { allUsableItems } from '../../src/mahoji/lib/abstracted_commands/useCommand.js';
import { bankWithAllItems } from '../test-utils/misc.js';
import { createTestUser, mockClient, mockIMember, mockUser } from './util.js';

type CommandInput = Record<string, any>;
type TestCommandOptionsValue = number | string | MahojiUserOption | IChannel | IRole | boolean | undefined;

const LIMIT_PER_COMMAND = 1;
const BASE_LEVEL_ACCOUNTS_TO_TEST = [10, 120];

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
					const autoCompleteResults = await option.autocomplete({
						value: '',
						user: mockedUser,
						userId: mockedUser.id,
						guildId: cryptoRng.pick(['940758552425955348', null])
					});
					allPossibleOptions[option.name] = rng.shuffle(autoCompleteResults.map(c => c.value));
				} else if (option.choices) {
					allPossibleOptions[option.name] = rng.shuffle(option.choices.map(c => c.value));
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				if (allPossibleOptions[option.name].length === 0) {
					allPossibleOptions[option.name] = ['default'];
				}
				if (!option.required) allPossibleOptions[option.name].push(undefined);
				break;
			case 'Integer':
			case 'Number':
				if (option.choices) {
					allPossibleOptions[option.name] = rng.shuffle(option.choices.map(c => c.value));
				} else {
					allPossibleOptions[option.name] = [option.min_value ?? 0, option.max_value ?? 1_000_000];
					const min = option.min_value ?? 0;
					const max = option.max_value ?? min + 50;
					for (let i = 0; i < 3; i++) {
						allPossibleOptions[option.name].push(rng.randInt(min, max));
					}
					if (!option.required) allPossibleOptions[option.name].push(undefined);
					allPossibleOptions[option.name] = uniqueArr(allPossibleOptions[option.name]);
				}
				break;
			case 'Boolean': {
				allPossibleOptions[option.name] = [true, false];
				if (!option.required) allPossibleOptions[option.name].push(undefined);
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

				if (!option.required) allPossibleOptions[option.name].push(undefined);
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

const bitfields = [
	BitField.IsPatronTier3,
	BitField.IsPatronTier1,
	BitField.HasDexScroll,
	BitField.CleanHerbsFarming,
	BitField.ShowDetailedInfo,
	BitField.AlwaysSmallBank,
	BitField.PermanentIronman,
	BitField.DisabledRandomEvents
];

async function createUserWithBaseStats(baseLevel: number) {
	const options = {
		...(getMaxUserValues() as any),
		GP: 100_000_000_000,
		bitfield: cryptoRng.shuffle(bitfields).slice(0, cryptoRng.randInt(0, 3))
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
		const shouldIgnore = (cmdName: string, opt: Record<string, unknown>): boolean =>
			ignoredSubCommands.some(([parent, sub, subCmd]) => {
				if (cmdName !== parent) return false;
				if (!(sub in opt)) return false;
				if (!subCmd) return true;
				const nested = opt[sub] as Record<string, unknown> | undefined;
				return !!nested && subCmd in nested;
			});

		const useCommandOptions: Record<string, any>[] = [];
		for (const item of allUsableItems) {
			useCommandOptions.push({
				item: item,
				secondary_item: null
			});
		}

		const mockedUser: MUser = await mockUser();

		const hardcodedOptions: Record<string, Record<string, CommandOptions>[]> = {
			use: useCommandOptions
		};

		const rngProvider = cryptoRng;
		const processedCommands: { command: AnyCommand; options: CommandOptions[] }[] = [];
		for (const command of commandsToTest) {
			if (ignoredCommands.includes(command.name)) continue;
			let options: CommandOptions[] = hardcodedOptions[command.name] ?? [];

			if (options.length === 0 && command.options && command.options.length > 0) {
				const generated = await Promise.all(
					new Array(3)
						.fill(null)
						.map(() => generateCommandInputs(command.name, mockedUser, rngProvider, command.options))
				);
				options.push(...generated.flat());
			}
			if (options.length === 0) continue;

			// Filter out ignored subcommands
			options = options.filter(opt => !shouldIgnore(command.name, opt));

			// Shuffle for randomness
			options = cryptoRng.shuffle(options);

			// Limit number of permutations per command
			options = options.slice(0, LIMIT_PER_COMMAND);

			processedCommands.push({ command, options });
		}

		let commandsRan = 0;
		const queue = new PromiseQueue({ concurrency: 12, timeout: Time.Second * 30, throwOnTimeout: true });
		const results: { time: number; command: string; options: CommandOptions; rawResults: any[] }[] = [];

		for (const { command, options: allOptions } of processedCommands) {
			for (const options of allOptions) {
				queue.add(async () => {
					try {
						const allUsers = await Promise.all(
							BASE_LEVEL_ACCOUNTS_TO_TEST.map(_l => createUserWithBaseStats(_l))
						);
						const start = performance.now();
						const rawResults = await Promise.all(allUsers.map(u => u.runCmdAndTrip(command, options)));
						const end = performance.now();
						results.push({
							command: command.name,
							options,
							time: end - start,
							rawResults: rawResults.map(i => {
								if (!i.commandResult) return 'No CMD Result?';
								if (typeof i.commandResult === 'string') return i.commandResult;
								if (typeof i.commandResult === 'number') return `SpecialResult: ${i.commandResult}`;
								if (i.commandResult instanceof MessageBuilder || 'build' in i.commandResult) {
									// @ts-expect-error
									return omit(i.commandResult.message, ['files']);
								}
								return omit(i.commandResult, ['files']);
							})
						});
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
		// queue.on('next', () => {
		// 	if (queue.size % 10 !== 0) return;
		// 	console.log(`${queue.size} commands remaining...`);
		// });
		await queue.onEmpty();
		results.sort((a, b) => b.time - a.time);
		// writeFileSync('./command-performance-integration-test.json', JSON.stringify(results, null, 4), 'utf-8');
		console.log(`Ran ${commandsRan.toLocaleString()} commands`);
	}
);
