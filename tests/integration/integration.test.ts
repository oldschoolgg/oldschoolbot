import { describe, expect, test } from 'vitest';

import { prisma } from '../../src/lib/settings/prisma';

describe('Integration Tests', () => {
	test('Sample Test', async () => {
		await prisma.user.create({ data: { id: '123' } });
		const user = await mUserFetch('123');
		expect(user).toBeDefined();
		expect(user.totalLevel).toEqual(32);
		const result = await prisma.user.findMany();
		expect(result.length).toEqual(1);
		await prisma.user.deleteMany();
		const result2 = await prisma.user.findMany();
		expect(result2.length).toEqual(0);
	});
});
