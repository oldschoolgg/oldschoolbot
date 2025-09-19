import type { zero_time_activity_type_enum } from '@prisma/client';
import { Time } from 'e';
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

export interface ZeroTimeActivitySettings {
	type: ZeroTimeActivityType;
	itemID: number | null;
}

export type ZeroTimeActivityResult =
	| {
			type: 'alch';
			item: Item;
			quantity: number;
			bankToRemove: Bank;
			bankToAdd: Bank;
			timePerAction: number;
	  }
	| {
			type: 'fletch';
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
        quantityOverride?: number;
        itemsPerHour?: number;
}

type AttemptZeroTimeActivityOptions =
        | (BaseAttemptZeroTimeActivityOptions & {
                        type: 'alch';
                        variant?: 'agility' | 'default';
          })
        | (BaseAttemptZeroTimeActivityOptions & { type: 'fletch' });

export function getZeroTimeActivitySettings(user: MUser): ZeroTimeActivitySettings | null {
	const type = user.user.zero_time_activity_type;
	if (!type) {
		return null;
	}
	return {
		type,
		itemID: user.user.zero_time_activity_item ?? null
	};
}

function resolveConfiguredAlchItem(settings: ZeroTimeActivitySettings | null): Item | null {
	if (!settings?.itemID) {
		return null;
	}
	const item = Items.get(settings.itemID);
	if (!item || !item.highalch || !item.tradeable) {
		return null;
	}
	return item;
}

function resolveZeroTimeFletchable(settings: ZeroTimeActivitySettings | null): Fletchable | null {
	if (!settings?.itemID) {
		return null;
	}
	return zeroTimeFletchables.find(item => item.id === settings.itemID) ?? null;
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

function calculateAlching(
        options: Extract<AttemptZeroTimeActivityOptions, { type: 'alch' }>,
        settings: ZeroTimeActivitySettings | null
): ZeroTimeActivityResponse {
        const { user, duration, itemsPerHour, quantityOverride } = options;
        const variant = options.variant ?? 'default';

        if (user.skillLevel('magic') < 55) {
                return { result: null, message: 'You need level 55 Magic to perform zero time alching.' };
        }

        const itemFromSettings = resolveConfiguredAlchItem(settings);
        const durationPerCast = variant === 'agility' ? timePerAlchAgility : timePerAlch;

	let itemToAlch: Item | null = itemFromSettings;
	if (!itemToAlch) {
		const favorites = user.favAlchs(duration, variant === 'agility');
		itemToAlch = favorites[0] ?? null;
	}

	if (!itemToAlch) {
		return settings?.type === 'alch'
			? {
					result: null,
					message:
						'No suitable item found for zero time alching. Update your configuration or add favorite alchs.'
				}
			: { result: null };
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
                        item: itemToAlch,
                        quantity: maxCasts,
                        bankToRemove,
                        bankToAdd,
                        timePerAction
                }
        };
}

function calculateFletching(
        options: Extract<AttemptZeroTimeActivityOptions, { type: 'fletch' }>,
        settings: ZeroTimeActivitySettings | null
): ZeroTimeActivityResponse {
        const { user, duration, itemsPerHour, quantityOverride } = options;
        const fletchable = resolveZeroTimeFletchable(settings);
	if (!fletchable) {
		if (settings?.type === 'fletch') {
			return {
				result: null,
				message:
					'Your zero time fletching item is not set or is no longer valid. Use /zero_time_activity to configure it.'
			};
		}
		return { result: null };
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
                        fletchable,
                        quantity,
                        itemsToRemove: itemsNeeded,
                        timePerAction: overrideUsed ? duration / quantity : timePerItem
                }
        };
}

export function attemptZeroTimeActivity(options: AttemptZeroTimeActivityOptions): ZeroTimeActivityResponse {
        const settings = getZeroTimeActivitySettings(options.user);
        if (!settings || settings.type !== options.type) {
                return { result: null };
        }

        if (options.type === 'alch') {
                return calculateAlching(options, settings);
        }

        return calculateFletching(options, settings);
}
