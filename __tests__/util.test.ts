import ava from 'ava';
import { stripEmojis } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';

ava('stripEmojis', test => {
	test.deepEqual(stripEmojis('b👏r👏u👏h'), 'bruh');
});

ava('getOSItem', test => {
	test.deepEqual(getOSItem('Twisted bow').id, 20997);
	test.deepEqual(getOSItem(20997).id, 20997);
	test.deepEqual(getOSItem('20997').id, 20997);
});
