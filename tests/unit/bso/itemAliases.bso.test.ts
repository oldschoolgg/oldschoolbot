import { expect, test } from 'vitest';

import { getOSItem } from '../../../src/lib/util/getOSItem.js';

test('Supply crate aliases', () => {
	expect(getOSItem('s1').name).toEqual('Supply crate (s1)');
	expect(getOSItem('s1 key').name).toEqual('Supply crate key (s1)');
	for (let i = 0; i < 7; i++) {
		expect(getOSItem(`s${i + 1}`)).toBeTruthy();
		expect(getOSItem(`s${i + 1} key`)).toBeTruthy();
	}
});
