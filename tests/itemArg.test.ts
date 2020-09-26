import ItemArgument from '../src/arguments/item';

function mockArgument(arg: any) {
	return new arg(
		{
			name: 'arguments',
			client: {
				options: {
					pieceDefaults: {
						arguments: {}
					}
				}
			}
		},
		['1'],
		'',
		{}
	);
}

describe('itemArg', () => {
	test('stripEmojis', () => {
		const itemArg = mockArgument(ItemArgument);
		const expectedResults = [
			['3rd age platebody', [{ id: 10348, name: '3rd age platebody' }]],
			[20011, [{ id: 20011, name: '3rd age axe' }]],
			['Dragon dagger(p++)', [{ id: 5698, name: 'Dragon dagger(p++)' }]]
		];

		for (const [input, output] of expectedResults) {
			expect(itemArg.run(input)).resolves.toEqual(output);
		}
	});
});
