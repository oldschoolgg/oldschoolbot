import { join } from 'node:path';

import { ApplicationCommandOptionType } from 'discord.js';
import { randArrItem, randInt, shuffleArr, Time } from 'e';
import { Store } from 'mahoji/dist/lib/structures/Store';
import { CommandOption } from 'mahoji/dist/lib/types';
import { isValidCommand } from 'mahoji/dist/lib/util';
import { Bank, Items } from 'oldschooljs';
import { expect, test, vi } from 'vitest';

import { BitField, globalConfig, minionActivityCache } from '../../src/lib/constants';
import { mahojiClientSettingsFetch } from '../../src/lib/util/clientSettings';
import { handleMahojiConfirmation } from '../../src/lib/util/handleMahojiConfirmation';
import { randomMock } from './setup';
import { createTestUser, mockClient, TestUser } from './util';

vi.mock('../../src/lib/util/handleMahojiConfirmation.ts', () => ({
	handleMahojiConfirmation: vi.fn()
}));

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
					results.push(...subOptionsResults.map(input => ({ [option.name]: input })));
				}
				break;
			case ApplicationCommandOptionType.String:
				if ('autocomplete' in option && option.autocomplete) {
					const autoCompleteResults = await option.autocomplete('', { id: user.id } as any, {} as any);
					allPossibleOptions[option.name] = shuffleArr(autoCompleteResults.map(c => c.value)).slice(0, 3);
				} else if (option.choices) {
					allPossibleOptions[option.name] = option.choices.map(c => c.value).slice(0, 3);
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

	const sorted = Object.values(allPossibleOptions).sort((a, b) => b.length - a.length);
	const longestOptions = sorted[0]?.length;
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
		expect(vi.isMockFunction(handleMahojiConfirmation)).toBe(true);
		const client = await mockClient();
		process.env.CLIENT_ID = client.data.id;
		console.log({ aaaaaaaaa: client.data.id, bbbb: globalConfig.clientID });
		randomMock();
		const maxUser = await createTestUser(bank, { GP: 100_000_000_000 });
		await maxUser.max();
		await maxUser.update({ bitfield: [BitField.isModerator] });
		const store = new Store({ name: 'commands', dirs: [join('dist', 'mahoji')], checker: isValidCommand });
		await store.load();
		const currentClientSettings = await mahojiClientSettingsFetch({ construction_cost_bank: true });
		console.log({ currentClientSettings });

		for (const command of store.values) {
			if (['bank', 'bingo', 'bossrecords', 'stats', 'clues', 'kc'].includes(command.name)) continue;
			console.log({ bbbbb: globalConfig.clientID });
			const options = await generateCommandInputs(maxUser, command.options!);
			// writeFileSync(`${command.name}.txt`, JSON.stringify(options, null, 4));
			for (const option of options) {
				try {
					minionActivityCache.clear();
					console.log(`Running command ${command.name}
Options: ${JSON.stringify(option)}`);
					const res = await maxUser.runCommand(command, option);
					await client.processActivities();
					minionActivityCache.clear();
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
