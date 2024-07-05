import type { CommandOption } from '@oldschoolgg/toolkit';
import { ApplicationCommandOptionType } from 'discord.js';
import { Time, randArrItem, randInt, shuffleArr } from 'e';
import { Bank, Items } from 'oldschooljs';
import { expect, test, vi } from 'vitest';

import { BitField, minionActivityCache } from '../../src/lib/constants';
import { prisma } from '../../src/lib/settings/prisma';
import { mahojiClientSettingsFetch } from '../../src/lib/util/clientSettings';
import { handleMahojiConfirmation } from '../../src/lib/util/handleMahojiConfirmation';
import { allCommands } from '../../src/mahoji/commands/allCommands';
import { randomMock } from './setup';
import type { TestUser } from './util';
import { createTestUser, mockClient } from './util';

type CommandInput = Record<string, any>;
async function generateCommandInputs(user: TestUser, options: readonly CommandOption[]): Promise<CommandInput[]> {
	const results: CommandInput[] = [];
	const allPossibleOptions: Record<string, any[]> = {};

	for (const option of options) {
		switch (option.type) {
			case ApplicationCommandOptionType.SubcommandGroup:
			case ApplicationCommandOptionType.Subcommand:
				if (option.options) {
					const subOptionsResults = await generateCommandInputs(user, option.options);
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete('', { id: user.id } as any, {} as any);
					allPossibleOptions[option.name] = shuffleArr(autoCompleteResults.map(c => c.value)).slice(0, 3);
				} else if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value).slice(0, 3);
				} else if (['guild_id', 'message_id'].includes(option.name)) {
					allPossibleOptions[option.name] = ['157797566833098752'];
				} else {
					allPossibleOptions[option.name] = ['plain string'];
				}
				break;
			case ApplicationCommandOptionType.Integer:
			case ApplicationCommandOptionType.Number:
				if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value);
				} else {
					let value = randInt(1, 10);
					if (option.min_value && option.max_value) {
						value = randInt(option.min_value, option.max_value);
					}
					allPossibleOptions[option.name] = [option.min_value, value];
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
							id: '425134194436341760',
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

	const sorted = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length);
	const longestOptions = sorted[0]?.length;
	for (let i = 0; i < longestOptions; i++) {
		const obj: Record<string, any> = {};
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
		expect(vi.isMockFunction(handleMahojiConfirmation)).toBe(true);
		const client = await mockClient();
		process.env.CLIENT_ID = client.data.id;
		randomMock();
		const maxUser = await createTestUser(bank, { GP: 100_000_000_000 });
		await maxUser.max();
		await maxUser.update({ bitfield: [BitField.isModerator] });
		await mahojiClientSettingsFetch({ construction_cost_bank: true });
		await prisma.activity.deleteMany({
			where: {
				user_id: BigInt(maxUser.id)
			}
		});

		const ignoredCommands = [
			'leagues',
			'bank',
			'bingo',
			'bossrecords',
			'stats',
			'clues',
			'kc',
			'simulate',
			'lvl',
			'testpotato',
			'xp',
			'wiki',
			'casket',
			'finish',
			'kill',
			'trivia',
			'ge',
			'rp',
			'cl',
			'gearpresets'
		];
		const cmds = allCommands;

		for (const command of cmds) {
			if (ignoredCommands.includes(command.name)) continue;
			if (cmds.some(c => c.name === command.name)) continue;
			throw new Error(
				`If you added a new command (${command.name}), you need to put it in the allCommandsBase.test.ts file.`
			);
		}

		const ignoredSubCommands = [
			['tools', 'patron', 'cl_bank'],
			['loot', 'view'],
			['minion', 'bankbg']
		];

		const promises = [];

		for (const command of cmds) {
			if (ignoredCommands.includes(command.name)) continue;

			const options = shuffleArr(await generateCommandInputs(maxUser, command.options!)).slice(0, 5);
			outer: for (const option of options) {
				for (const [parent, sub, subCommand] of ignoredSubCommands) {
					if (command.name === parent && option[sub] && (subCommand ? option[sub][subCommand] : true)) {
						continue outer;
					}
				}

				promises.push(async () => {
					try {
						await maxUser.runCommand(command, option);
						minionActivityCache.clear();
					} catch (err) {
						console.error(
							`Failed to run command ${command.name} with options ${JSON.stringify(option)}: ${err}`
						);
						throw err;
					}
				});
			}
		}

		await Promise.all(promises);

		await client.processActivities();
	},
	{
		timeout: Time.Minute * 10
	}
);
