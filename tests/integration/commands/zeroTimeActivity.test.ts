import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { describe, expect, test } from 'vitest';

import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables/index.js';
import {
	attemptZeroTimeActivity,
	getZeroTimeActivityPreferences,
	type ZeroTimeActivityPreference
} from '../../../src/lib/util/zeroTimeActivity.js';
import {
	favouriteAlchsAutocompleteValue,
	zeroTimeActivityCommand
} from '../../../src/mahoji/commands/zeroTimeActivity.js';
import { timePerAlch } from '../../../src/mahoji/lib/abstracted_commands/alchCommand.js';
import { createTestUser } from '../util.js';

function getSetAutocompleteOption(name: 'primary_item' | 'fallback_item') {
	const setSubcommand = zeroTimeActivityCommand.options.find(
		option => option.type === 'Subcommand' && option.name === 'set'
	) as
		| ({
				options?: { name: string; autocomplete?: (value: string, ...args: any[]) => any }[];
		  } & (typeof zeroTimeActivityCommand.options)[number])
		| undefined;

	expect(setSubcommand).toBeDefined();
	const option = setSubcommand?.options?.find(opt => opt.name === name) as
		| { name: string; autocomplete?: (value: string, user: any, member: any, context?: any) => any }
		| undefined;
	expect(option).toBeDefined();
	expect(typeof option?.autocomplete).toBe('function');
	return option!;
}

describe('Zero Time Activity Command', () => {
	const automaticSelectionText = 'Primary: Alch (automatic favourites)';

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

		expect(response).toContain('Primary: Alch Yew longbow');
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBe(item.id);
		expect(user.user.zero_time_activity_fallback_type).toBeNull();

		const summary = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(summary).toContain('Primary: Alch Yew longbow');

		const [preference] = getZeroTimeActivityPreferences(user);
		expect(preference).toEqual<ZeroTimeActivityPreference>({ role: 'primary', type: 'alch', itemID: item.id });

		const duration = timePerAlch * 5;
		const activity = attemptZeroTimeActivity({
			user,
			duration,
			preferences: [preference],
			alch: { variant: 'default' }
		});

		expect(activity.failures).toHaveLength(0);
		expect(activity.result?.type).toBe('alch');
		expect(activity.result && activity.result.type === 'alch' ? activity.result.quantity : null).toBe(5);
	});

	test('accepts numeric autocomplete values for alching', async () => {
		const item = Items.getOrThrow('Yew longbow');
		const user = await createTestUser(new Bank().add('Nature rune', 200).add('Fire rune', 500).add(item.id, 200), {
			skills_magic: convertLVLtoXP(75)
		});

		const response = await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				primary_item: item.id.toString()
			}
		});

		expect(response).toContain('Primary: Alch Yew longbow');
		await user.sync();
		expect(user.user.zero_time_activity_primary_item).toBe(item.id);
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
		expect(summary).toContain(automaticSelectionText);
	});

	test('allows selecting favourite alchs from autocomplete', async () => {
		const user = await createTestUser(new Bank().add('Nature rune', 200).add('Fire rune', 500), {
			skills_magic: convertLVLtoXP(75)
		});

		const response = await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				primary_item: favouriteAlchsAutocompleteValue
			}
		});

		expect(response).toContain(automaticSelectionText);
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBeNull();
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
		expect(overview).toContain('Fallback: Fletch Steel dart');
	});

	test('allows editing fallback item without re-supplying the type', async () => {
		const initialItem = Items.getOrThrow('Yew longbow');
		const newItem = Items.getOrThrow('Magic longbow');
		const user = await createTestUser(
			new Bank().add('Nature rune', 500).add('Fire rune', 1500).add(initialItem.id, 200).add(newItem.id, 200),
			{
				skills_magic: convertLVLtoXP(75)
			}
		);

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				fallback_type: 'alch',
				fallback_item: initialItem.name
			}
		});
		await user.sync();

		const response = await user.runCommand(zeroTimeActivityCommand, {
			set: {
				fallback_item: newItem.name
			}
		});

		expect(response).toContain(`Fallback: Alch ${newItem.name}`);
		await user.sync();
		expect(user.user.zero_time_activity_fallback_type).toBe('alch');
		expect(user.user.zero_time_activity_fallback_item).toBe(newItem.id);
	});

	test('allows editing fallback without resubmitting the primary type', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;
		const user = await createTestUser(new Bank().add('Nature rune', 200).add('Fire rune', 500), {
			skills_magic: convertLVLtoXP(75),
			skills_fletching: convertLVLtoXP(75)
		});

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch'
			}
		});
		await user.sync();

		const response = await user.runCommand(zeroTimeActivityCommand, {
			set: {
				fallback_type: 'fletch',
				fallback_item: fletchable.name
			}
		});

		expect(response).toContain('Fallback: Fletch Steel dart');
		await user.sync();

		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_fallback_type).toBe('fletch');
		expect(user.user.zero_time_activity_fallback_item).toBe(fletchable.id);
	});

	test('autocomplete reuses stored types when none are provided', async () => {
		const alchItem = Items.getOrThrow('Yew longbow');
		const user = await createTestUser(
			new Bank().add('Nature rune', 200).add('Fire rune', 500).add(alchItem.id, 200),
			{
				skills_magic: convertLVLtoXP(75)
			}
		);

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				primary_item: alchItem.name,
				fallback_type: 'alch'
			}
		});
		await user.sync();

		const primaryAutocompleteOption = getSetAutocompleteOption('primary_item');
		const fallbackAutocompleteOption = getSetAutocompleteOption('fallback_item');

		const primaryResults = await primaryAutocompleteOption.autocomplete?.('', user, undefined, {
			focusedOption: { name: 'primary_item' },
			options: [{ name: 'primary_item' }]
		} as any);
		const fallbackResults = await fallbackAutocompleteOption.autocomplete?.('', user, undefined, {
			focusedOption: { name: 'fallback_item' },
			options: [{ name: 'fallback_item' }]
		} as any);

		expect(primaryResults?.[0]).toEqual(
			expect.objectContaining({
				name: 'Favourite Alchs',
				value: favouriteAlchsAutocompleteValue
			})
		);
		expect(fallbackResults?.[0]).toEqual(
			expect.objectContaining({
				name: 'Favourite Alchs',
				value: favouriteAlchsAutocompleteValue
			})
		);
	});

	test('preserves fallback configuration when editing primary preference', async () => {
		const fletchable = zeroTimeFletchables.find(item => item.name === 'Steel dart');
		expect(fletchable).toBeDefined();
		if (!fletchable) return;

		const alchItem = Items.getOrThrow('Yew longbow');
		const user = await createTestUser(
			new Bank().add('Nature rune', 200).add('Fire rune', 500).add(alchItem.id, 200),
			{
				skills_magic: convertLVLtoXP(75),
				skills_fletching: convertLVLtoXP(75)
			}
		);

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

		await user.runCommand(zeroTimeActivityCommand, {
			set: {
				primary_type: 'alch',
				primary_item: alchItem.name
			}
		});
		await user.sync();

		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBe(alchItem.id);
		expect(user.user.zero_time_activity_fallback_type).toBe('fletch');
		expect(user.user.zero_time_activity_fallback_item).toBe(fletchable.id);
	});
});
