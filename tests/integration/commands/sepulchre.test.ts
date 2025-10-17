import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test, vi } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables/index.js';
import * as handleTripFinishModule from '../../../src/lib/util/handleTripFinish.js';
import { zeroTimeActivityCommand } from '../../../src/mahoji/commands/zeroTimeActivity.js';
import { sepulchreCommand } from '../../../src/mahoji/lib/abstracted_commands/sepulchreCommand.js';
import { createTestUser, TEST_CHANNEL_ID } from '../util.js';

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

describe('sepulchre command', () => {
	test('fallback-only configuration avoids fallback messaging', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const gracefulItems = [
			'Graceful hood',
			'Graceful top',
			'Graceful legs',
			'Graceful boots',
			'Graceful gloves',
			'Graceful cape'
		].map(name => Items.getOrThrow(name).id);

		const user = await createTestUser(
			new Bank({
				Feather: 50_000,
				'Steel dart tip': 50_000,
				'Graceful hood': 1,
				'Graceful top': 1,
				'Graceful legs': 1,
				'Graceful boots': 1,
				'Graceful gloves': 1,
				'Graceful cape': 1
			}),
			{
				skills_agility: convertLVLtoXP(92),
				skills_thieving: convertLVLtoXP(70),
				skills_fletching: convertLVLtoXP(75)
			}
		);

		await user.update({ minion_hasBought: true });
		await user.equip('skilling', gracefulItems);

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				fallback_type: 'fletch',
				fallback_item: fletchable.name
			}
		});

		const handleTripFinishSpy = vi.spyOn(handleTripFinishModule, 'handleTripFinish');

		const response = await sepulchreCommand(user, TEST_CHANNEL_ID);

		expect(extractResponseText(response).toLowerCase()).not.toContain('fallback');

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

	test('labels sepulchre fallback-only failures as primary', async () => {
		const gracefulItems = [
			'Graceful hood',
			'Graceful top',
			'Graceful legs',
			'Graceful boots',
			'Graceful gloves',
			'Graceful cape'
		].map(name => Items.getOrThrow(name).id);

		const user = await createTestUser(
			new Bank({
				Feather: 10_000,
				'Steel dart tip': 10_000,
				'Graceful hood': 1,
				'Graceful top': 1,
				'Graceful legs': 1,
				'Graceful boots': 1,
				'Graceful gloves': 1,
				'Graceful cape': 1
			}),
			{
				skills_agility: convertLVLtoXP(92),
				skills_thieving: convertLVLtoXP(70),
				skills_fletching: convertLVLtoXP(75),
				skills_magic: convertLVLtoXP(1)
			}
		);

		await user.update({ minion_hasBought: true });
		await user.equip('skilling', gracefulItems);

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				fallback_type: 'alch'
			}
		});

		const response = await sepulchreCommand(user, TEST_CHANNEL_ID);

		const responseText = extractResponseText(response);
		expect(responseText).toContain('Primary alch: You need level 55 Magic to perform zero-time alching.');
		expect(responseText).not.toContain('Fallback alch');
	});
});
