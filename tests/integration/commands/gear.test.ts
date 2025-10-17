import { describe, expect, it } from 'vitest';

import { gearCommand } from '@/mahoji/commands/gear.js';
import { createTestUser } from '../util.js';

describe.skip('Gear Command', async () => {
	it('BiS Gear Subcommand', async () => {
		const user = await createTestUser();
		const res: any = await user.runCommand(gearCommand, {
			best_in_slot: {
				stat: 'attack_stab'
			}
		});
		expect(res.content).toContain('These are the best in slot items for ');
		expect(res.files[0]).toBeInstanceOf(Buffer);
	});
});
