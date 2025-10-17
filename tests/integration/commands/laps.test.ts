import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test, vi } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables/index.js';
import * as handleTripFinishModule from '../../../src/lib/util/handleTripFinish.js';
import { lapsCommand } from '../../../src/mahoji/commands/laps.js';
import { zeroTimeActivityCommand } from '../../../src/mahoji/commands/zeroTimeActivity.js';
import { createTestUser } from '../util.js';

function extractResponseText(response: unknown): string {
	if (typeof response === 'string') {
		return response;
	}
	if (response && typeof response === 'object' && 'content' in (response as { content?: unknown })) {
		const content = (response as { content?: unknown }).content;
		return typeof content === 'string' ? content : '';
	}
	return '';
}

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

		const handleTripFinishSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish');

		const response = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});

		const responseText = extractResponseText(response);
		expect(responseText.toLowerCase()).not.toContain('fallback');

		let lastCall: Parameters<(typeof handleTripFinishModule)['handleTripFinish']> | undefined;
		try {
			await user.runActivity();
			lastCall = handleTripFinishSpy.mock.calls.at(-1);
		} finally {
			handleTripFinishSpy.mockRestore();
		}

		expect(lastCall).toBeDefined();
		const messageArg = lastCall?.[2];
		const content = extractResponseText(messageArg);
		expect(content.toLowerCase()).not.toContain('fallback preference');
		expect(content.toLowerCase()).not.toContain('fallback');
	});

	test('labels fallback-only failures as primary', async () => {
		const user = await createTestUser(new Bank(), {
			skills_agility: convertLVLtoXP(50),
			skills_magic: convertLVLtoXP(1)
		});

		await user.update({ minion_hasBought: true });

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				fallback_type: 'alch'
			}
		});

		const response = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});

		const responseText = extractResponseText(response);
		expect(responseText).toContain('Primary alch: You need level 55 Magic to perform zero-time alching.');
		expect(responseText).not.toContain('Fallback alch');
	});
});
