import { reduceNumByPercent, Time } from '@oldschoolgg/toolkit';
import { EItem, itemID } from 'oldschooljs';

import { getSimilarItems } from '@/lib/data/similarItems.js';
import type { Consumable } from '@/lib/minions/types.js';
import { FloatBank } from '@/lib/structures/Bank.js';
import type { GearBank } from '@/lib/structures/GearBank.js';

const buildPerKillCost = (consumable: Consumable, timeToFinish: number, gearBank: GearBank) => {
	const floatCostsPerKill = new FloatBank();
	let itemMultiple = consumable.qtyPerKill ?? consumable.qtyPerMinute ?? null;

	if (!itemMultiple) return floatCostsPerKill;

	if (consumable.isRuneCost) {
		// Free casts for kodai + sotd
		if (gearBank.hasEquipped('Kodai wand')) {
			itemMultiple = Math.ceil(0.85 * itemMultiple);
		} else if (gearBank.hasEquipped('Staff of the dead')) {
			itemMultiple = Math.ceil((6 / 7) * itemMultiple);
		}
	}

	const multiply = consumable.qtyPerMinute ? (timeToFinish / Time.Minute) * itemMultiple : itemMultiple;

	for (const [item, qty] of consumable.itemCost.items()) {
		floatCostsPerKill.add(item.id, qty * multiply);
	}

	return floatCostsPerKill;
};

const canCoverConsumable = (consumable: Consumable, quantity: number, timeToFinish: number, gearBank: GearBank) => {
	const perKillCost = buildPerKillCost(consumable, timeToFinish, gearBank);
	if (perKillCost.length() === 0) return true;
	return perKillCost
		.entries()
		.every(([item, qty]) => gearBank.bank.amount(Number(item)) >= Math.ceil(qty * quantity));
};

const selectConsumable = ({
	consumables,
	gearBank,
	timeToFinish,
	desiredQuantity
}: {
	consumables: Consumable[];
	gearBank: GearBank;
	timeToFinish: number;
	desiredQuantity: number;
}) => {
	const quantityToCheck = Math.max(1, desiredQuantity);
	for (const consumable of consumables) {
		if (canCoverConsumable(consumable, quantityToCheck, timeToFinish, gearBank)) return consumable;
	}

	let bestConsumable = consumables[0];
	let bestFits = -1;
	for (const consumable of consumables) {
		const perKillCost = buildPerKillCost(consumable, timeToFinish, gearBank);
		const fits = perKillCost.length() === 0 ? Number.POSITIVE_INFINITY : perKillCost.fits(gearBank.bank);
		if (fits > bestFits) {
			bestFits = fits;
			bestConsumable = consumable;
		}
	}

	return bestConsumable;
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
	const floatCostsPerKill = new FloatBank();
	const boosts: { message: string; boostPercent: number }[] = [];

	for (const cc of consumableCosts) {
		const flatConsumables = [cc, ...(cc.alternativeConsumables ?? [])];
		const consumable = selectConsumable({
			consumables: flatConsumables,
			gearBank,
			timeToFinish,
			desiredQuantity: quantity
		});
		if (consumable.optional && !canCoverConsumable(consumable, quantity, timeToFinish, gearBank)) {
			continue;
		}

		const perKillCost = buildPerKillCost(consumable, timeToFinish, gearBank);
		if (perKillCost.length() > 0) {
			for (const [item, qty] of perKillCost.entries()) {
				floatCostsPerKill.add(Number(item), qty);
			}
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
	const itemCost = floatCostsPerKill.multiply(finalQuantity).toItemBankRoundedUp();

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
