import ItemArgument from '../src/arguments/item';
import { mockArgument } from './utils';

describe('itemArg', () => {
	test('stripEmojis', async () => {
		const itemArg = mockArgument(ItemArgument);
		const expectedResults: [string | number, { id: number; name: string }[]][] = [
			['3rd age platebody', [{ id: 10348, name: '3rd age platebody' }]],
			[20011, [{ id: 20011, name: '3rd age axe' }]],
			['Dragon dagger(p++)', [{ id: 5698, name: 'Dragon dagger(p++)' }]]
		];

		for (const [input, output] of expectedResults) {
			const result = await itemArg.run(input);
			expect(result[0]).toMatchObject(output[0]);
		}
	});
});
