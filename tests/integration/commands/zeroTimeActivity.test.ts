import { type APIMessageComponentInteraction, InteractionType } from '@oldschoolgg/discord';
import { Bank, convertLVLtoXP, Items } from 'oldschooljs';
import { afterEach, describe, expect, test, vi } from 'vitest';

import { BitField } from '../../../src/lib/constants.js';
import { InteractionID } from '../../../src/lib/InteractionID.js';
import { zeroTimeFletchables } from '../../../src/lib/skilling/skills/fletching/fletchables/index.js';
import { globalButtonInteractionHandlerWrapper } from '../../../src/lib/util/globalInteractions.js';
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
import { mockInteraction } from '../../test-utils/mockInteraction.js';
import { createTestUser } from '../util.js';

function extractResponseText(response: unknown): string {
	if (typeof response === 'string') return response;
	return (response as { content?: string })?.content ?? '';
}

type ZeroTimeCommandOption = (typeof zeroTimeActivityCommand.options)[number];
type SetSubcommand = Extract<ZeroTimeCommandOption, { type: 'Subcommand'; name: 'set' }>;
type SetSubcommandOption = NonNullable<SetSubcommand['options']>[number];
type StringOption = Extract<SetSubcommandOption, { type: 'String' }>;

function getSetAutocompleteOption(name: 'primary_item' | 'fallback_item') {
	const setSubcommand = zeroTimeActivityCommand.options.find(
		(option): option is SetSubcommand => option.type === 'Subcommand' && option.name === 'set'
	);

	expect(setSubcommand).toBeDefined();
	const option = setSubcommand?.options?.find(
		(opt): opt is StringOption => opt.type === 'String' && opt.name === name
	);
	expect(option).toBeDefined();
	expect(typeof option?.autocomplete).toBe('function');
	return option!;
}

describe('Zero Time Activity Command', () => {
	const automaticSelectionText = 'Primary: Alch (automatic favourites)';

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	test('overview swap button refreshes preferences and rejects other users', async () => {
		const owner = await createTestUser(new Bank(), {
			bitfield: [BitField.ZeroTimeActivitiesPaused],
			zero_time_activity_primary_type: 'alch',
			zero_time_activity_fallback_type: 'fletch',
			zero_time_activity_fallback_item: Items.getOrThrow('Steel dart').id
		});
		const overview = (await owner.runCommand(zeroTimeActivityCommand, { overview: {} })) as BaseSendableMessage;
		const button = overview.components?.flat()[0];
		expect(button).toBeDefined();
		const customID = `${InteractionID.Commands.SwapZeroTimeActivities}_${owner.id}`;
		expect(button?.toJSON()).toEqual(expect.objectContaining({ label: 'Swap', custom_id: customID }));
		vi.stubGlobal('globalClient', Object.assign(Object.create(globalClient), { emitUserLog: vi.fn() }));
		vi.spyOn(Cache, 'tryRatelimit').mockResolvedValue({ success: true });
		const interaction = mockInteraction({ user: owner });
		Object.assign(interaction.rawInteraction, {
			type: InteractionType.MessageComponent,
			data: { custom_id: customID }
		});
		interaction.update = vi.fn().mockResolvedValue(undefined);
		const reply = vi.spyOn(interaction, 'reply');
		await globalButtonInteractionHandlerWrapper(
			interaction.rawInteraction as APIMessageComponentInteraction,
			interaction
		);
		expect(interaction.update).toHaveBeenCalledWith(
			expect.objectContaining({
				content: expect.stringContaining('Primary: Fletch Steel dart'),
				components: expect.any(Array)
			})
		);
		expect(reply).not.toHaveBeenCalled();
		await owner.sync();
		expect(owner.user.zero_time_activity_primary_type).toBe('fletch');
		expect(owner.user.zero_time_activity_fallback_type).toBe('alch');
		expect(owner.bitfield).toContain(BitField.ZeroTimeActivitiesPaused);

		const other = await createTestUser(new Bank(), {
			zero_time_activity_primary_type: 'alch',
			zero_time_activity_fallback_type: 'fletch',
			zero_time_activity_fallback_item: Items.getOrThrow('Steel dart').id
		});
		const otherInteraction = mockInteraction({ user: other });
		Object.assign(otherInteraction.rawInteraction, {
			type: InteractionType.MessageComponent,
			data: { custom_id: customID }
		});
		const otherReply = vi.spyOn(otherInteraction, 'reply');
		await globalButtonInteractionHandlerWrapper(
			otherInteraction.rawInteraction as APIMessageComponentInteraction,
			otherInteraction
		);
		expect(otherReply).toHaveBeenCalledWith({
			content: 'You can only change activities from your own zero-time overview.',
			ephemeral: true
		});
		await other.sync();
		expect(other.user.zero_time_activity_primary_type).toBe('alch');
		await owner.sync();
		expect(owner.user.zero_time_activity_primary_type).toBe('fletch');
	});

	test.each([
		'primary',
		'fallback',
		'neither'
	] as const)('overview has no swap button when only %s is configured', async role => {
		const user = await createTestUser(new Bank(), {
			zero_time_activity_primary_type: role === 'primary' ? 'alch' : null,
			zero_time_activity_fallback_type: role === 'fallback' ? 'alch' : null
		});
		const overview = (await user.runCommand(zeroTimeActivityCommand, { overview: {} })) as BaseSendableMessage;
		expect(overview.components?.flat().map(button => button.toJSON())).toEqual([
			expect.objectContaining({ label: 'Pause' })
		]);
		expect(overview.content).toMatch(/Status: Live$/);
	});

	test('status button toggles and refreshes the overview while protecting its owner', async () => {
		const owner = await createTestUser(new Bank(), { bitfield: [BitField.DisableDailyButton] });
		const customID = `${InteractionID.Commands.ToggleZeroTimeActivities}_${owner.id}`;
		vi.stubGlobal('globalClient', Object.assign(Object.create(globalClient), { emitUserLog: vi.fn() }));
		vi.spyOn(Cache, 'tryRatelimit').mockResolvedValue({ success: true });

		for (const [status, label] of [
			['Paused', 'Resume'],
			['Live', 'Pause']
		] as const) {
			const interaction = mockInteraction({ user: owner });
			Object.assign(interaction.rawInteraction, {
				type: InteractionType.MessageComponent,
				data: { custom_id: customID }
			});
			const update = vi.fn<(message: BaseSendableMessage) => Promise<undefined>>().mockResolvedValue(undefined);
			interaction.update = update;
			const reply = vi.spyOn(interaction, 'reply');
			await globalButtonInteractionHandlerWrapper(
				interaction.rawInteraction as APIMessageComponentInteraction,
				interaction
			);
			expect(reply).not.toHaveBeenCalled();
			const message = update.mock.calls[0][0] as BaseSendableMessage;
			expect(message.content).toMatch(new RegExp(`Status: ${status}$`));
			expect(message.components?.flat().map(button => button.toJSON())).toContainEqual(
				expect.objectContaining({ label, custom_id: customID })
			);
			await owner.sync();
			expect(owner.bitfield.includes(BitField.ZeroTimeActivitiesPaused)).toBe(status === 'Paused');
			expect(owner.bitfield).toContain(BitField.DisableDailyButton);
		}

		const other = await createTestUser(new Bank());
		const interaction = mockInteraction({ user: other });
		Object.assign(interaction.rawInteraction, {
			type: InteractionType.MessageComponent,
			data: { custom_id: customID }
		});
		const reply = vi.spyOn(interaction, 'reply');
		await globalButtonInteractionHandlerWrapper(
			interaction.rawInteraction as APIMessageComponentInteraction,
			interaction
		);
		expect(reply).toHaveBeenCalledWith({
			content: 'You can only change activities from your own zero-time overview.',
			ephemeral: true
		});
		await owner.sync();
		await other.sync();
		expect(owner.bitfield).toEqual([BitField.DisableDailyButton]);
		expect(other.bitfield).not.toContain(BitField.ZeroTimeActivitiesPaused);
	});

	test('shows capacity limited by fletching supplies without withdrawing them', async () => {
		const bank = new Bank().add('Steel dart tip', 1500).add('Feather', 1200);
		const user = await createTestUser(bank, {
			skills_fletching: convertLVLtoXP(75),
			zero_time_activity_primary_type: 'fletch',
			zero_time_activity_primary_item: Items.getOrThrow('Steel dart').id
		});

		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(overview)).toContain('Ready (supplies for 1,200 Steel dart)');
		expect(extractResponseText(overview)).toContain('Fallback: Not set');
		await user.bankMatch(bank);
	});

	test('accounts for fletching recipes requiring several feathers per output', async () => {
		const user = await createTestUser(new Bank().add('Ogre arrow shaft', 25).add('Feather', 90), {
			skills_fletching: convertLVLtoXP(75),
			zero_time_activity_primary_type: 'fletch',
			zero_time_activity_primary_item: Items.getOrThrow('Flighted ogre arrow').id
		});

		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(overview)).toContain('supplies for 22 Flighted ogre arrow');
	});

	test.each([
		{ natureRunes: 200, fireRunes: 500, bows: 200, capacity: 100 },
		{ natureRunes: 40, fireRunes: 500, bows: 200, capacity: 40 },
		{ natureRunes: 200, fireRunes: 500, bows: 30, capacity: 30 }
	])('shows alch capacity for $capacity casts', async ({ natureRunes, fireRunes, bows, capacity }) => {
		const user = await createTestUser(
			new Bank().add('Nature rune', natureRunes).add('Fire rune', fireRunes).add('Yew longbow', bows),
			{
				skills_magic: convertLVLtoXP(75),
				zero_time_activity_primary_type: 'alch',
				zero_time_activity_primary_item: Items.getOrThrow('Yew longbow').id
			}
		);

		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(overview)).toContain(`supplies for ${capacity} casts of Yew longbow`);
	});

	test('accounts for infinite fire runes and names the automatically selected alch', async () => {
		const user = await createTestUser(new Bank().add('Nature rune', 200).add('Yew longbow', 150), {
			skills_magic: convertLVLtoXP(75),
			favorite_alchables: [Items.getOrThrow('Yew longbow').id],
			zero_time_activity_primary_type: 'alch'
		});
		await user.equip('skilling', [Items.getOrThrow('Staff of fire').id]);

		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(overview)).toContain('Primary: Alch (automatic favourites) -- Ready');
		expect(extractResponseText(overview)).toContain('supplies for 150 casts of Yew longbow');
	});

	test('retains blockers when supplies are missing', async () => {
		const user = await createTestUser(new Bank(), {
			skills_fletching: convertLVLtoXP(75),
			zero_time_activity_primary_type: 'fletch',
			zero_time_activity_primary_item: Items.getOrThrow('Steel dart').id
		});

		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(overview)).toContain("You don't have the supplies required to fletch Steel dart.");
		expect(extractResponseText(overview)).not.toContain('Ready');
	});

	test('swaps both types and items while preserving pause and automatic alch selection', async () => {
		const dartID = Items.getOrThrow('Steel dart').id;
		const user = await createTestUser(new Bank(), {
			bitfield: [BitField.ZeroTimeActivitiesPaused, BitField.DisableDailyButton],
			zero_time_activity_primary_type: 'alch',
			zero_time_activity_primary_item: null,
			zero_time_activity_fallback_type: 'fletch',
			zero_time_activity_fallback_item: dartID
		});

		const response = await user.runCommand(zeroTimeActivityCommand, { swap: {} });
		expect(response).toContain('Primary: Fletch Steel dart');
		expect(response).toContain('Fallback: Alch (automatic favourites)');
		expect(response).toMatch(/Status: Paused$/);
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('fletch');
		expect(user.user.zero_time_activity_primary_item).toBe(dartID);
		expect(user.user.zero_time_activity_fallback_type).toBe('alch');
		expect(user.user.zero_time_activity_fallback_item).toBeNull();
		expect(user.bitfield).toEqual([BitField.ZeroTimeActivitiesPaused, BitField.DisableDailyButton]);

		await user.runCommand(zeroTimeActivityCommand, { swap: {} });
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe('alch');
		expect(user.user.zero_time_activity_primary_item).toBeNull();
		expect(user.user.zero_time_activity_fallback_type).toBe('fletch');
		expect(user.user.zero_time_activity_fallback_item).toBe(dartID);
	});

	test.each(['primary', 'fallback'] as const)('rejects swapping when only %s is configured', async role => {
		const user = await createTestUser(new Bank(), {
			zero_time_activity_primary_type: role === 'primary' ? 'alch' : null,
			zero_time_activity_fallback_type: role === 'fallback' ? 'alch' : null
		});

		const response = await user.runCommand(zeroTimeActivityCommand, { swap: {} });
		expect(response).toContain('Set both a primary and fallback');
		await user.sync();
		expect(user.user.zero_time_activity_primary_type).toBe(role === 'primary' ? 'alch' : null);
		expect(user.user.zero_time_activity_fallback_type).toBe(role === 'fallback' ? 'alch' : null);
	});

	test('pause command toggles without losing preferences or other settings', async () => {
		const dartID = Items.getOrThrow('Steel dart').id;
		const user = await createTestUser(new Bank().add('Steel dart tip', 500).add('Feather', 500), {
			skills_fletching: convertLVLtoXP(75),
			bitfield: [BitField.DisableDailyButton],
			zero_time_activity_primary_type: 'fletch',
			zero_time_activity_primary_item: dartID,
			zero_time_activity_fallback_type: 'alch'
		});
		const savedPreferences = getZeroTimeActivityPreferences(user);

		await user.runCommand(zeroTimeActivityCommand, { pause: {} });
		await user.sync();
		expect(getZeroTimeActivityPreferences(user)).toEqual([]);
		expect(getZeroTimeActivityPreferences(user, { includePaused: true })).toEqual(savedPreferences);
		expect(user.bitfield).toEqual([BitField.DisableDailyButton, BitField.ZeroTimeActivitiesPaused]);
		const overview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(overview)).toMatch(/Status: Paused$/);
		expect(extractResponseText(overview)).toContain(
			'Primary: Fletch Steel dart -- Paused (supplies for 500 Steel dart)'
		);
		expect(extractResponseText(overview)).not.toContain('Ready');

		const resumed = await user.runCommand(zeroTimeActivityCommand, { pause: {} });
		expect(extractResponseText(resumed)).toMatch(/Status: Live$/);
		await user.sync();
		expect(getZeroTimeActivityPreferences(user)).toEqual(savedPreferences);
		expect(user.bitfield).toEqual([BitField.DisableDailyButton]);
		await user.runCommand(zeroTimeActivityCommand, { resume: {} });
		await user.runCommand(zeroTimeActivityCommand, { resume: {} });
		await user.sync();
		expect(getZeroTimeActivityPreferences(user)).toEqual(savedPreferences);
		expect(user.bitfield).toEqual([BitField.DisableDailyButton]);
	});

	test('allows editing paused preferences and clears pause when resetting', async () => {
		const user = await createTestUser(new Bank(), { bitfield: [BitField.DisableDailyButton] });
		await user.runCommand(zeroTimeActivityCommand, { pause: {} });
		const emptyOverview = await user.runCommand(zeroTimeActivityCommand, { overview: {} });
		expect(extractResponseText(emptyOverview)).toMatch(/Status: Paused$/);
		expect(extractResponseText(emptyOverview)).toContain('no zero-time activity configured');

		const response = await user.runCommand(zeroTimeActivityCommand, { set: { primary_type: 'alch' } });
		expect(response).toContain(automaticSelectionText);
		expect(response).toContain('activities are paused');
		await user.sync();
		expect(getZeroTimeActivityPreferences(user)).toEqual([]);

		await user.runCommand(zeroTimeActivityCommand, { clear: {} });
		await user.sync();
		expect(getZeroTimeActivityPreferences(user, { includePaused: true })).toEqual([]);
		expect(user.bitfield).toEqual([BitField.DisableDailyButton]);
	});

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
		expect(extractResponseText(summary)).toContain('Primary: Alch Yew longbow');

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
		expect(extractResponseText(summary)).toContain(automaticSelectionText);
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
		expect(extractResponseText(overview)).toContain('Fallback: Fletch Steel dart');
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

		const primaryResults = await primaryAutocompleteOption.autocomplete?.({
			value: '',
			user,
			userId: user.id,
			guildId: null
		});
		const fallbackResults = await fallbackAutocompleteOption.autocomplete?.({
			value: '',
			user,
			userId: user.id,
			guildId: null
		});

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
