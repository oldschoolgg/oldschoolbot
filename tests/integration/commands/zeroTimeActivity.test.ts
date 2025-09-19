import { Time } from 'e';
import { Bank, Items, convertLVLtoXP } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables';
import { attemptZeroTimeActivity, getZeroTimeActivitySettings } from '../../../src/lib/util/zeroTimeActivity';
import { zeroTimeActivityCommand } from '../../../src/mahoji/commands/zeroTimeActivity';
import { timePerAlch } from '../../../src/mahoji/lib/abstracted_commands/alchCommand';
import { createTestUser } from '../util';

describe('Zero Time Activity Command', () => {
	const automaticSelectionText = 'automatic selection from your favourite alchs each trip';
	test('persists alching configuration and uses it', async () => {
		const item = Items.getOrThrow('Yew longbow');
		const user = await createTestUser(new Bank().add('Nature rune', 200).add('Fire rune', 500).add(item.id, 200), {
			skills_magic: convertLVLtoXP(75)
		});

		const response = await user.runCommand(zeroTimeActivityCommand, {
			type: 'alch',
			item: 'yew longbow'
		});

		expect(response).toContain('Alching');
		await user.sync();
		expect(user.user.zero_time_activity_type).toBe('alch');
		expect(user.user.zero_time_activity_item).toBe(item.id);

		const summary = await user.runCommand(zeroTimeActivityCommand, {});
		expect(summary).toBe('Your zero time activity is set to **Alching** using **Yew longbow**.');

		const settings = getZeroTimeActivitySettings(user);
		expect(settings).toEqual({ type: 'alch', itemID: item.id });

		const duration = timePerAlch * 5;
		const activity = attemptZeroTimeActivity({
			type: 'alch',
			user,
			duration,
			variant: 'default'
		});

		expect(activity.result?.type).toBe('alch');
		expect(activity.result && activity.result.type === 'alch' ? activity.result.quantity : null).toBe(5);
	});

	test('allows automatic alch selection', async () => {
		const user = await createTestUser(new Bank().add('Nature rune', 200).add('Fire rune', 500), {
			skills_magic: convertLVLtoXP(75)
		});

		const response = await user.runCommand(zeroTimeActivityCommand, {
			type: 'alch'
		});

		expect(response).toBe(
			`Your zero time activity has been set to **Alching** using **${automaticSelectionText}**.`
		);
		await user.sync();
		expect(user.user.zero_time_activity_type).toBe('alch');
		expect(user.user.zero_time_activity_item).toBeNull();

		const summary = await user.runCommand(zeroTimeActivityCommand, {});
		expect(summary).toBe(`Your zero time activity is set to **Alching** using **${automaticSelectionText}**.`);
	});

	test('reuses configured fletching item on subsequent calls', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const user = await createTestUser(new Bank().add('Steel dart tip', 500).add('Feather', 500), {
			skills_fletching: convertLVLtoXP(75)
		});

		const firstResponse = await user.runCommand(zeroTimeActivityCommand, {
			type: 'fletch',
			item: fletchable.name
		});
		expect(firstResponse).toContain('Fletching');
		await user.sync();
		expect(user.user.zero_time_activity_type).toBe('fletch');
		expect(user.user.zero_time_activity_item).toBe(fletchable.id);

		const secondResponse = await user.runCommand(zeroTimeActivityCommand, {
			type: 'fletch'
		});
		expect(secondResponse).toContain(fletchable.name);
		await user.sync();
		expect(user.user.zero_time_activity_item).toBe(fletchable.id);

		const settings = getZeroTimeActivitySettings(user);
		expect(settings).toEqual({ type: 'fletch', itemID: fletchable.id });

		const duration = Time.Second * 40;
		const activity = attemptZeroTimeActivity({
			type: 'fletch',
			user,
			duration
		});

		expect(activity.result?.type).toBe('fletch');
		expect(activity.result && activity.result.type === 'fletch' ? activity.result.quantity : null).toBeGreaterThan(
			0
		);
	});
});
