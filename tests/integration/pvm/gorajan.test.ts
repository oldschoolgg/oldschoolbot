import { gorajanWarriorOutfit } from '@/lib/bso/collection-log/main.js';

import { formatDuration, reduceNumByPercent } from '@oldschoolgg/toolkit';
import { EMonster } from 'oldschooljs';
import { describe, expect, it } from 'vitest';

import { mockClient } from '../util.js';

describe('Gorajan', async () => {
	const client = await mockClient();

	it('should give gorajan boost', async () => {
		const user = await client.mockUser({
			QP: 300,
			maxed: true
		});
		const resultWithoutGorajan = await user.kill(EMonster.MAN, { quantity: 100 });
		expect(resultWithoutGorajan.commandResult).toContain('is now killing 100x');
		expect(resultWithoutGorajan.commandResult).not.toContain('Gorajan');

		await user.equip('melee', gorajanWarriorOutfit);
		const resultWithGorajan = await user.kill(EMonster.MAN, { quantity: 100 });
		expect(resultWithGorajan.commandResult).toContain('is now killing 100x');
		expect(resultWithGorajan.commandResult).toContain('10% for Gorajan warrior gear');

		expect(resultWithGorajan.activityResult?.q).toEqual(resultWithGorajan.activityResult?.q);
		expect(formatDuration(resultWithGorajan.activityResult!.duration)).toEqual(
			formatDuration(Math.floor(reduceNumByPercent(resultWithoutGorajan.activityResult!.duration, 10)))
		);
		expect(resultWithoutGorajan.activityResult?.duration).not.toEqual(resultWithGorajan.activityResult?.duration);
	});
});
