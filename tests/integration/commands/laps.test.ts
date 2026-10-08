import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables/index.js';
import { lapsCommand } from '../../../src/mahoji/commands/laps.js';
import { zeroTimeActivityCommand } from '../../../src/mahoji/commands/zeroTimeActivity.js';
import { handleTripFinishResults } from '../../test-utils/misc.js';
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
	test('pause skips zero-time activities on new trips and resume restores them', async () => {
		const user = await createTestUser(new Bank().add('Steel dart tip', 1000).add('Feather', 1000), {
			skills_agility: convertLVLtoXP(50),
			skills_fletching: convertLVLtoXP(75),
			minion_hasBought: true,
			zero_time_activity_primary_type: 'fletch',
			zero_time_activity_primary_item: Items.getOrThrow('Steel dart').id
		});
		await user.runCommand(zeroTimeActivityCommand, { pause: {} });
		const pausedResponse = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});
		expect(extractResponseText(pausedResponse)).not.toContain('fletching');
		await user.sync();
		expect(user.bank.amount('Feather')).toBe(1000);
		expect(user.bank.amount('Steel dart tip')).toBe(1000);
		const pausedTrip = await user.runActivity();
		expect(pausedTrip).toBeTruthy();
		expect(pausedTrip).not.toHaveProperty('fletch');

		await user.runCommand(zeroTimeActivityCommand, { resume: {} });
		const resumedResponse = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});
		expect(extractResponseText(resumedResponse)).toContain('fletching');
		await user.sync();
		expect(user.bank.amount('Feather')).toBeLessThan(1000);
		await user.runCommand(zeroTimeActivityCommand, { pause: {} });
		const resumedTrip = await user.runActivity();
		expect(resumedTrip).toHaveProperty('fletch');
		await user.sync();
		expect(user.bank.amount('Steel dart')).toBeGreaterThan(0);
	});

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

		const response = await user.runCommand(lapsCommand, {
			name: 'Gnome Stronghold Agility Course',
			quantity: 1
		});

		const responseText = extractResponseText(response);
		expect(responseText.toLowerCase()).not.toContain('fallback');

		const activityResult = await user.runActivity();
		const finishResult = activityResult
			? handleTripFinishResults.get(`${user.id}-${activityResult.type}`)
			: undefined;

		expect(finishResult).toBeDefined();
		const content = extractResponseText(finishResult?.message);
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
