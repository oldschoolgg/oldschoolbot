import ItemArgument from '../src/arguments/item';
import getOSItem from '../src/lib/util/getOSItem';
import { mockArgument, testSetup } from './utils';

describe('Item Alias', () => {
	beforeAll(testSetup);
	test('itemArg parameter', () => {
		const itemArg = mockArgument(ItemArgument);
		const expectedResults = [
			[
				'Graceful cape',
				[
					getOSItem(11852), // Graceful cape (Regular)
					getOSItem(11853), // Duplicate Graceful cape (Regular)
					getOSItem(13582), // Duplicate Graceful cape (Arceuus)
					getOSItem(13594), // Duplicate Graceful cape (Piscarilius)
					getOSItem(13606), // Duplicate Graceful cape (Lovakengj)
					getOSItem(13618), // Duplicate Graceful cape (Shayzien)
					getOSItem(13630), // Duplicate Graceful cape (Hosidius)
					getOSItem(13670), // Duplicate Graceful cape (Kourend)
					getOSItem(21066), // Duplicate Graceful cape (Agility Arena)
					getOSItem(24748), // Duplicate Graceful cape (Hallowed Sepulchre)
					getOSItem(25074) // Duplicate Graceful cape (Trailblazer)
				]
			],
			['Black graceful cape', [getOSItem(24746)]],
			['Dark graceful cape', [getOSItem(24746)]],
			[24746, [getOSItem(24746)]]
		];
		for (const [input, output] of expectedResults) {
			expect(itemArg.run(input)).resolves.toEqual(output);
		}
	});
});
