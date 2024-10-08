import { generateCommandInputs } from '@oldschoolgg/toolkit/util';
import { Time, shuffleArr } from 'e';
import { generateRandomBank } from 'oldschooljs/dist/meta/types';
import { expect, test, vi } from 'vitest';

import { BitField, minionActivityCache } from '../../src/lib/constants';

import { mahojiClientSettingsFetch } from '../../src/lib/util/clientSettings';
import { handleMahojiConfirmation } from '../../src/lib/util/handleMahojiConfirmation';
import { allCommands } from '../../src/mahoji/commands/allCommands';
import { randomMock } from './setup';
import { createTestUser, mockClient } from './util';

test(
	'All Commands Base Test',
	async () => {
		const bank = generateRandomBank(500, 100_000);
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

			const options = shuffleArr(await generateCommandInputs(command.options!)).slice(0, 5);
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
