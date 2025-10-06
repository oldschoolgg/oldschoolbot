import { sleep } from '@oldschoolgg/toolkit';
import { describe, expect, test } from 'vitest';

describe('basic', async () => {
	test('Data points', async () => {
		expect(1).toBe(1);
	});
	test('Data points', async () => {
		expect(await prisma.user.count()).toBeTypeOf('number');
	});
	test('Data points', async () => {
		await sleep(100_000);
	});
});
