import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables';
import {
	attemptZeroTimeActivity,
	getZeroTimeActivityPreferences,
	type ZeroTimeActivityPreference
} from '../../../src/lib/util/zeroTimeActivity';
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
			set: {
				primary_type: 'alch',
				primary_item: 'yew longbow'
			}
		});

		expect(response).toContain('Primary: **Alching**');
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBe(item.id);
		expect(user.user.zero_time_activity_fallback_type).toBeNull();

		const summary = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(summary).toContain('Primary: **Alching** using **Yew longbow**');

		const [preference] = getZeroTimeActivityPreferences(user);
		expect(preference).toEqual<ZeroTimeActivityPreference>({ role: 'primary', type: 'alch', itemID: item.id });

		const duration = timePerAlch * 5;
		const activity = attemptZeroTimeActivity({
			user,
			duration,
			preference,
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
			set: {
				primary_type: 'alch'
			}
		});

		expect(response).toContain(automaticSelectionText);
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBeNull();
		expect(user.user.zero_time_activity_fallback_type).toBeNull();

		const summary = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(summary).toContain(`Primary: **Alching** using **${automaticSelectionText}**`);
	});

	test('reuses configured fletching item on subsequent calls', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const user = await createTestUser(new Bank().add('Steel dart tip', 500).add('Feather', 500), {
			skills_fletching: convertLVLtoXP(75)
		});

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'fletch',
				primary_item: fletchable.name
			}
		});
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('fletch');
		expect(user.user.zero_time_activity_primary_item).toBe(fletchable.id);

		const newItem = 'Mithril dart';
		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'fletch',
				primary_item: newItem
			}
		});
		await user.sync();
		const mithril = zeroTimeFletchables.find(item => item.name === newItem);
		expect(mithril).toBeDefined();
		if (!mithril) return;
		expect(user.user.zero_time_activity_primary_item).toBe(mithril.id);
	});

	test('supports fallback configuration', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const user = await createTestUser(new Bank().add('Steel dart tip', 500).add('Feather', 500), {
			skills_fletching: convertLVLtoXP(75),
			skills_magic: convertLVLtoXP(75)
		});

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				fallback_type: 'fletch',
				fallback_item: fletchable.name
			}
		});
		await user.sync();

		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBeNull();
		expect(user.user.zero_time_activity_fallback_type).toBe('fletch');
		expect(user.user.zero_time_activity_fallback_item).toBe(fletchable.id);

		const preferences = getZeroTimeActivityPreferences(user);
		expect(preferences).toEqual<ZeroTimeActivityPreference[]>([
			{ role: 'primary', type: 'alch', itemID: null },
			{ role: 'fallback', type: 'fletch', itemID: fletchable.id }
		]);

		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(overview).toContain('Fallback: **Fletching**');
	});
});
