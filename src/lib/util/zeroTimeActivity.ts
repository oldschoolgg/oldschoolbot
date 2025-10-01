import { Time } from '@oldschoolgg/toolkit';
import type { zero_time_activity_type_enum } from '@prisma/client';
import { Bank, type Item, Items } from 'oldschooljs';

import { timePerAlch, timePerAlchAgility } from '../../mahoji/lib/abstracted_commands/alchCommand';
import { zeroTimeFletchables } from '../skilling/skills/fletching/fletchables';
import Arrows from '../skilling/skills/fletching/fletchables/arrows';
import Bolts from '../skilling/skills/fletching/fletchables/bolts';
import Darts from '../skilling/skills/fletching/fletchables/darts';
import Javelins from '../skilling/skills/fletching/fletchables/javelins';
import { AmethystBroadBolts, BroadArrows, BroadBolts } from '../skilling/skills/fletching/fletchables/slayer';
import TippedBolts from '../skilling/skills/fletching/fletchables/tippedBolts';
import TippedDragonBolts from '../skilling/skills/fletching/fletchables/tippedDragonBolts';
import type { Fletchable } from '../skilling/types';
import type { SlayerTaskUnlocksEnum } from '../slayer/slayerUnlocks';
import { hasSlayerUnlock } from '../slayer/slayerUtil';
import { unlimitedFireRuneProviders } from './unlimitedFireRuneProviders';

export type ZeroTimeActivityType = zero_time_activity_type_enum;
export type ZeroTimePreferenceRole = 'primary' | 'fallback';

export interface ZeroTimeActivityPreference {
	role: ZeroTimePreferenceRole;
	type: ZeroTimeActivityType;
	itemID: number | null;
}

export type ZeroTimePreferenceList = ZeroTimeActivityPreference[];

export type ZeroTimeActivityResult =
	| {
			type: 'alch';
			preference: ZeroTimeActivityPreference;
			item: Item;
			quantity: number;
			bankToRemove: Bank;
			bankToAdd: Bank;
			timePerAction: number;
	  }
	| {
			type: 'fletch';
			preference: ZeroTimeActivityPreference;
			fletchable: Fletchable;
			quantity: number;
			itemsToRemove: Bank;
			timePerAction: number;
	  };

export interface ZeroTimeActivityResponse {
	result: ZeroTimeActivityResult | null;
	message?: string;
}

interface BaseAttemptZeroTimeActivityOptions {
	user: MUser;
	duration: number;
	preference: ZeroTimeActivityPreference;
	quantityOverride?: number;
	itemsPerHour?: number;
}

export interface AttemptZeroTimeAlchOptions extends BaseAttemptZeroTimeActivityOptions {
	preference: ZeroTimeActivityPreference & { type: 'alch' };
	variant?: 'agility' | 'default';
}

export interface AttemptZeroTimeFletchOptions extends BaseAttemptZeroTimeActivityOptions {
	preference: ZeroTimeActivityPreference & { type: 'fletch' };
}

type ItemsPerHourResolver = number | ((preference: ZeroTimeActivityPreference) => number | undefined);

interface AttemptZeroTimeContextBase {
	disabledReason?: string;
	itemsPerHour?: ItemsPerHourResolver;
}

export interface AttemptZeroTimeAlchContext extends AttemptZeroTimeContextBase {
	variant?: 'agility' | 'default';
}

export type AttemptZeroTimeFletchContext = AttemptZeroTimeContextBase;

export interface AttemptZeroTimeActivityOptions {
	user: MUser;
	duration: number;
	preferences: ZeroTimePreferenceList;
	quantityOverride?: number;
	alch?: AttemptZeroTimeAlchContext;
	fletch?: AttemptZeroTimeFletchContext;
}

export interface AttemptZeroTimeActivityFailure {
	preference: ZeroTimeActivityPreference;
	message?: string;
}

export interface AttemptZeroTimeActivityOutcome {
	result: ZeroTimeActivityResult | null;
	failures: AttemptZeroTimeActivityFailure[];
}

export function getZeroTimePreferenceLabel(preference: ZeroTimeActivityPreference): string {
	const roleLabel = preference.role === 'primary' ? 'Primary' : 'Fallback';
	const typeLabel = preference.type === 'alch' ? 'alch' : 'fletch';
	return `${roleLabel} ${typeLabel}`;
}

export function describeZeroTimePreference(preference: ZeroTimeActivityPreference): string {
	if (preference.type === 'alch') {
		if (!preference.itemID) {
			return 'Alch (automatic favourites)';
		}
		const item = Items.get(preference.itemID);
		const itemName = item?.name ?? 'unknown item';
		return `Alch ${itemName}`;
	}

	const item = preference.itemID ? Items.get(preference.itemID) : null;
	const itemName = item?.name ?? 'unspecified fletchable';
	return `Fletch ${itemName}`;
}

export function formatZeroTimePreference(preference: ZeroTimeActivityPreference): string {
	const roleLabel = preference.role === 'primary' ? 'Primary' : 'Fallback';
	return `${roleLabel}: ${describeZeroTimePreference(preference)}`;
}

export function getZeroTimeActivityPreferences(user: MUser): ZeroTimePreferenceList {
	const preferences: ZeroTimePreferenceList = [];
	const { user: raw } = user;

	if (raw.zero_time_activity_primary_type) {
		preferences.push({
			role: 'primary',
			type: raw.zero_time_activity_primary_type,
			itemID: raw.zero_time_activity_primary_item ?? null
		});
	}

	if (raw.zero_time_activity_fallback_type) {
		preferences.push({
			role: 'fallback',
			type: raw.zero_time_activity_fallback_type,
			itemID: raw.zero_time_activity_fallback_item ?? null
		});
	}

	return preferences;
}

function resolveConfiguredAlchItem(preference: ZeroTimeActivityPreference): Item | null {
	if (!preference.itemID) {
		return null;
	}
	const item = Items.get(preference.itemID);
	if (!item || !item.highalch || !item.tradeable) {
		return null;
	}
	return item;
}

function resolveZeroTimeFletchable(preference: ZeroTimeActivityPreference): Fletchable | null {
	if (!preference.itemID) {
		return null;
	}
	return zeroTimeFletchables.find(item => item.id === preference.itemID) ?? null;
}

export function getZeroTimeFletchTime(fletchable: Fletchable): number | null {
	const mapping: { types: (Fletchable | Fletchable[])[]; time: number }[] = [
		{ types: [Darts, Bolts, BroadBolts], time: Time.Second * 0.2 },
		{
			types: [Arrows, BroadArrows, Javelins, TippedBolts, TippedDragonBolts, AmethystBroadBolts],
			time: Time.Second * 0.36
		}
	];
	for (const { types, time } of mapping) {
		if (types.some(type => (Array.isArray(type) ? type.includes(fletchable) : type === fletchable))) {
			return time;
		}
	}
	return null;
}

function calculateAlching(options: AttemptZeroTimeAlchOptions): ZeroTimeActivityResponse {
	const { user, duration, itemsPerHour, quantityOverride, preference } = options;
	const variant = options.variant ?? 'default';

	if (user.skillLevel('magic') < 55) {
		return { result: null, message: 'You need level 55 Magic to perform zero-time alching.' };
	}

	const itemFromSettings = resolveConfiguredAlchItem(preference);
	const durationPerCast = variant === 'agility' ? timePerAlchAgility : timePerAlch;

	let itemToAlch: Item | null = itemFromSettings;
	if (!itemToAlch) {
		const favorites = user.favAlchs(duration, variant === 'agility');
		itemToAlch = favorites[0] ?? null;
	}

	if (!itemToAlch) {
		return preference.itemID
			? {
					result: null,
					message:
						'Your zero-time alching item is not valid or no longer available. Update your configuration or add favourite alchs.'
				}
			: {
					result: null,
					message:
						'No suitable item found for zero-time alching. Add favourite alchs or configure a specific item.'
				};
	}

	const bank = user.bank;
	const alchItemQty = bank.amount(itemToAlch.id);
	const natureRunes = bank.amount('Nature rune');
	if (alchItemQty === 0 || natureRunes === 0) {
		return {
			result: null,
			message: `You're missing resources to alch ${itemToAlch.name}.`
		};
	}

	const fireRunes = bank.amount('Fire rune');
	const hasInfiniteFire = user.hasEquipped(unlimitedFireRuneProviders);

	const overrideUsed = quantityOverride !== undefined || itemsPerHour !== undefined;

	let desiredQuantity: number;
	if (quantityOverride !== undefined) {
		desiredQuantity = Math.floor(quantityOverride);
	} else if (itemsPerHour !== undefined) {
		desiredQuantity = Math.floor((itemsPerHour * duration) / Time.Hour);
	} else {
		desiredQuantity = Math.floor(duration / durationPerCast);
	}

	if (desiredQuantity <= 0) {
		if (!overrideUsed) {
			return {
				result: null,
				message: `You're missing resources to alch ${itemToAlch.name}.`
			};
		}
		return { result: null };
	}

	let maxCasts = Math.min(desiredQuantity, alchItemQty, natureRunes);
	if (!hasInfiniteFire) {
		maxCasts = Math.min(maxCasts, Math.floor(fireRunes / 5));
	}
	maxCasts = Math.floor(maxCasts);

	if (maxCasts <= 0) {
		return {
			result: null,
			message: `You're missing resources to alch ${itemToAlch.name}.`
		};
	}

	const bankToRemove = new Bank().add('Nature rune', maxCasts).add(itemToAlch.id, maxCasts);
	if (!hasInfiniteFire) {
		bankToRemove.add('Fire rune', maxCasts * 5);
	}

	if (!user.owns(bankToRemove)) {
		return {
			result: null,
			message: `You're missing resources to alch ${itemToAlch.name}.`
		};
	}

	const alchGP = (itemToAlch.highalch ?? 0) * maxCasts;
	const bankToAdd = new Bank().add('Coins', alchGP);
	const timePerAction = overrideUsed ? duration / maxCasts : durationPerCast;

	return {
		result: {
			type: 'alch',
			preference,
			item: itemToAlch,
			quantity: maxCasts,
			bankToRemove,
			bankToAdd,
			timePerAction
		}
	};
}

function calculateFletching(options: AttemptZeroTimeFletchOptions): ZeroTimeActivityResponse {
	const { user, duration, itemsPerHour, quantityOverride, preference } = options;

	if (!preference.itemID) {
		return {
			result: null,
			message: 'You must configure a zero-time fletching item before this preference can be used.'
		};
	}

	const fletchable = resolveZeroTimeFletchable(preference);
	if (!fletchable) {
		return {
			result: null,
			message:
				'Your zero-time fletching item is not set or is no longer valid. Use /zero_time_activity to configure it.'
		};
	}

	if (user.skillLevel('fletching') < fletchable.level) {
		return {
			result: null,
			message: `${user.minionName} needs ${fletchable.level} Fletching to fletch ${fletchable.name}.`
		};
	}

	if (fletchable.requiredSlayerUnlocks) {
		const { success } = hasSlayerUnlock(
			user.user.slayer_unlocks as SlayerTaskUnlocksEnum[],
			fletchable.requiredSlayerUnlocks
		);
		if (!success) {
			return {
				result: null,
				message: `You don't have the required Slayer unlocks to fletch ${fletchable.name}.`
			};
		}
	}

	const timePerItem = getZeroTimeFletchTime(fletchable);
	if (!timePerItem) {
		return {
			result: null,
			message: 'There was an error determining the fletching speed for your configured item.'
		};
	}

	const overrideUsed = quantityOverride !== undefined || itemsPerHour !== undefined;
	const outputMultiple = fletchable.outputMultiple ?? 1;

	let desiredQuantity: number;
	if (quantityOverride !== undefined) {
		desiredQuantity = Math.floor(quantityOverride);
	} else if (itemsPerHour !== undefined) {
		desiredQuantity = Math.floor((itemsPerHour * duration) / Time.Hour / outputMultiple);
	} else {
		desiredQuantity = Math.floor(duration / timePerItem);
	}

	if (desiredQuantity <= 0) {
		return { result: null };
	}

	const maxSets = user.bank.fits(fletchable.inputItems);
	if (maxSets === 0) {
		return {
			result: null,
			message: `You don't have the supplies required to fletch ${fletchable.name}.`
		};
	}
	const quantity = Math.min(desiredQuantity, maxSets);

	if (quantity <= 0) {
		return {
			result: null,
			message: `You don't have the supplies required to fletch ${fletchable.name}.`
		};
	}

	const itemsNeeded = fletchable.inputItems.clone().multiply(quantity);
	if (!user.bankWithGP.has(itemsNeeded)) {
		return {
			result: null,
			message: `You don't have the supplies required to fletch ${fletchable.name}.`
		};
	}

	return {
		result: {
			type: 'fletch',
			preference,
			fletchable,
			quantity,
			itemsToRemove: itemsNeeded,
			timePerAction: overrideUsed ? duration / quantity : timePerItem
		}
	};
}

function attemptZeroTimePreference(
	options: AttemptZeroTimeAlchOptions | AttemptZeroTimeFletchOptions
): ZeroTimeActivityResponse {
	if (options.preference.type === 'alch') {
		return calculateAlching(options);
	}

	return calculateFletching(options);
}

export function attemptZeroTimeActivity(options: AttemptZeroTimeActivityOptions): AttemptZeroTimeActivityOutcome {
	const failures: AttemptZeroTimeActivityFailure[] = [];

	const resolveItemsPerHour = (
		resolver: ItemsPerHourResolver | undefined,
		preference: ZeroTimeActivityPreference
	): number | undefined => {
		if (typeof resolver === 'function') {
			return resolver(preference);
		}
		return resolver;
	};

	for (const preference of options.preferences) {
		if (preference.type === 'alch') {
			if (options.alch?.disabledReason) {
				failures.push({ preference, message: options.alch.disabledReason });
				continue;
			}
			const attempt = attemptZeroTimePreference({
				user: options.user,
				duration: options.duration,
				preference: preference as ZeroTimeActivityPreference & { type: 'alch' },
				quantityOverride: options.quantityOverride,
				itemsPerHour: resolveItemsPerHour(options.alch?.itemsPerHour, preference),
				variant: options.alch?.variant
			});

			if (attempt.result) {
				return { result: attempt.result, failures };
			}

			if (attempt.message) {
				failures.push({ preference, message: attempt.message });
			}
			continue;
		}

		if (options.fletch?.disabledReason) {
			failures.push({ preference, message: options.fletch.disabledReason });
			continue;
		}

		const attempt = attemptZeroTimePreference({
			user: options.user,
			duration: options.duration,
			preference: preference as ZeroTimeActivityPreference & { type: 'fletch' },
			quantityOverride: options.quantityOverride,
			itemsPerHour: resolveItemsPerHour(options.fletch?.itemsPerHour, preference)
		});

		if (attempt.result) {
			return { result: attempt.result, failures };
		}

		if (attempt.message) {
			failures.push({ preference, message: attempt.message });
		}
	}

	return { result: null, failures };
}
