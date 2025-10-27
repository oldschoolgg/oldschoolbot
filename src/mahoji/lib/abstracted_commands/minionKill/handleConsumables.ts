import { randInt } from '@oldschoolgg/rng';
import { reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { EItem, itemID } from 'oldschooljs';

import { getSimilarItems } from '@/lib/data/similarItems.js';
import type { Consumable } from '@/lib/minions/types.js';
import { FloatBank } from '@/lib/structures/Bank.js';
import type { GearBank } from '@/lib/structures/GearBank.js';

// TODO: should use a FloatBank instead of a Bank
const calculateTripConsumableCost = (c: Consumable, quantity: number, duration: number) => {
	const consumableCost = c.itemCost.clone();
	if (c.qtyPerKillRange) {
		consumableCost.multiply(Math.ceil(c.qtyPerKillRange[1] * quantity));
	} else if (c.qtyPerKill) {
		consumableCost.multiply(Math.ceil(c.qtyPerKill * quantity));
	} else if (c.qtyPerMinute) {
		consumableCost.multiply(Math.ceil((c.qtyPerMinute * duration) / Time.Minute));
	}
	return consumableCost;
};

export function getItemCostFromConsumables({
	consumableCosts,
	gearBank,
	timeToFinish,
	maxTripLength,
	inputQuantity,
	slayerKillsRemaining
}: {
	timeToFinish: number;
	consumableCosts: Consumable[];
	gearBank: GearBank;
	maxTripLength: number;
	inputQuantity: number | undefined;
	slayerKillsRemaining: number | null;
}) {
	const quantity = inputQuantity ?? Math.floor(maxTripLength / timeToFinish);
	const duration = timeToFinish * quantity;
	const floatCostsPerKill = new FloatBank();
	const boosts: { message: string; boostPercent: number }[] = [];
	const consumablesUsed: {
		consumable: Consumable;
		perKillValue: number;
		range: [number, number] | null;
		runeReductionMultiplier: number | null;
	}[] = [];
	const hasKodaiEquipped = gearBank.hasEquipped('Kodai wand');
	const hasSOTDEquipped = !hasKodaiEquipped && gearBank.hasEquipped('Staff of the dead');

	for (const cc of consumableCosts) {
		const flatConsumables = [cc, ...(cc.alternativeConsumables ?? [])];
		const consumable =
			flatConsumables.find(c => gearBank.bank.has(calculateTripConsumableCost(c, quantity, duration))) ?? cc;
		if (consumable.optional && !gearBank.bank.has(calculateTripConsumableCost(cc, quantity, duration))) {
			continue;
		}

		let itemMultiple: number | null = null;
		const range = consumable.qtyPerKillRange ?? null;
		if (range) {
			itemMultiple = range[1];
		} else if (typeof consumable.qtyPerKill === 'number') {
			itemMultiple = consumable.qtyPerKill;
		} else if (typeof consumable.qtyPerMinute === 'number') {
			itemMultiple = consumable.qtyPerMinute;
		}
		if (itemMultiple !== null) {
			let runeReductionMultiplier: number | null = null;

			if (consumable.isRuneCost) {
				// Free casts for kodai + sotd
				if (hasKodaiEquipped) {
					itemMultiple = Math.ceil(0.85 * itemMultiple);
					runeReductionMultiplier = range ? 0.85 : null;
				} else if (hasSOTDEquipped) {
					itemMultiple = Math.ceil((6 / 7) * itemMultiple);
					runeReductionMultiplier = range ? 6 / 7 : null;
				}
			}

			const multiply =
				consumable.qtyPerMinute && !range ? (timeToFinish / Time.Minute) * itemMultiple : itemMultiple;

			for (const [item, qty] of consumable.itemCost.items()) {
				floatCostsPerKill.add(item.id, qty * multiply);
				consumablesUsed.push({
					consumable,
					perKillValue: multiply,
					range,
					runeReductionMultiplier
				});
			}
			if (consumable.boostPercent) {
				timeToFinish = reduceNumByPercent(timeToFinish, consumable.boostPercent);
				boosts.push({
					message: `${consumable.boostPercent}% for ${consumable.itemCost
						.items()
						.map(i => i[0].name)
						.join(', ')}`,
					boostPercent: consumable.boostPercent
				});
			}
		}
	}

	const hasInfiniteWaterRunes = gearBank.hasEquipped(getSimilarItems(itemID('Staff of water')), false);

	if (hasInfiniteWaterRunes) {
		floatCostsPerKill.remove(EItem.WATER_RUNE, floatCostsPerKill.amount(EItem.WATER_RUNE));
	}

	const maxBasedOnTime = Math.floor(maxTripLength / timeToFinish);
	const maxCanKillWithItemCost =
		consumableCosts.length === 0
			? Number.POSITIVE_INFINITY
			: floatCostsPerKill.length() === 0
				? Number.POSITIVE_INFINITY
				: Math.floor(floatCostsPerKill.fits(gearBank.bank));
	const maxAllowed = Math.min(maxBasedOnTime, maxCanKillWithItemCost);
	let finalQuantity = Math.max(1, inputQuantity ? Math.min(inputQuantity, maxAllowed) : maxAllowed) ?? maxAllowed;
	if (slayerKillsRemaining && finalQuantity > slayerKillsRemaining) {
		finalQuantity = slayerKillsRemaining;
	}
	const tripCost = new FloatBank();
	for (const used of consumablesUsed) {
		if (used.range) {
			let total = 0;
			for (let i = 0; i < finalQuantity; i++) {
				total += randInt(used.range[0], used.range[1]);
			}
			if (used.runeReductionMultiplier) {
				total = Math.ceil(total * used.runeReductionMultiplier);
			}
			for (const [item, qty] of used.consumable.itemCost.items()) {
				tripCost.add(item.id, qty * total);
			}
		} else {
			const total = used.perKillValue * finalQuantity;
			for (const [item, qty] of used.consumable.itemCost.items()) {
				tripCost.add(item.id, qty * total);
			}
		}
	}

	if (hasInfiniteWaterRunes) {
		tripCost.remove(EItem.WATER_RUNE, tripCost.amount(EItem.WATER_RUNE));
	}

	const itemCost = tripCost.toItemBankRoundedUp();

	if (consumableCosts.length === 0) {
		return {
			finalQuantity,
			timeToFinish
		};
	}

	return {
		itemCost,
		finalQuantity,
		boosts,
		timeToFinish
	};
}
