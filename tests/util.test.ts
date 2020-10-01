import { stripEmojis } from '../src/lib/util';
import getOSItem from '../src/lib/util/getOSItem';

describe('util', () => {
	test('stripEmojis', () => {
		expect(stripEmojis('b👏r👏u👏h')).toEqual('bruh');
	});

	test('getOSItem', () => {
		expect(getOSItem('Twisted bow').id).toEqual(20997);
		expect(getOSItem(20997).id).toEqual(20997);
		expect(getOSItem('20997').id).toEqual(20997);
		expect(getOSItem('3rd age platebody').id).toEqual(10348);

		expect(() => getOSItem('Non-existant item')).toThrowError('That item doesnt exist.');
	});
});
