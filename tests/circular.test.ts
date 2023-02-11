import { Time } from 'e';
import madge from 'madge';
import { describe, expect, test } from 'vitest';

describe('Circular Dependencies', () => {
	test(
		'Circular Dependencies',
		async () => {
			const res = Object.values(await madge('./dist/index.js').then(res => res.circularGraph())).flat(2);
			expect(res).toEqual([]);
		},
		{ timeout: Time.Minute }
	);
});
