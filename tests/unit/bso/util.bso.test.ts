import { clAdjustedDroprate } from '@/lib/bso/bsoUtil.js';

import { Bank } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

describe('BSO util', () => {
	test('clAdjustedDroprate', () => {
		expect(clAdjustedDroprate({ cl: new Bank().add('Coal', 0) } as any as MUser, 'Coal', 100, 2)).toEqual(100);
		expect(clAdjustedDroprate({ cl: new Bank().add('Coal', 1) } as any as MUser, 'Coal', 100, 2)).toEqual(200);
		expect(clAdjustedDroprate({ cl: new Bank().add('Coal', 2) } as any as MUser, 'Coal', 100, 2)).toEqual(400);
	});
});
