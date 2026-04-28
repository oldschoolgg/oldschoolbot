import { dgCommand } from '@/lib/bso/commands/dg.js';

import { describe, expect, it } from 'vitest';

import { mockClient } from '../util.js';

describe('Dungeoneering Command', async () => {
	const client = await mockClient();

	it('shows Dungeoneering info with next floor missing stats', async () => {
		const user = await client.mockUser();

		const result = await user.runCommand(dgCommand, { info: {} });

		expect(result).toContain('Dungeoneering Tokens');
		expect(result).toContain('Max floor');
		expect(result).toContain('Missing stats for Floor');
	});

	it('shows floor info', async () => {
		const user = await client.mockUser();

		const result = await user.runCommand(dgCommand, { info: { floor_info: 7 } });

		expect(result).toContain('**Floor:** 7');
		expect(result).toContain('**Duration:**');
		expect(result).toContain('**Quantity:**');
		expect(result).toContain('**Required Stats:**');
		expect(result).toContain('**Missing Stats:**');
		expect(result).toContain('**120** Dungeoneering');
	});

	it('shows when no floor stats are missing', async () => {
		const user = await client.mockUser({ maxed: true });

		const result = await user.runCommand(dgCommand, { info: { floor_info: 7 } });

		expect(result).toContain('**Missing Stats:** No Stats Missing');
	});

	it('has floor info autocomplete options', async () => {
		const infoOption = dgCommand.options.find(option => option.name === 'info');
		const floorInfoOption = infoOption?.options?.find(option => option.name === 'floor_info');

		expect(floorInfoOption).toMatchObject({
			type: 'Integer',
			name: 'floor_info'
		});
		expect(floorInfoOption?.autocomplete).toBeTypeOf('function');
		expect(await floorInfoOption?.autocomplete?.({ value: undefined } as unknown as NumberAutoComplete)).toEqual([
			{ name: 'Floor 1', value: 1 },
			{ name: 'Floor 2', value: 2 },
			{ name: 'Floor 3', value: 3 },
			{ name: 'Floor 4', value: 4 },
			{ name: 'Floor 5', value: 5 },
			{ name: 'Floor 6', value: 6 },
			{ name: 'Floor 7', value: 7 }
		]);
	});
});
