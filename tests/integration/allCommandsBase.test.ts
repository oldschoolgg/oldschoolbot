import { Stopwatch } from '@oldschoolgg/toolkit/structures';
import { generateCommandInputs } from '@oldschoolgg/toolkit/util';
import { Time, sumArr } from 'e';
import { Bank, Items } from 'oldschooljs';
import PromiseQueue from 'p-queue';
import { shuffle } from 'remeda';
import { expect, test, vi } from 'vitest';

import { getMaxUserValues } from '@/mahoji/commands/testpotato';
import { allUsableItems } from '@/mahoji/lib/abstracted_commands/useCommand';
import type { OSBMahojiCommand } from '@/mahoji/lib/util';
import { mahojiClientSettingsFetch } from '../../src/lib/util/clientSettings';
import { handleMahojiConfirmation } from '../../src/lib/util/handleMahojiConfirmation';
import { allCommands } from '../../src/mahoji/commands/allCommands';
import { createTestUser, mockClient } from './util';

test(
	'All Commands Base Test',
	{
		timeout: Time.Minute * 10
	},
	async () => {
		const bankWithAllItems = new Bank();
		for (const item of Items.keys()) {
			bankWithAllItems.add(item, 100_000);
		}
		expect(vi.isMockFunction(handleMahojiConfirmation)).toBe(true);
		const client = await mockClient();

		await mahojiClientSettingsFetch({ construction_cost_bank: true });

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

		const hardcodedOptions: Record<string, Record<string, any>[]> = {
			use: useCommandOptions
		};

		const stopwatch = new Stopwatch();
		const processedCommands: { command: OSBMahojiCommand; options: any[] }[] = [];
		for (const command of commandsToTest) {
			if (ignoredCommands.includes(command.name)) continue;
			const options = hardcodedOptions[command.name] ?? (await generateCommandInputs(command.options!));
			if (options.length === 0) {
				throw new Error(`No options generated for command ${command.name}`);
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
				if (queue.size % 30 === 0) {
					queue.add(async () => client.processActivities());
				}
				queue.add(async () => {
					try {
						const maxUser = await createTestUser(bankWithAllItems, {
							...(getMaxUserValues() as any),
							GP: 100_000_000_000
						});
						// stopwatch.check(`	[${command.name}] User ${maxUser.id} created and maxed.`);
						await maxUser.runCommand(command, options);
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

		queue.add(async () => client.processActivities());

		await queue.onEmpty();
		await queue.onIdle();
		await client.processActivities();
		console.log(
			`[${stopwatch.toString()}] Finished running ${commandsRan}/${totalCommands} commands, ${client.activitiesProcessed} activities`
		);
	}
);
