import { Items } from 'oldschooljs';
import { expect, test } from 'vitest';

test('Supply crate aliases', () => {
	expect(Items.getOrThrow('s1').name).toEqual('Supply crate (s1)');
	expect(Items.getOrThrow('s1 key').name).toEqual('Supply crate key (s1)');
	for (let i = 0; i < 7; i++) {
		expect(Items.getOrThrow(`s${i + 1}`)).toBeTruthy();
		expect(Items.getOrThrow(`s${i + 1} key`)).toBeTruthy();
	}
});
