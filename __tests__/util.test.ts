import ava from 'ava';
import { itemID } from 'oldschooljs/dist/util';

import getUserFoodFromBank from '../src/lib/minions/functions/getUserFoodFromBank';
import { stripEmojis } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';

ava('stripEmojis', test => {
	test.is(stripEmojis('b👏r👏u👏h'), 'bruh');
});

ava('getOSItem', test => {
	test.is(getOSItem('Twisted bow').id, 20997);
	test.is(getOSItem(20997).id, 20997);
	test.is(getOSItem('20997').id, 20997);
	test.is(getOSItem('3rd age platebody').id, 10348);

	try {
		getOSItem('Non-existant item');
	} catch (err) {
		test.is(err, 'That item doesnt exist.');
	}
});

ava('getUserFoodFromBank', test => {
	test.deepEqual(getUserFoodFromBank({ [itemID('Shark')]: 1 }, 500), false);
	test.deepEqual(getUserFoodFromBank({ [itemID('Shark')]: 100 }, 500), { [itemID('Shark')]: 25 });
	test.deepEqual(getUserFoodFromBank({ [itemID('Shark')]: 30, [itemID('Tuna')]: 20 }, 750), {
		[itemID('Tuna')]: 20,
		[itemID('Shark')]: 28
	});
	// Shrimps is not an eatable so it is not used
	test.deepEqual(
		getUserFoodFromBank(
			{ [itemID('Shark')]: 100, [itemID('Lobster')]: 20, [itemID('Shrimps')]: 50 },
			1600
		),
		{ [itemID('Lobster')]: 20, [itemID('Shark')]: 68 }
	);
});
