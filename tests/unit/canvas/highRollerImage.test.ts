import { describe, expect, test } from 'vitest';

import { drawHighRollerImage } from '@/lib/canvas/highRollerImage.js';

describe('drawHighRollerImage', () => {
	test('returns attachment when rolls provided', async () => {
		const result = await drawHighRollerImage({
			rolls: [
				{
					position: 1,
					username: 'TestUser',
					itemID: 4151,
					itemName: 'Abyssal whip',
					value: 2_000_000
				}
			]
		});

		expect(result).not.toBeNull();
		if (!result) return;

		expect(result.name).toBe('high-roller-results.png');
		expect(result.buffer).toBeInstanceOf(Buffer);
		expect(result.buffer.length).toBeGreaterThan(0);
	});
});
