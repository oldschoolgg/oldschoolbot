import ItemArgument from '../src/arguments/item';
import getOSItem from '../src/lib/util/getOSItem';
import { mockArgument } from './utils';

describe('Item Alias', () => {
	test('itemArg parameter', () => {
		const itemArg = mockArgument(ItemArgument);
		const expectedResults = [
			[
				'Graceful cape',
				[
					getOSItem(11_852) // Graceful cape (Regular)
				]
			],
			['Black graceful cape', [getOSItem(24_746)]],
			['Dark graceful cape', [getOSItem(24_746)]],
			[24_746, [getOSItem(24_746)]],
			['Mythical cape', [getOSItem(22_114)]]
		];
		for (const [input, output] of expectedResults) {
			expect(itemArg.run(input)).resolves.toEqual(output);
		}
	});
});
