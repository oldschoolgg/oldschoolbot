import ava from 'ava';
import { stripEmojis } from '../src/lib/util';

ava('foo', test => {
	test.deepEqual(stripEmojis('b👏r👏u👏h'), 'bruh');
});
