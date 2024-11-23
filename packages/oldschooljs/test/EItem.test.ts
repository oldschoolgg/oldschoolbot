import { expect, test } from 'vitest';

import { EItem } from '../src/EItem.js';

test('EItem', async () => {
	expect(EItem.TWISTED_BOW).toEqual(20997);
	expect(EItem.COAL).toEqual(453);
	expect(EItem.ARAXYTE_SLAYER_HELMET_I).toEqual(29818);
	expect(EItem.ARAXYTE_SLAYER_HELMET).toEqual(29816);
	expect(EItem.ULTOR_RING).toEqual(25485);
	expect(EItem.VENATOR_RING).toEqual(25487);
});
