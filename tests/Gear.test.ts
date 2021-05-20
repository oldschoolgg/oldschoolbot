import { Gear } from '../src/lib/structures/Gear';
import itemID from '../src/lib/util/itemID';

// error if weapon 2h?
const testGear = new Gear({
	'2h': 'Twisted bow',
	head: 'Dragon full helm',
	body: '3rd age platebody',
	legs: '3rd age platelegs'
});

describe('Gear', () => {
	test('misc', () => {
		expect(testGear['2h']).toEqual({ item: itemID('Twisted bow'), quantity: 1 });
		expect(testGear.head).toEqual({ item: itemID('Dragon full helm'), quantity: 1 });
		expect(testGear.feet).toEqual(null);
	});
	test('allItems', () => {
		const gear = new Gear({ head: 'Dragon full helm' });
		const allItems = gear.allItems();
		expect(allItems.length).toEqual(1);
		expect(allItems[0]).toEqual(itemID('Dragon full helm'));

		const allItems2 = gear.allItems(true);
		expect(allItems2.length).toEqual(2);
	});
});
