import itemID from '../src/lib/util/itemID';
import itemIsTradeable from '../src/lib/util/itemIsTradeable';

describe('Sanity', () => {
	test('santa hats should be tradeable', () => {
		expect(itemIsTradeable(itemID('Black santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Inverted santa hat'))).toEqual(true);
		expect(itemIsTradeable(itemID('Santa hat'))).toEqual(true);
	});
	test('misc', () => {
		expect(itemID('Phoenix')).toEqual(20_693);
		expect(itemID('Kalphite princess')).toEqual(12_647);
		expect(itemID('Green phoenix')).toEqual(24_483);
	});
});
