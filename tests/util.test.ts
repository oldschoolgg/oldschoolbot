import getUserFoodFromBank from '../src/lib/minions/functions/getUserFoodFromBank';
import { stripEmojis } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';
import itemID from '../src/lib/util/itemID';

describe('util', () => {
	test('stripEmojis', () => {
		expect(stripEmojis('b👏r👏u👏h')).toEqual('bruh');
	});

	test('getOSItem', () => {
		expect(getOSItem('Twisted bow').id).toEqual(20997);
		expect(getOSItem(20997).id).toEqual(20997);
		expect(getOSItem('20997').id).toEqual(20997);
		expect(getOSItem('3rd age platebody').id).toEqual(10348);

		expect(() => getOSItem('Non-existant item')).toThrowError("That item doesn't exist.");
	});

	test('getUserFoodFromBank', () => {
		expect(getUserFoodFromBank({ [itemID('Shark')]: 1 }, 500)).toStrictEqual(false);
		expect(getUserFoodFromBank({ [itemID('Shark')]: 100 }, 500)).toStrictEqual({
			[itemID('Shark')]: 25
		});
		expect(
			getUserFoodFromBank({ [itemID('Shark')]: 30, [itemID('Tuna')]: 20 }, 750)
		).toStrictEqual({
			[itemID('Tuna')]: 20,
			[itemID('Shark')]: 28
		});
		expect(
			getUserFoodFromBank({ 
				[itemID('Shark')]: 100, 
				[itemID('Lobster')]: 20, 
				[itemID('Shrimps')]: 50, 
				[itemID('Coal')]: 1 },
				1600
			)
		).toStrictEqual({ [itemID('Lobster')]: 20, [itemID('Shark')]: 68, [itemID('Shrimps')]: 50 });
	});
});
