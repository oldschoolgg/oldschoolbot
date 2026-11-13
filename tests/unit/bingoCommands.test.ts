import { ApplicationCommandOptionType } from '@oldschoolgg/discord';
import { describe, expect, it } from 'vitest';

import { convertCommandOptionToAPIOption } from '@/discord/commands/commandOptionConversions.js';
import { bingoCommand } from '@/mahoji/commands/bingo.js';

describe('Bingo Discord command registration', () => {
	it('includes optional seasonal settings in the published creation command', () => {
		const create = bingoCommand.options.find(option => option.name === 'create_bingo')!;
		const api = convertCommandOptionToAPIOption(create);
		if (api.type !== ApplicationCommandOptionType.Subcommand) throw new Error('Expected a subcommand.');
		expect(api.options).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					name: 'team_size',
					type: ApplicationCommandOptionType.Integer,
					required: true
				}),
				expect.objectContaining({
					name: 'theme',
					type: ApplicationCommandOptionType.String,
					required: false,
					choices: ['winter', 'spring', 'summer', 'autumn'].map(value => ({ name: value, value }))
				}),
				expect.objectContaining({
					name: 'configuration',
					type: ApplicationCommandOptionType.Attachment,
					required: false
				})
			])
		);
	});
	it('publishes view with an optional bingo selector', () => {
		const view = bingoCommand.options.find(option => option.name === 'view')!;
		const api = convertCommandOptionToAPIOption(view);
		if (api.type !== ApplicationCommandOptionType.Subcommand) throw new Error('Expected a subcommand.');
		expect(api.options).toEqual([expect.objectContaining({ name: 'bingo', required: false, autocomplete: true })]);
	});
});
