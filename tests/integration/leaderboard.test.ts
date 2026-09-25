import { describe, expect, test } from 'vitest';

import { leaderboardCommand } from '../../src/mahoji/commands/leaderboard.js';
import { kcGains } from '../../src/mahoji/commands/tools.js';

function getLeaderboardSubcommand(name: string) {
	return leaderboardCommand.options.find(option => option.type === 'Subcommand' && option.name === name);
}

describe('Leaderboard', async () => {
	test('kcGains Leaderboard', async () => {
		for (const bool of [true, false]) {
			await kcGains('week', 'zulrah', bool);
		}
	});

	test('account type filter option is used on filterable leaderboards', () => {
		const filterableSubcommands = [
			'kc',
			'farming_contracts',
			'sacrifice',
			'gp',
			'skills',
			'opens',
			'cl',
			'clues',
			'giants_foundry'
		];

		for (const subcommandName of filterableSubcommands) {
			const subcommand = getLeaderboardSubcommand(subcommandName);
			expect(subcommand, subcommandName).toBeDefined();
			const options = (subcommand?.options ?? []) as readonly CommandOption[];
			const optionNames = options.map(option => option.name);
			expect(optionNames, subcommandName).toContain('account_type');
			expect(optionNames, subcommandName).not.toContain('ironmen_only');

			const accountTypeOption = options.find(option => option.name === 'account_type');
			expect(accountTypeOption, subcommandName).toMatchObject({
				type: 'String',
				required: false,
				choices: [
					{ name: 'Mixed', value: 'Mixed' },
					{ name: 'Irons Only', value: 'Irons Only' },
					{ name: 'Mains Only', value: 'Mains Only' }
				]
			});
		}
	});
});
