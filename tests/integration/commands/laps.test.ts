import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, type Mock, test } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables/index.js';
import { lapsCommand } from '../../../src/mahoji/commands/laps.js';
import { zeroTimeActivityCommand } from '../../../src/mahoji/commands/zeroTimeActivity.js';
import { createTestUser, TEST_CHANNEL_ID } from '../util.js';

describe('laps command', () => {
	test('formats zero-time info messages on separate lines', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const alchItem = Items.getOrThrow('Yew longbow');

		const user = await createTestUser(new Bank(), {
			skills_agility: convertLVLtoXP(50),
			skills_magic: convertLVLtoXP(75),
			skills_fletching: convertLVLtoXP(75)
		});

		await user.update({ minion_hasBought: true });

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				primary_item: alchItem.name,
				fallback_type: 'fletch',
				fallback_item: fletchable.name
			}
		});

		const response = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});

		expect(response).toContain('Primary alch:');
		expect(response).toContain('Fallback fletch:');
		expect(response).toMatch(/Primary alch: [^\n]+\nFallback fletch:/);
	});

	test('fallback-only configuration avoids fallback messaging', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const user = await createTestUser(new Bank({ Feather: 1000, 'Steel dart tip': 1000 }), {
			skills_agility: convertLVLtoXP(50),
			skills_fletching: convertLVLtoXP(75)
		});

		await user.update({ minion_hasBought: true });

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				fallback_type: 'fletch',
				fallback_item: fletchable.name
			}
		});

		const channel = globalClient.channels.cache.get(TEST_CHANNEL_ID)!;
		const send = (channel as any).send as Mock;
		send.mockClear();

		const response = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});

		expect(response.toLowerCase()).not.toContain('fallback');

		await user.runActivity();

		const lastCall = send.mock.calls.at(-1);
		expect(lastCall).toBeDefined();
		const content: string = lastCall?.[0].content ?? '';
		expect(content.toLowerCase()).not.toContain('fallback preference');
		expect(content.toLowerCase()).not.toContain('fallback');
	});
});
