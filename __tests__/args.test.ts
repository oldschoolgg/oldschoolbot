import ava from 'ava';

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

ava('itemArg', async test => {
	const itemArg = mockArgument(ItemArgument);
	const expectedResults = [
		['3rd age platebody', [{ id: 10348, name: '3rd age platebody' }]],
		[20011, [{ id: 20011, name: '3rd age axe' }]],
		['Dragon dagger(p++)', [{ id: 5698, name: 'Dragon dagger(p++)' }]]
	];

	for (const [input, output] of expectedResults) {
		test.deepEqual(await itemArg.run(input), output);
	}
});
