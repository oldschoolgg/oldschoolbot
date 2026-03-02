import { describe, expect, it } from 'vitest';

import {
	type CommandNode,
	formatChoiceDisplay,
	getNodeSearchText,
	normalizeExample,
	toAnchorId
} from '../../docs/src/components/commandsExplorerUtils.js';

describe('commandsExplorerUtils', () => {
	it('normalizes command paths into stable anchor ids', () => {
		expect(toAnchorId('activities plank_make')).toBe('activities-plank-make');
		expect(toAnchorId('  /K Name:Zulrah  ')).toBe('k-name-zulrah');
	});

	it('normalizes examples to slash command format', () => {
		expect(normalizeExample('/k name:zulrah')).toBe('/k name:zulrah');
		expect(normalizeExample('k name:zulrah')).toBe('/k name:zulrah');
	});

	it('displays choice label when present', () => {
		expect(formatChoiceDisplay({ name: 'Demon Butler', value: 'butler' })).toBe('Demon Butler');
		expect(formatChoiceDisplay({ name: 'Sawmill', value: 'sawmill' })).toBe('Sawmill');
	});

	it('falls back to choice value when label is empty', () => {
		expect(formatChoiceDisplay({ name: '', value: 'butler' })).toBe('butler');
	});

	it('includes options and choice text in searchable content', () => {
		const node: CommandNode = {
			name: 'activities',
			path: 'activities plank_make',
			description: 'Turn logs into planks.',
			options: [
				{
					name: 'action',
					description: 'The method you wish to make planks.',
					type: 'string',
					required: true,
					choices: [
						{ name: 'Demon Butler', value: 'butler' },
						{ name: 'Sawmill', value: 'sawmill' }
					]
				}
			],
			subcommands: []
		};

		const searchText = getNodeSearchText(node);
		expect(searchText).toContain('/activities plank_make');
		expect(searchText).toContain('the method you wish to make planks');
		expect(searchText).toContain('demon butler butler');
		expect(searchText).toContain('sawmill sawmill');
	});
});
