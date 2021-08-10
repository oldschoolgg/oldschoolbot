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
					getOSItem(11_852), // Graceful cape (Regular)
					getOSItem(11_853), // Duplicate Graceful cape (Regular)
					getOSItem(13_582), // Duplicate Graceful cape (Arceuus)
					getOSItem(13_594), // Duplicate Graceful cape (Piscarilius)
					getOSItem(13_606), // Duplicate Graceful cape (Lovakengj)
					getOSItem(13_618), // Duplicate Graceful cape (Shayzien)
					getOSItem(13_630), // Duplicate Graceful cape (Hosidius)
					getOSItem(13_670), // Duplicate Graceful cape (Kourend)
					getOSItem(21_066), // Duplicate Graceful cape (Agility Arena)
					getOSItem(24_748), // Duplicate Graceful cape (Hallowed Sepulchre)
					getOSItem(25_074) // Duplicate Graceful cape (Trailblazer)
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
