import { describe, expect, test } from 'vitest';

import { prisma } from '../../src/lib/settings/prisma';

describe('Integration Tests', () => {
	test('Sample Test', async () => {
		await prisma.user.create({ data: { id: '123' } });
		const result = await prisma.user.findMany();
		expect(result.length).toEqual(1);
		await prisma.user.deleteMany();
		const result2 = await prisma.user.findMany();
		expect(result2.length).toEqual(0);
	});
});
