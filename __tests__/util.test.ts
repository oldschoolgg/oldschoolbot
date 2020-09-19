import ava from 'ava';

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
