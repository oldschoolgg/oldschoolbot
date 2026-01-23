import { describe, expect, test } from 'vitest';

import { getBrimKeyChanceFromCBLevel } from '@/util/util.js';

describe('Utils', () => {
	test('Brimestone chance calc', async () => {
		expect.assertions(6);

		expect(getBrimKeyChanceFromCBLevel(725)).toEqual(50);
		expect(getBrimKeyChanceFromCBLevel(321)).toEqual(56);
		expect(getBrimKeyChanceFromCBLevel(303)).toEqual(59);
		expect(getBrimKeyChanceFromCBLevel(123)).toEqual(95);
		expect(getBrimKeyChanceFromCBLevel(28)).toEqual(1137);
		expect(getBrimKeyChanceFromCBLevel(2)).toEqual(2021);
	});
});
